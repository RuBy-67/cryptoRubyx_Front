/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /@next\/swc/ }
    ];
    return config;
  },
  images: {
    domains: ['cryptorubyx.rb-rubydev.fr'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  basePath: process.env.NODE_ENV === 'production' ? '/my-node-app' : '',
}

module.exports = nextConfig