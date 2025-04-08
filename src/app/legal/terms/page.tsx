'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Image src="/logos/logoWithTxtWithoutBg.png" alt="CryptoRubyx" width={150} height={32} />
              </Link>
            </div>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Conditions d'utilisation
          </h1>

          <div className="space-y-8">
            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptation des conditions</h2>
              <p className="text-gray-400">
                En accédant et en utilisant CryptoRubyx, vous acceptez d'être lié par ces conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">2. Description du service</h2>
              <p className="text-gray-400 mb-4">
                CryptoRubyx est une plateforme de suivi de portfolio crypto permettant aux utilisateurs de :
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Suivre leurs actifs cryptographiques</li>
                <li>Visualiser leurs NFTs</li>
                <li>Analyser leurs performances</li>
                <li>Gérer plusieurs wallets</li>
              </ul>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">3. Comptes utilisateurs</h2>
              <p className="text-gray-400 mb-4">
                Pour utiliser certaines fonctionnalités de CryptoRubyx, vous devez créer un compte. Vous êtes responsable de :
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Maintenir la confidentialité de votre compte</li>
                <li>Toutes les activités qui se produisent sous votre compte</li>
                <li>Nous informer immédiatement de toute utilisation non autorisée</li>
              </ul>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">4. Propriété intellectuelle</h2>
              <p className="text-gray-400">
                Tout le contenu présent sur CryptoRubyx, incluant mais non limité aux textes, graphiques, logos, 
                icônes et images, est la propriété exclusive de CryptoRubyx et est protégé par les lois sur 
                la propriété intellectuelle.
              </p>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">5. Limitation de responsabilité</h2>
              <p className="text-gray-400">
                CryptoRubyx ne peut être tenu responsable des pertes financières liées à l'utilisation de notre 
                service. Les informations fournies ne constituent pas des conseils financiers et doivent être 
                utilisées à titre informatif uniquement.
              </p>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">6. Modifications des conditions</h2>
              <p className="text-gray-400">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications 
                prendront effet dès leur publication sur le site. Votre utilisation continue du service 
                après ces modifications constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
              <p className="text-gray-400">
                Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à 
                l'adresse suivante : support@cryptorubyx.com
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 