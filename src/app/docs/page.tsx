"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface ContentItem {
  title: string;
  description: string;
  steps?: string[];
  features?: string[];
  points?: string[];
}

interface Chain {
  name: string;
  description: string;
}

const SUPPORTED_CHAINS: Record<string, Chain> = {
  ETHEREUM: {
    name: "Ethereum",
    description: "Réseau Ethereum principal",
  },
  POLYGON: {
    name: "Polygon",
    description: "Réseau Polygon (Matic)",
  },
  BSC: {
    name: "Binance Smart Chain",
    description: "Réseau Binance Smart Chain",
  },
  ARBITRUM: {
    name: "Arbitrum",
    description: "Réseau Arbitrum",
  },

  SOLANA: {
    name: "Solana",
    description: "Réseau Solana",
  },
  BASE: {
    name: "Base",
    description: "Réseau Base",
  },
  OPTIMISM: {
    name: "Optimism",
    description: "Réseau Optimism",
  },
  LINEA: {
    name: "Linea",
    description: "Réseau Linea",
  },
  AVALANCHE: {
    name: "Avalanche",
    description: "Réseau Avalanche",
  },
  FANTOM: {
    name: "Fantom",
    description: "Réseau Fantom",
  },
  CRONOS: {
    name: "Cronos",
    description: "Réseau Cronos",
  },
  GNOSIS: {
    name: "Gnosis",
    description: "Réseau Gnosis",
  },
  CHILLIZ: {
    name: "Chilliz",
    description: "Réseau Chilliz",
  },
  MOONBEAM: {
    name: "Moonbeam",
    description: "Réseau Moonbeam",
  },
  BLAST: {
    name: "Blast",
    description: "Réseau Blast",
  },
  ZKSYNC: {
    name: "ZkSync",
    description: "Réseau ZkSync",
  },
  MANTLE: {
    name: "Mantle",
    description: "Réseau Mantle",
  },
  OPBNB: {
    name: "OpBNB",
    description: "Réseau OpBNB",
  },
  POLYGON_ZKEVM: {
    name: "Polygon zkEVM",
    description: "Réseau Polygon zkEVM",
  },
  ZETACHAIN: {
    name: "ZetaChain",
    description: "Réseau ZetaChain",
  },
  FLOW: {
    name: "Flow",
    description: "Réseau Flow",
  },
  RONIN: {
    name: "Ronin",
    description: "Réseau Ronin",
  },
  LISK: {
    name: "Lisk",
    description: "Réseau Lisk",
  },
  PULSECHAIN: {
    name: "PulseChain",
    description: "Réseau PulseChain",
  },
};

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const sections = {
    "getting-started": {
      title: "Premiers pas",
      content: [
        {
          title: "Création de compte",
          description:
            "Pour commencer à utiliser CryptoRubyx, créez un compte en fournissant votre nom d'utilisateur et votre mot de passe.",
          steps: [
            'Cliquez sur "Créer un compte" sur la page d\'accueil',
            "Remplissez le formulaire avec vos informations",
            "Validez votre compte via l'email de confirmation",
          ],
        },
        {
          title: "Ajout de wallet",
          description:
            "Ajoutez vos wallets pour commencer à suivre vos actifs.",
          steps: [
            'Dans le dashboard, cliquez sur "Ajouter un wallet"',
            "Choisissez le type de blockchain",
            "Entrez l'adresse de votre wallet",
          ],
        },
        {
          title: "Ajout Clés API",
          description:
            "Ajoutez vos clés API pour commencer à suivre vos actifs.",
          steps: [
            'Dans le Profil, cliquez sur "Ajouter une clé API"',
            "Moralis : https://admin.moralis.com/",
            "Mistral : https://console.mistral.ai/api-keys",
            "Entrez votre clé API",
          ],
        },
      ] as ContentItem[],
    },
    "supported-wallets": {
      title: "Wallets Supportés",
      content: [
        {
          title: "Blockchains Supportées",
          description: "Liste des blockchains supportées par CryptoRubyx",
          features: Object.entries(SUPPORTED_CHAINS).map(
            ([key, chain]) => chain.name
          ),
        },
      ] as ContentItem[],
    },
    features: {
      title: "Fonctionnalités",
      content: [
        {
          title: "Suivi de portfolio",
          description:
            "Visualisez et analysez votre portfolio crypto en temps réel.",
          features: [
            "Vue d'ensemble du portfolio",
            "Graphiques de performance",
          ],
        },
        {
          title: "Gestion des NFTs",
          description: "Gérez et suivez votre collection de NFTs.",
          features: [
            "Visualisation des métadonnées",
            "Prix plancher en temps réel",
          ],
        },
      ] as ContentItem[],
    },
    security: {
      title: "Sécurité",
      content: [
        {
          title: "Protection des données",
          description:
            "Vos données sont sécurisées avec les meilleures pratiques de l'industrie.",
          points: [
            "Chiffrement de bout en bout",
            "Authentification à deux facteurs",
            "Stockage sécurisé des clés",
          ],
        },
      ] as ContentItem[],
    },
  };

  const renderChainGrid = () => {
    if (activeSection !== "supported-wallets") return null;

    const ChainImage = ({ chainName }: { chainName: string }) => {
      const [imageError, setImageError] = useState(false);


      return (
        <Image
          src="/logos/logoWithoutTxt.png"
          alt={chainName}
          width={64}
          height={64}
          className="rounded-full"
          onError={() => setImageError(true)}
          priority
        />
      );
    };

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
          <div
            key={key}
            className="glass p-4 rounded-xl flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 mb-3">
              <ChainImage chainName={chain.name} />
            </div>
            <h3 className="font-medium text-white">{chain.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{chain.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/logos/logoWithTxtWithoutBg.png"
                  alt="CryptoRubyx"
                  width={150}
                  height={32}
                />
              </Link>
            </div>
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <nav className="space-y-1">
                  {Object.entries(sections).map(([key, section]) => (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        activeSection === key
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                {sections[activeSection as keyof typeof sections].title}
              </h1>

              <div className="space-y-12">
                {sections[activeSection as keyof typeof sections].content.map(
                  (item, index) => (
                    <div key={index} className="glass p-6 rounded-2xl">
                      <h2 className="text-2xl font-semibold mb-4">
                        {item.title}
                      </h2>
                      <p className="text-gray-400 mb-6">{item.description}</p>
                      {activeSection !== "supported-wallets" && (
                        <ul className="space-y-2">
                          {(item.steps || item.features || item.points)?.map(
                            (point: string, pointIndex: number) => (
                              <li
                                key={pointIndex}
                                className="flex items-center text-gray-300"
                              >
                                <svg
                                  className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                {point}
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  )
                )}
                {renderChainGrid()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
