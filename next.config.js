/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      '127.0.0.1'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.com'
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery'
      },
      {
        protocol: 'https',
        hostname: '*.replicate.delivery'
      }
    ]
  },
}

module.exports = nextConfig;