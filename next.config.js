/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'i.scdn.co', 'img.youtube.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }
    config.externals = [...(config.externals || []), 'undici']
    return config
  }
}

module.exports = nextConfig