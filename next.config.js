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
  },
  basePath: process.env.NODE_ENV === 'production' ? '/my-node-app' : '',
}