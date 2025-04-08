'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
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
            Politique de confidentialité
          </h1>

          <div className="space-y-8">
            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">1. Collecte des données</h2>
              <p className="text-gray-400 mb-4">
                Nous collectons les informations suivantes :
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Informations de compte (nom d'utilisateur, email)</li>
                <li>Adresses de wallets (publiques uniquement)</li>
                <li>Données de navigation et d'utilisation</li>
                <li>Préférences utilisateur</li>
              </ul>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">2. Utilisation des données</h2>
              <p className="text-gray-400 mb-4">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience</li>
                <li>Communiquer avec vous concernant votre compte</li>
                <li>Assurer la sécurité de votre compte</li>
              </ul>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">3. Protection des données</h2>
              <p className="text-gray-400">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles 
                contre tout accès, modification, divulgation ou destruction non autorisée. Ces mesures incluent 
                le chiffrement des données, l'authentification sécurisée et des audits réguliers de sécurité.
              </p>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">4. Partage des données</h2>
              <p className="text-gray-400">
                Nous ne vendons ni ne partageons vos données personnelles avec des tiers, sauf dans les cas suivants :
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 mt-4">
                <li>Avec votre consentement explicite</li>
                <li>Pour respecter des obligations légales</li>
                <li>Pour protéger nos droits et notre sécurité</li>
              </ul>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">5. Vos droits</h2>
              <p className="text-gray-400 mb-4">
                Vous disposez des droits suivants concernant vos données :
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
              <p className="text-gray-400">
                Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme. Vous pouvez 
                contrôler l'utilisation des cookies via les paramètres de votre navigateur. Notez que la 
                désactivation de certains cookies peut affecter la fonctionnalité du site.
              </p>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">7. Modifications de la politique</h2>
              <p className="text-gray-400">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                Les modifications seront publiées sur cette page avec une date de mise à jour. Nous vous 
                encourageons à consulter régulièrement cette page pour rester informé.
              </p>
            </section>

            <section className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
              <p className="text-gray-400">
                Pour toute question concernant notre politique de confidentialité ou pour exercer vos droits, 
                veuillez nous contacter à : privacy@cryptorubyx.com
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 