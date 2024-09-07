/** @type {import('next').NextConfig} */
// next.config.js
module.exports = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust this value as needed
    },
  },
};

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "*.replicate.delivery",
      },
    ],
  },
};

module.exports = nextConfig;
