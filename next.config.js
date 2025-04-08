/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Ignorer les avertissements de webpack pour les modules @next/swc
    config.ignoreWarnings = [
      { module: /@next\/swc/ }
    ];
    return config;
  },
}

module.exports = nextConfig 