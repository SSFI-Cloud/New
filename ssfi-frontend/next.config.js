/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'ssfi.in'],
    unoptimized: true,
  },
  reactStrictMode: true,
}

module.exports = nextConfig
