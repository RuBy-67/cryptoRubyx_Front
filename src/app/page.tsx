'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Accéder au Dashboard
          </Link>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-4">
        <Link 
          href="/login"
          className="px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
        >
          Connexion
        </Link>
        <Link 
          href="/register"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          Créer un compte
        </Link>
      </div>
    );
  };

  const renderMainCTA = () => {
    if (isAuthenticated) {
      return (
        <Link 
          href="/dashboard"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-lg font-medium"
        >
          Accéder au Dashboard
        </Link>
      );
    }

    return (
      <div className="flex justify-center gap-4">
        <Link 
          href="/register"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-lg font-medium"
        >
          Commencer gratuitement
        </Link>
        <Link 
          href="/login"
          className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-lg font-medium"
        >
          Se connecter
        </Link>
      </div>
    );
  };

  const renderFinalCTA = () => {
    if (isAuthenticated) {
      return (
        <Link 
          href="/dashboard"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-lg font-medium inline-block"
        >
          Accéder au Dashboard
        </Link>
      );
    }

    return (
      <Link 
        href="/register"
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-lg font-medium inline-block"
      >
        Créer un compte gratuit
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white grid-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/logos/logoWithTxtWithoutBg.png" alt="CryptoRubyx" width={150} height={32} />
            </div>
            {renderAuthButtons()}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Gérez votre portfolio crypto
            <br />
            en toute simplicité
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
            Suivez vos actifs cryptos et NFTs en temps réel, analysez vos performances et prenez les meilleures décisions.
          </p>
          <div className="mt-10">
            {renderMainCTA()}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Fonctionnalités principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass p-6 rounded-2xl">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Suivi en temps réel</h3>
              <p className="text-gray-400">
                Visualisez l'évolution de votre portfolio et recevez des mises à jour en temps réel sur vos actifs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass p-6 rounded-2xl">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-wallets</h3>
              <p className="text-gray-400">
                Gérez plusieurs wallets sur différentes blockchains dans une seule interface unifiée.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass p-6 rounded-2xl">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sécurité maximale</h3>
              <p className="text-gray-400">
                Vos données sont chiffrées et sécurisées. Nous ne stockons jamais vos clés privées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Support complet des NFTs
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Visualisez votre collection de NFTs, suivez les prix planchers et restez informé des dernières ventes.
              </p>
              <ul className="space-y-4">
                {[
                  'Affichage des métadonnées et attributs',
                  'Prix plancher en temps réel',
                  'Historique des transactions',
                  'Support multi-chaînes'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass p-6 rounded-2xl">
              {/* Placeholder pour une démo visuelle des NFTs */}
              <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            {isAuthenticated ? 'Accédez à votre portfolio' : 'Prêt à commencer ?'}
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            {isAuthenticated 
              ? 'Retrouvez tous vos actifs et suivez leurs performances en temps réel.'
              : 'Rejoignez des milliers d\'utilisateurs qui font confiance à CryptoRubyx pour gérer leur portfolio crypto.'
            }
          </p>
          {renderFinalCTA()}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image src="/logos/logoWithTxtWithoutBg.png" alt="CryptoRubyx" width={120} height={25} />
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/whats-new" className="hover:text-white transition-colors">
                Nouveautés
              </Link>
              <Link href="/docs" className="hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/legal/terms" className="hover:text-white transition-colors">
                Conditions d'utilisation
              </Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} CryptoRubyx. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
} 