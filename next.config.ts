import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '2mb'
    },
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.devtool = false;
    }
    config.optimization.splitChunks = {
      chunks: 'all',
    };
    return config;
  },
  // Specify which routes should not use Edge Runtime
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
}

export default withBundleAnalyzer(nextConfig)
