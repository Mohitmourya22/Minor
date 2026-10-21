import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { HttpError, unauthorized } from "./http";

/**
 * Only a signed-in user whose Clerk "Public metadata" says {"role":"doctor"} gets through.
 * This is the REAL protection — hiding the page link is just cosmetic.
 * Returns the doctor's Clerk user id.
 */
export async function requireDoctor(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw unauthorized();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if ((user.publicMetadata as { role?: string } | undefined)?.role !== "doctor") {
    throw new HttpError(403, "FORBIDDEN", "This area is only for doctors.");
  }
  return userId;
}
