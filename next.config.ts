import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // @react-pdf/renderer has dependencies that don't work in SSR.
  // We only use it client-side via dynamic import with ssr: false, but
  // the build-time static analysis still needs to know to treat it as external.
  serverExternalPackages: ['@react-pdf/renderer'],
  transpilePackages: [],
}

export default nextConfig
