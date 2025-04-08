'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function WhatsNewPage() {
  const updates = [
    {
        date: 'Mai - Juin 2025',
        title: 'Optimisation API',
        description: 'Optimisation des call API pour un meilleur fonctionnement.',
        features: [
          'Optimisation des call API',
          'Suivit de Transaction',
          'Historique des transactions',
          'AI Invest - Mistral $$$',
          'Generation de CSVs Version 2',
          'Optimisation des Graphiques',
          'Plus de graphiques',
          '...'
        ]
      },
    {
      date: 'Avril 2025',
      title: 'Support Multi-Wallets',
      description: 'Ajout de la possibilité de gérer plusieurs wallets sur différentes blockchains.',
      features: [
        'Gestion de plusieurs wallets',
        'Support de différentes blockchains',
        'Vue consolidée du portfolio'
      ]
    },
    {
      date: '25 Mars 2025',
      title: 'Intégration NFTs',
      description: 'Amélioration du support des NFTs avec plus de détails et de fonctionnalités.',
      features: [
        'Affichage des attributs NFT',
        'Prix plancher en temps réel',
      ]
    },
    {
      date: '15 Mars 2025',
      title: 'Lancement de CryptoRubyx',
      description: 'Première version de CryptoRubyx avec les fonctionnalités de base.',
      features: [
        'Suivi du portfolio en temps réel',
        'Graphiques de performance',
        'Interface utilisateur intuitive'
      ]
    }
  ];

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
            Nouveautés et Mises à jour
          </h1>

          <div className="space-y-12">
            {updates.map((update, index) => (
              <div key={index} className="glass p-6 rounded-2xl relative">
                <div className="absolute -left-2 top-6 w-1 h-[calc(100%-2rem)] bg-blue-500/50"></div>
                <span className="text-sm text-blue-400">{update.date}</span>
                <h2 className="text-2xl font-semibold mt-2 mb-4">{update.title}</h2>
                <p className="text-gray-400 mb-6">{update.description}</p>
                <ul className="space-y-2">
                  {update.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 