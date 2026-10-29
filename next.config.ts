import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Set by the Next.js security upgrade agent (16.4.0 → 16.4.3)
    agentUpgrade: 'security',
  },

  // Allow remote images (stamp, avatar, etc.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
