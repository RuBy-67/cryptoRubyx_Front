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
  // Configuration du serveur
  server: {
    port: process.env.PORT || 443, // Port par défaut 443 (HTTPS), sinon utilise la variable d'environnement PORT
    https: true, // Force HTTPS
  },
}

module.exports = nextConfig 