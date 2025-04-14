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
  assetPrefix: process.env.NODE_ENV === 'production' ? '/my-node-app' : '',
  trailingSlash: true,
  output: 'standalone',
  poweredByHeader: false,
}

module.exports = nextConfig