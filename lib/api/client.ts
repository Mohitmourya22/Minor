import { ENV } from "@/lib/config/env";
import { ApiError, friendlyMessage } from "./errors";

type TokenProvider = () => Promise<string | null>;
let tokenProvider: TokenProvider | null = null;

/** Called once by <AuthTokenBridge/> so the client can attach the Clerk session token. */
export function setAuthTokenProvider(fn: TokenProvider | null) {
  tokenProvider = fn;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown; // plain object (JSON) or FormData
  timeoutMs?: number;
}

/**
 * The ONLY place that talks to the backend (fetch lives here, nowhere else).
 * - attaches Authorization: Bearer <token>
 * - JSON handling, timeout, normalized errors
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, timeoutMs = ENV.API_TIMEOUT_MS, headers, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders = new Headers(headers);
  const token = tokenProvider ? await tokenProvider() : null;
  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body; // browser sets multipart boundary
  } else if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${ENV.API_BASE_URL}${endpoint}`, {
      ...rest,
      headers: finalHeaders,
      body: payload,
      signal: controller.signal,
    });
  } catch (e) {
    const timedOut = (e as Error).name === "AbortError";
    throw new ApiError(0, timedOut ? "TIMEOUT" : "NETWORK", timedOut
      ? "The request took too long. Please try again."
      : friendlyMessage(0));
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    // Our own API sends short, safe validation messages for 400 / 409; show those to the user.
    let msg = friendlyMessage(res.status);
    if (res.status === 400 || res.status === 409) {
      try {
        const j = await res.json();
        const m = j?.error?.message;
        if (typeof m === "string" && m.length < 300 && !m.startsWith("Invalid fields")) msg = m;
      } catch { /* keep the generic message */ }
    }
    throw new ApiError(res.status, "HTTP_ERROR", msg);
  }
  if (res.status === 204) return undefined as T;

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError(res.status, "MALFORMED_RESPONSE", "We received an unexpected response. Please try again.");
  }
}
