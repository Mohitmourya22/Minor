import type { NextConfig } from 'next'

/**
 * Security headers.
 * - The first group is ENFORCED and safe for every page.
 * - The CSP is REPORT-ONLY on purpose: it only logs problems in the browser console (F12 -> Console)
 *   and blocks nothing, so it can never break login or payment. After testing login + a payment with
 *   zero "Content-Security-Policy-Report-Only" warnings, rename it to Content-Security-Policy to enforce it.
 *   If you use a custom Clerk domain (clerk.your-domain.com) add it to script-src / connect-src / frame-src.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.razorpay.com https://img.clerk.com https://*.clerk.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://*.clerk.accounts.dev https://*.clerk.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com https://*.clerk.accounts.dev",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Content-Security-Policy-Report-Only', value: csp },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,

  experimental: {
    // Set by the Next.js security upgrade agent (16.4.0 → 16.4.3)
    agentUpgrade: 'security',
  },

  // Only Clerk profile pictures are loaded from outside; every other image is local.
  // (Allowing "**" would let anyone use our server as an image proxy.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
