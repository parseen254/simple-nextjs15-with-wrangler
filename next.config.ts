import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '2mb'
    },
  },
  // Specify which routes should not use Edge Runtime
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
}

export default nextConfig
