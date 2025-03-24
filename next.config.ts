import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev, defineCloudflareConfig } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '2mb'
    }
  },
  ...defineCloudflareConfig()
}

export default nextConfig
