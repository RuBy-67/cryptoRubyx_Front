'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PortfolioChart from '@/components/PortfolioChart';
import TokenDistributionChart from '@/components/TokenDistributionChart';
import AuthGuard from '@/components/AuthGuard';
import { getToken, removeToken } from "@/utils/cookies";
import TokenPriceChart from '@/components/TokenPriceChart';

// Types
interface WalletSummary {
  total: number;
  change24h: number;
  history: {
    labels: string[];
    values: number[];
  };
}

interface TokenMarketData {
  price: number;
  percent_change_24h: number;
  market_cap: number;
  volume_24h: number;
  last_updated: string;
  usdPrice24hr?: number;
  usdPrice24hrUsdChange?: number;
  usdPrice24hrPercentChange?: number;
  usd_change_24h?: number;
}

interface TokenBalance {
  type: string;
  symbol: string;
  name?: string;
  balance: string | number; // Peut être string (formaté) ou number (raw)
  address: string;
  decimals?: number;
  wallets?: string[];
  marketData?: TokenMarketData;
  transactions?: any[];
  displayBalance?: string;
  rawBalance?: string; // Important pour SOL et SPL
}

interface WalletBalance {
  type: string;
  address: string;
  lastUpdated: string;
  balances: TokenBalance[];
}

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Fonction utilitaire pour formater les URLs IPFS
const formatIPFSUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
  }
  return url;
};

interface NFT {
  type: string;
  contractAddress: string;
  tokenId: string;
  name: string;
  symbol: string;
  owner: string;
  lastTransfer: {
    from: string;
    to: string;
    timestamp: number;
    hash: string;
    value?: string;
  };
  metadata?: NFTMetadata;
  floorPrice?: number;
  floorPriceUsd?: number;
  marketplace?: string;
  lastSale?: {
    price: number;
    priceUsd: number;
    timestamp: number;
    from: string;
    to: string;
    transactionHash: string;
    marketplace: string;
  };
  openseaUrl?: string;
}

interface Wallet {
  id: string;
  name: string;
  address: string;
  type: string;
  balance?: {
    type: string;
    address: string;
    lastUpdated: string;
    balances: TokenBalance[];
    nfts?: NFT[];
  };
}

// Ajouter l'interface BannedToken
interface BannedToken {
  id: number;
  address: string;
  name: string;
  symbol: string;
  reason: string;
  created_at: string;
}

// Ajouter une fonction utilitaire pour formater les nombres
const formatNumber = (num: number, forceDecimals: boolean = false): string => {
  if (Number.isInteger(num) && !forceDecimals) {
    return num.toString();
  }
  // Utiliser maximumFractionDigits 8 pour plus de précision si nécessaire
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
};

const formatTokenBalance = (balance: string | number, decimals: number = 18, symbol: string = ''): string => {
  const numericBalance = Number(balance); // Convertir en nombre au début
  
  if (isNaN(numericBalance)) {
    // Si la conversion échoue, essayer de voir si c'était une chaîne déjà formatée
    if (typeof balance === 'string' && balance.includes('.')) return balance;
    return "0"; // Retourner 0 si invalide
  }
  
  // Pour tous les tokens (SOL, ETH, SPL, ERC20), 
  // la balance est maintenant numérique et correcte (pas besoin de re-diviser)
  // On formate juste le nombre pour l'affichage
  
  // Choisir le nombre de décimales à afficher (plus pour SOL/ETH)
  const displayDecimals = (symbol === 'SOL' || symbol === 'ETH') ? 8 : 4;
  
  // Utiliser toFixed pour contrôler précisément les décimales et éviter la notation scientifique
  let formatted = numericBalance.toFixed(displayDecimals);
  
  // Supprimer les zéros inutiles à la fin, mais garder au moins 2 décimales si non entier
  formatted = formatted.replace(/\.?0+$/, '');
  if (formatted.includes('.') && formatted.split('.')[1].length < 2) {
     formatted = Number(formatted).toFixed(2); // Assurer au moins 2 décimales si nécessaire
  }
  if (!formatted.includes('.') && numericBalance !== 0 && Math.abs(numericBalance) < 0.01) {
      formatted = numericBalance.toFixed(displayDecimals); // Rétablir si très petit et formaté à 0
  }

  return formatted;
};

// Ajouter cette fonction de filtrage des NFTs après les interfaces
const shouldDisplayNFT = (nft: NFT): boolean => {
  const excludedTerms = ['reward', 'claim', 'rewards', 'claimed'];
  const name = (nft.name || '').toLowerCase();
  const symbol = (nft.symbol || '').toLowerCase();
  
  // Vérifier si le nom ou le symbole contient un des termes exclus
  return !excludedTerms.some(term => 
    name.includes(term) || symbol.includes(term)
  );
};

// Nouvelle fonction pour calculer la valeur correcte d'un wallet
const calculateCorrectWalletValue = (wallet: Wallet): number => {
  if (!wallet.balance?.balances) return 0;

  return wallet.balance.balances.reduce((total, token) => {
    if (!token.marketData?.price || token.marketData.price <= 0) return total;

    let numericBalance = 0;
    let value = 0; // Initialiser la valeur à 0

    try {
      if (token.type === 'NATIVE' && token.symbol === 'SOL') {
        // Utiliser rawBalance pour SOL
        numericBalance = token.rawBalance ? Number(token.rawBalance) / Math.pow(10, 9) : 0;
        value = numericBalance * token.marketData.price;
      } else if (token.type === 'NATIVE' && token.symbol === 'ETH') {
        // Utiliser balance (brute) pour ETH
        numericBalance = Number(token.balance) / Math.pow(10, 18);
        value = numericBalance * token.marketData.price;
      } else if (token.type === 'SPL' || token.type === 'ERC20') {
        // Utiliser token.balance (qui semble être le nombre formaté correct)
        numericBalance = Number(token.balance);
        if (!isNaN(numericBalance)) {
          value = numericBalance * token.marketData.price;
        } else {
          value = 0; // Mettre 0 si la conversion échoue
        }
      } else {
        // Autres types ou cas non gérés (ex: NFT_COLLECTION) sont ignorés
        value = 0;
      }
    } catch (e) {
      console.error(`Erreur de calcul de valeur pour ${token.symbol}:`, e, token);
      value = 0; // Mettre 0 en cas d'erreur
    }

    return total + (isNaN(value) ? 0 : value); // Ajouter la valeur calculée au total
  }, 0);
};

export default function DashboardPage() {
  const [walletSummary, setWalletSummary] = useState<WalletSummary>({
    total: 0,
    change24h: 0,
    history: {
      labels: ['1D', '2D', '3D', '4D', '5D', '6D', '7D'],
      values: [0, 0, 0, 0, 0, 0, 0]
    }
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'wallets' | 'tokens' | 'nfts'>('tokens');
  const [expandedWallets, setExpandedWallets] = useState<Record<string, boolean>>({});
  const [localTokens, setLocalTokens] = useState<TokenBalance[]>([]);
  const [contractAddresses, setContractAddresses] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [bannedTokens, setBannedTokens] = useState<BannedToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'value' | 'name' | 'price' | 'change'>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [includeNFTsInChart, setIncludeNFTsInChart] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fonction pour regrouper les tokens avec leurs données de marché
  const getTokenSummary = useCallback(() => {
    const tokenMap = new Map<string, TokenBalance>();
    
    wallets.forEach(wallet => {
      if (wallet.balance?.balances) {
        wallet.balance.balances.forEach((token: TokenBalance & { rawBalance?: string }) => {
          if (token.type !== 'NFT_COLLECTION') {
            const isBanned = bannedTokens.some(bannedToken => 
              bannedToken.address.toLowerCase() === token.address.toLowerCase()
            );
            
            if (isBanned) return;

            const key = token.symbol;
            if (tokenMap.has(key)) {
              const existingToken = tokenMap.get(key)!;
              let balanceToAdd;
              if (token.type === 'NATIVE' && token.symbol === 'SOL' && token.rawBalance) {
                balanceToAdd = Number(token.rawBalance) / Math.pow(10, 9);
              } else if (token.type === 'NATIVE' && token.symbol === 'ETH') {
                balanceToAdd = Number(token.balance) / Math.pow(10, 18);
              } else {
                balanceToAdd = Number(token.balance);
              }
              
              existingToken.balance = Number(existingToken.balance) + balanceToAdd;
              if (!existingToken.wallets?.includes(wallet.name)) {
                existingToken.wallets = existingToken.wallets || [];
                existingToken.wallets.push(wallet.name);
              }
              existingToken.marketData = token.marketData;
            } else {
              let initialBalance;
              if (token.type === 'NATIVE' && token.symbol === 'SOL' && token.rawBalance) {
                initialBalance = Number(token.rawBalance) / Math.pow(10, 9);
              } else if (token.type === 'NATIVE' && token.symbol === 'ETH') {
                initialBalance = Number(token.balance) / Math.pow(10, 18);
              } else {
                initialBalance = Number(token.balance);
              }
              
              tokenMap.set(key, {
                ...token,
                balance: initialBalance,
                wallets: [wallet.name]
              });
            }
          }
        });
      }
    });

    return Array.from(tokenMap.values());
  }, [wallets, bannedTokens]);

  // Modifier la partie qui gère l'affichage des tokens pour supporter le token virtuel NFT
  const getFilteredAndSortedTokens = useCallback(() => {
    const tokens = getTokenSummary();
    
    // Filtrer les tokens selon la recherche et le prix
    const filteredTokens = tokens.filter(token => {
        // Pour le token NFT virtuel, toujours l'afficher s'il y a des NFTs
        if (token.type === 'NFT_COLLECTION') {
            return true;
        }
        
        // Vérifier si le token correspond à la recherche
        const matchesSearch = token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Ne pas filtrer sur le prix pour les tokens stables connus et SOL
        const isStableCoin = ['USDT', 'USDC', 'DAI', 'BUSD'].includes(token.symbol);
        const isSOL = token.type === 'NATIVE' && token.symbol === 'SOL';
        
        if (isStableCoin || isSOL) {
            return matchesSearch;
        }

        // Pour les autres tokens, vérifier le prix
        const hasValidPrice = token.marketData?.price && token.marketData.price > 0;
        return hasValidPrice && matchesSearch;
    }).map(token => {
        // La balance numérique est maintenant correctement calculée dans getTokenSummary
        // On utilise formatTokenBalance pour l'affichage
        return {
          ...token,
          // Utilise la balance numérique et les décimales correctes
          displayBalance: formatTokenBalance(token.balance, token.decimals, token.symbol)
        };
    });

    // Trier les tokens
    return filteredTokens.sort((a, b) => {
        let comparison = 0;
        const getTokenValue = (token: TokenBalance) => {
            // Utiliser la balance numérique (calculée dans getTokenSummary) pour la valeur
            if (token.type === 'NFT_COLLECTION') {
                return (Number(token.balance) * (token.marketData?.price || 0) * 380.23); // Approximation pour NFTs
            }
            // Pour tous les tokens (SOL, ETH, SPL), la balance est maintenant numérique
            // S'assurer que token.balance est traité comme un nombre
            return token.marketData?.price ? Number(token.balance) * token.marketData.price : 0;
        };

        switch (sortOption) {
            case 'value':
                const aValue = getTokenValue(a);
                const bValue = getTokenValue(b);
                comparison = bValue - aValue;
                break;
            case 'name':
                comparison = (a.symbol || '').localeCompare(b.symbol || '');
                break;
            case 'price':
                const aPrice = a.type === 'NFT_COLLECTION' 
                    ? (a.marketData?.price || 0) * 380.23 // Approximation pour NFTs
                    : (a.marketData?.price || 0);
                const bPrice = b.type === 'NFT_COLLECTION'
                    ? (b.marketData?.price || 0) * 380.23 // Approximation pour NFTs
                    : (b.marketData?.price || 0);
                comparison = bPrice - aPrice;
                break;
            case 'change':
                const aChange = a.marketData?.percent_change_24h || 0;
                const bChange = b.marketData?.percent_change_24h || 0;
                comparison = bChange - aChange;
                break;
        }
        return sortDirection === 'asc' ? -comparison : comparison;
    }); // Supprimer le .map final qui reformattait SOL
  }, [getTokenSummary, searchQuery, sortOption, sortDirection]);

  // Fonction pour exporter les tokens en CSV
  const exportTokensToCSV = useCallback(() => {
    const tokens = getFilteredAndSortedTokens();
    
    // En-têtes du CSV
    const headers = [
      'Symbole',
      'Nom',
      'Type',
      'Balance',
      'Valeur (USD)',
      'Prix actuel (USD)',
      'Variation 24h (%)',
      'Variation 24h (USD)',
      '% du Portfolio',
      'Wallets'
    ];
    
    // Fonction pour formater les nombres sans notation exponentielle
    const formatNumberForCSV = (num: number | string | null | undefined): string => {
      if (num === null || num === undefined) return 'N/A';
      
      // Convertir en nombre si c'est une chaîne
      const numericValue = typeof num === 'string' ? parseFloat(num) : num;
      
      // Vérifier si c'est un nombre valide
      if (isNaN(numericValue)) return 'N/A';
      
      // Utiliser toFixed pour éviter la notation exponentielle
      // Pour les très petits nombres, utiliser plus de décimales
      if (Math.abs(numericValue) < 0.000001) {
        return numericValue.toFixed(12);
      } else if (Math.abs(numericValue) < 0.01) {
        return numericValue.toFixed(8);
      } else if (Math.abs(numericValue) < 1) {
        return numericValue.toFixed(6);
      } else if (Math.abs(numericValue) < 1000) {
        return numericValue.toFixed(2);
      } else {
        // Pour les grands nombres, utiliser une méthode manuelle pour éviter les problèmes de caractères
        const parts = numericValue.toFixed(2).split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1] || '00';
        
        // Ajouter les séparateurs de milliers manuellement
        let formattedInteger = '';
        for (let i = 0; i < integerPart.length; i++) {
          if (i > 0 && (integerPart.length - i) % 3 === 0) {
            formattedInteger += ' ';
          }
          formattedInteger += integerPart[i];
        }
        
        return `${formattedInteger},${decimalPart}`;
      }
    };
    
    // Données des tokens
    const csvData = tokens.map(token => {
      // Calculer la valeur du token en USD
      let tokenValue = 0;
      
      if (token.type === 'NATIVE' && token.symbol === 'SOL') {
        tokenValue = Number(token.balance) * (token.marketData?.price || 0);
      } else if (token.marketData?.price) {
        // Pour ETH et autres tokens, s'assurer que la balance est correctement calculée
        const balance = token.type === 'NATIVE' 
          ? Number(token.balance) 
          : Number(token.balance) / Math.pow(10, token.decimals || 18);
        
        tokenValue = balance * token.marketData.price;
      }
      
      // Calculer le pourcentage avec des vérifications de sécurité
      let tokenPercentage = 0;
      if (walletSummary.total > 0 && tokenValue > 0 && isFinite(tokenValue)) {
        tokenPercentage = (tokenValue / walletSummary.total) * 100;
        tokenPercentage = isFinite(tokenPercentage) ? Math.min(tokenPercentage, 100) : 0;
      }
      
      // Formater la balance selon le type de token
      let formattedBalance = '';
      if (token.type === 'NATIVE' && token.symbol === 'SOL') {
        formattedBalance = token.displayBalance || formatNumberForCSV(token.balance);
      } else if (token.type === 'NFT_COLLECTION') {
        formattedBalance = `${formatNumberForCSV(token.balance)} ${token.symbol}`;
      } else {
        // Pour ETH et autres tokens
        const rawBalance = token.type === 'NATIVE' 
          ? Number(token.balance) 
          : Number(token.balance) / Math.pow(10, token.decimals || 18);
        
        formattedBalance = `${formatNumberForCSV(rawBalance)} ${token.symbol}`;
      }
      
      // Formater le prix actuel
      let formattedPrice = 'N/A';
      if (token.marketData?.price) {
        formattedPrice = formatNumberForCSV(token.marketData.price);
      }
      
      return [
        token.symbol,
        token.name || 'Token',
        token.type,
        formattedBalance,
        formatNumberForCSV(tokenValue),
        formattedPrice,
        token.marketData?.percent_change_24h !== undefined 
          ? `${token.marketData.percent_change_24h >= 0 ? '+' : ''}${formatNumberForCSV(token.marketData.percent_change_24h)}` 
          : 'N/A',
        token.marketData?.usd_change_24h !== undefined 
          ? `${token.marketData.usd_change_24h >= 0 ? '+' : ''}${formatNumberForCSV(Math.abs(token.marketData.usd_change_24h))}` 
          : 'N/A',
        tokenPercentage > 0.01 ? formatNumberForCSV(tokenPercentage) : tokenPercentage > 0 ? '< 0.01' : '0.00',
        token.wallets?.join(', ') || '0'
      ];
    });
    
    // Créer le contenu CSV avec point-virgule comme séparateur (format français)
    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => row.map(cell => {
        // Échapper les cellules qui contiennent des points-virgules
        const cellStr = String(cell);
        return cellStr.includes(';') ? `"${cellStr}"` : cellStr;
      }).join(';'))
    ].join('\n');
    
    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `crypto_portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [getFilteredAndSortedTokens, walletSummary.total]);

  // Effet pour initialiser les tokens locaux
  useEffect(() => {
    if (localTokens.length === 0 && wallets.length > 0) {
      const tokens = getTokenSummary();
      setLocalTokens(tokens.map(({ marketData, ...token }) => token)); // Stocker les tokens sans les données de marché
    }
  }, [wallets, getTokenSummary, localTokens.length]);

  // Effet pour mettre à jour les données de marché
  useEffect(() => {
    const updateMarketData = async () => {
      if (localTokens.length > 0) {
        const symbols = localTokens.map(token => token.symbol);
        await fetchMarketData(symbols, contractAddresses);
      }
    };

    updateMarketData();
    const interval = setInterval(updateMarketData, 60000);
    return () => clearInterval(interval);
  }, [localTokens, contractAddresses]);

  // Effet pour mettre à jour le total du portfolio
  useEffect(() => {
    const totalValue = wallets.reduce((total, wallet) => {
        if (!wallet.balance?.balances) return total;
        
        // Calculer la valeur des tokens
        const tokensTotal = wallet.balance.balances.reduce((walletTotal, token) => {
            if (token.marketData?.price) {
                let balance;
                // Pour les tokens natifs (SOL et ETH)
                if (token.type === 'NATIVE' && (token.symbol === 'SOL' || token.symbol === 'ETH')) {
                    balance = Number(token.balance) / Math.pow(10, token.symbol === 'SOL' ? 9 : 18);
                } 
                // Pour les autres tokens, utiliser la valeur brute
                else {
                    balance = Number(token.balance);
                }
                const value = balance * token.marketData.price;
                return walletTotal + value;
            }
            return walletTotal;
        }, 0);

        // Calculer la valeur des NFTs
        const nftsTotal = (wallet.balance.nfts || []).reduce((nftTotal, nft) => {
            if (nft.floorPrice && nft.floorPriceUsd) {
                return nftTotal + nft.floorPriceUsd;
            }
            return nftTotal;
        }, 0);

        return total + tokensTotal + nftsTotal;
    }, 0);

    setWalletSummary(prev => ({
        ...prev,
        total: totalValue
    }));

    // Enregistrer la valeur dans l'historique
    const recordPortfolioValue = async () => {
        try {
            const token = getToken();
            if (!token) return;

            await fetch('https://api.rb-rubydev.fr/api/wallets/portfolio-history', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ totalValue })
            });
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'historique:', error);
        }
    };

    if (totalValue > 0) {
        recordPortfolioValue();
    }
  }, [wallets]);

  // Effet pour charger l'historique du portfolio
  useEffect(() => {
    const fetchPortfolioHistory = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const response = await fetch('https://api.rb-rubydev.fr/api/wallets/portfolio-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de l\'historique');
            }

            const history = await response.json();
            setWalletSummary(prev => ({
                ...prev,
                history
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
        }
    };

    fetchPortfolioHistory();
  }, []);

  // Fonction pour basculer l'expansion d'un wallet
  const toggleWalletExpansion = (walletId: string) => {
    setExpandedWallets(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }));
  };

  // Mise à jour de la fonction fetchMarketData
  const fetchMarketData = async (symbols: string[], contractAddresses: Record<string, string>) => {
    try {
    } catch (error) {
      console.error('Erreur détaillée:', error);
      setError('Impossible de charger les données de marché. Les prix peuvent ne pas être à jour.');
    }
  };

  // Composant TokenDistributionChart modifié pour utiliser les valeurs en USD
  const TokenDistributionChartWithValues = useCallback(() => {
    interface TokenData {
      symbol: string;
      balance: number;
      value: number;
      marketData?: {
        price: number;
        percent_change_24h: number;
        market_cap: number;
        volume_24h: number;
      };
      type?: string;
      percentage: number;
    }

    // Récupérer les NFTs d'abord
    const nfts = wallets.flatMap(wallet => wallet.balance?.nfts || []);
    const totalNFTs = nfts.length;
    const nftFloorPrice = nfts[0]?.floorPrice || 0;
    const nftValue = totalNFTs * nftFloorPrice * 380.23; // Prix ETH/USD moyen

    // Créer un token virtuel pour les NFTs si on en a
    let nftToken: TokenData | null = null;
    if (totalNFTs > 0) {
      nftToken = {
        symbol: 'NFTs',
        balance: totalNFTs,
        value: nftValue,
        type: 'NFT_COLLECTION',
        percentage: 0,
        marketData: {
          price: nftFloorPrice,
          percent_change_24h: 0,
          market_cap: 0,
          volume_24h: 0
        }
      };
    }

    // Récupérer tous les tokens (y compris les SPL)
    const tokens = wallets.flatMap(wallet => 
      wallet.balance?.balances.map(token => {
        // Utiliser la logique de calcul de valeur corrigée
        let numericBalance = 0;
        let value = 0;
        try {
          if (token.type === 'NATIVE' && token.symbol === 'SOL') {
            numericBalance = token.rawBalance ? Number(token.rawBalance) / Math.pow(10, 9) : 0;
          } else if (token.type === 'NATIVE' && token.symbol === 'ETH') {
            numericBalance = Number(token.balance) / Math.pow(10, 18);
          } else if (token.type === 'SPL' || token.type === 'ERC20') {
            numericBalance = Number(token.balance);
          }
          value = token.marketData?.price ? numericBalance * token.marketData.price : 0;
        } catch (e) {
            console.error("Erreur calcul valeur token pour graphique:", e, token);
            value = 0;
        }
            
        return {
          symbol: token.symbol,
          balance: numericBalance, // Stocker la balance numérique correcte
          value, // Utiliser la valeur calculée correcte
          marketData: token.marketData,
          type: token.type,
          percentage: 0
        } as TokenData;
      }) || []
    );

    // Filtrer les tokens selon l'option includeNFTsInChart
    let allTokens = [...tokens];
    if (includeNFTsInChart && nftToken) {
      allTokens.push(nftToken);
    }

    // Regrouper les tokens par symbole
    const groupedTokens = allTokens.reduce<Record<string, TokenData>>((acc, token) => {
      if (!token) return acc;
      const key = token.symbol;
      if (!acc[key]) {
        acc[key] = { ...token };
      } else {
        acc[key].balance += token.balance;
        acc[key].value += token.value;
      }
      return acc;
    }, {});

    // Calculer le total et les pourcentages
    const total = Object.values(groupedTokens).reduce((sum, token) => sum + token.value, 0);
    const tokensWithPercentages = Object.values(groupedTokens)
      .filter(token => token.value > 0) // Ne garder que les tokens avec une valeur
      .map(token => ({
        ...token,
        percentage: total > 0 ? (token.value / total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value); // Trier par valeur décroissante

    return <TokenDistributionChart tokens={tokensWithPercentages} />;
  }, [wallets, includeNFTsInChart]);

  // Fonction pour formater les grands nombres
  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) {
      return `${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  // Fonction pour charger les données
  const fetchData = async () => {
    try {
      setRefreshing(true);
      setApiError(null); // Réinitialiser l'erreur
      const token = getToken();
      if (!token) return;

      // Récupérer les wallets
      const walletsResponse = await fetch('https://api.rb-rubydev.fr/api/wallets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!walletsResponse.ok) {
        throw new Error('Erreur lors de la récupération des wallets');
      }

      const walletsData = await walletsResponse.json();

      // Récupérer les balances pour chaque wallet
      const walletsWithBalances = await Promise.all(
        walletsData.map(async (wallet: Wallet) => {
          try {
            const balanceResponse = await fetch(
              `https://api.rb-rubydev.fr/api/wallets/balance/${wallet.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!balanceResponse.ok) {
              // Vérifier si c'est une erreur 500
              if (balanceResponse.status === 500) {
                const errorData = await balanceResponse.json();
                if (errorData?.error?.includes('Internal Server Error')) {
                  setApiError("Limite d'API Moralis atteinte. Réessayez demain ou contactez le support.");
                  throw new Error('API_LIMIT_REACHED');
                }
              }
              throw new Error('Erreur lors de la récupération de la balance');
            }

            const balance = await balanceResponse.json();
            
            if (balance.contractAddresses) {
              setContractAddresses(prev => ({
                ...prev,
                ...balance.contractAddresses
              }));
            }
            
            return {
              ...wallet,
              balance,
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération du solde pour le wallet ${wallet.id}:`, error);
            return wallet;
          }
        })
      );

      setWallets(walletsWithBalances);

    } catch (error) {
      if (error instanceof Error && error.message === 'API_LIMIT_REACHED') {
        // L'erreur est déjà gérée
        return;
      }
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setRefreshing(false);
    }
  };

  // Effet pour charger les données initiales
  useEffect(() => {
    fetchData();
  }, []);


  // Ajouter l'effet pour charger les tokens bannis
  useEffect(() => {
    const fetchBannedTokens = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch('https://api.rb-rubydev.fr/api/token-ban', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des tokens bannis');
        }

        const data = await response.json();
        setBannedTokens(data.tokens || []);
      } catch (error) {
        console.error('Erreur lors du chargement des tokens bannis:', error);
      }
    };

    fetchBannedTokens();
  }, []);

  // Modifier renderWalletTokens pour accepter walletTotal en argument
  const renderWalletTokens = (wallet: Wallet, walletTotal: number) => {
    if (!wallet.balance?.balances) return null;

    // Utiliser la valeur passée en argument
    return (
        <>
            {/* Afficher le total du wallet */}
            <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total du wallet</span>
                    <span className="text-xl font-bold">
                        ${walletTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* Liste des tokens */}
            <div className="space-y-2">
                {wallet.balance.balances
                    .filter(token => {
                        const isBanned = bannedTokens.some(bannedToken => 
                            bannedToken.address.toLowerCase() === token.address.toLowerCase()
                        );
                        return !isBanned;
                    })
                    .map((token, index) => {
                        const formattedBalance = formatTokenBalance(token.balance, token.decimals, token.symbol);
                        let tokenValue = 0;
                        
                        // Simplifier le calcul de la valeur en utilisant token.balance directement
                        try {
                          const numericBalance = Number(token.balance); 
                          if (!isNaN(numericBalance)) {
                            // token.balance semble contenir la valeur numérique correcte pour SPL/ERC20
                            tokenValue = numericBalance * (token.marketData?.price || 0);
                          }
                        } catch(e) {
                           console.error("Erreur calcul valeur token individuel:", e, token);
                           tokenValue = 0; // Assurer 0 en cas d'erreur
                        }
                        
                        return (
                            <div key={index} className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium">{token.symbol}</h3>
                                        {token.name && (
                                            <p className="text-xs text-gray-400">{token.name}</p>
                                        )}
                                        {token.type === 'ERC20' && (
                                            <p className="text-xs text-gray-500">ERC20</p>
                                        )}
                                        {token.type === 'SPL' && (
                                            <p className="text-xs text-gray-500">SPL Token</p>
                                        )}
                                        {token.type === 'NATIVE' && (
                                            <p className="text-xs text-gray-500">Native Token</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="flex flex-col items-end">
                                            <p className="font-semibold">
                                                {formattedBalance} {token.symbol}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                ≈ ${tokenValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                            {token.marketData?.price && (
                                                <p className="text-xs text-gray-500">
                                                    Prix actuel: ${token.marketData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </>
    );
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white grid-bg">
        {/* Header */}
        <header className="p-4 flex justify-between items-center border-b border-gray-800">
          <img src="/logos/logoWithTxtWithoutBg.png" alt="CryptoRubyx" className="h-8" />
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                refreshing 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Rafraîchissement...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Rafraîchir</span>
                </>
              )}
            </button>
            <Link href="/profile" className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Message d'erreur API */}
          {apiError && (
            <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded relative" role="alert">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="block sm:inline">{apiError}</span>
              </div>
            </div>
          )}

          {/* Total Value Card */}
          <section className="glass p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-gray-400 text-sm">Valeur Totale du Portfolio</h2>
                <p className="text-4xl font-bold">${walletSummary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">24h Change</p>
                <p className={`text-xl font-semibold ${walletSummary.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {walletSummary.change24h >= 0 ? '+' : ''}{walletSummary.change24h.toLocaleString()}$
                </p>
              </div>
            </div>
            <PortfolioChart data={walletSummary.history} />
          </section>

          {/* View Mode Selector */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setViewMode('wallets')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'wallets' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Par Wallet
            </button>
            <button
              onClick={() => setViewMode('tokens')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'tokens' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Par Token
            </button>
            <button
              onClick={() => setViewMode('nfts')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'nfts' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              NFTs
            </button>
          </div>

          {/* Wallets Grid */}
          <div className="grid grid-cols-1 gap-6">
            {viewMode === 'wallets' ? (
              // Vue par Wallet
              <section className="glass p-6 rounded-2xl max-w-5xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Wallets</h2>
                <div className="space-y-4">
                  {loading ? (
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
                      ))}
                    </div>
                  ) : wallets.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>Aucun wallet ajouté</p>
                      <Link href="/profile" className="mt-2 inline-block px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
                        Ajouter un wallet
                      </Link>
                    </div>
                  ) : (
                      wallets.map((wallet) => {
                        const isExpanded = expandedWallets[wallet.id];
                        // Utiliser la nouvelle fonction ici
                        const walletValue = calculateCorrectWalletValue(wallet);

                        return (
                          <div key={wallet.id} className="bg-gray-800/50 rounded-lg overflow-hidden">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-800/70 transition-colors"
                              onClick={() => toggleWalletExpansion(wallet.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-medium">{wallet.name}</h3>
                                  <p className="text-sm text-gray-400">{wallet.address}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-lg">
                                    {/* Afficher la valeur calculée correctement */}
                                    ${walletValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-gray-800 p-4 space-y-2">
                                {/* Passer la valeur calculée à renderWalletTokens */}
                                {renderWalletTokens(wallet, walletValue)}
                              </div>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </section>
              ) : viewMode === 'tokens' ? (
                // Vue par Token
                <section className="glass p-6 rounded-2xl max-w-5xl mx-auto">
                  <h2 className="text-xl font-semibold mb-4">Tokens</h2>
                  <div className="space-y-6">
                    {/* Contrôles de recherche et tri */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="relative w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="Rechercher un token..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={includeNFTsInChart}
                            onChange={(e) => setIncludeNFTsInChart(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-700 bg-gray-800 focus:ring-blue-500"
                          />
                          <span>Inclure les NFTs dans le graphique</span>
                        </label>

                        <select
                          value={sortOption}
                          onChange={(e) => setSortOption(e.target.value as 'value' | 'name' | 'price' | 'change')}
                          className="px-4 py-2 bg-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="value">Valeur</option>
                          <option value="name">Nom</option>
                          <option value="price">Prix</option>
                        </select>
                        
                        <button
                          onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                          {sortDirection === 'asc' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                            </svg>
                          )}
                        </button>
                        
                        <button
                          onClick={exportTokensToCSV}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Exporter CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Graphique de distribution */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">Distribution par Valeur</h3>
                      <div className="max-w-2xl mx-auto">
                        <TokenDistributionChartWithValues />
                      </div>
                    </div>
                    
                    {/* Liste des tokens */}
                    <div className="space-y-3">
                      {loading ? (
                        <div className="animate-pulse space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
                          ))}
                        </div>
                      ) : wallets.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                          <p>Aucun token trouvé</p>
                </div>
                      ) : getFilteredAndSortedTokens().length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p>Aucun token ne correspond à votre recherche</p>
                        </div>
                      ) : (
                        getFilteredAndSortedTokens().map((token, index) => {
                          // Calculer la valeur du token en USD
                          const tokenValue = token.type === 'NATIVE' && token.symbol === 'SOL'
                            ? Number(token.balance) * (token.marketData?.price || 0)
                            : token.marketData?.price 
                                ? Number(token.balance) * token.marketData.price 
                                : 0;
                          
                          // Calculer le pourcentage avec des vérifications de sécurité
                          let tokenPercentage = 0;
                          if (walletSummary.total > 0 && tokenValue > 0 && isFinite(tokenValue)) {
                              tokenPercentage = (tokenValue / walletSummary.total) * 100;
                              tokenPercentage = isFinite(tokenPercentage) ? Math.min(tokenPercentage, 100) : 0;
                          }

                          // Formater la balance selon le type de token
                          let displayBalance = '';
                          if (token.type === 'NFT_COLLECTION') {
                            displayBalance = `${token.balance} NFTs`;
                          } else if (token.displayBalance) {
                            displayBalance = `${token.displayBalance} ${token.symbol}`;
                          } else {
                            const formattedBalance = token.type === 'NATIVE' && token.symbol === 'SOL'
                              ? formatTokenBalance(token.balance.toString(), 9, 'SOL')
                              : formatTokenBalance(token.balance.toString(), token.decimals || 18, token.symbol);
                            displayBalance = `${formattedBalance} ${token.symbol}`;
                          }

                          return (
                            <div key={index} className="p-4 bg-gray-900/50 rounded-xl hover:bg-gray-800/50 transition-all duration-200">
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center space-x-4">
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <h3 className="text-lg font-medium">{token.symbol}</h3>
                                        {token.marketData?.percent_change_24h !== undefined && (
                                         <span className={`text-xs px-1.5 py-0.5 rounded ${
                                          token.marketData.percent_change_24h >= 0 
                                            ? 'bg-green-500/20 text-green-400' 
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                          {token.marketData.percent_change_24h >= 0 ? '+' : ''}
                                          {token.marketData.percent_change_24h.toFixed(2)}%
                                        </span>
                                        
                                          
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-400">{token.name || 'Token'}</p>
                                      {token.wallets && (
                                        <p className="text-xs text-blue-400">
                                          Présent dans {token.wallets.length} wallet{token.wallets.length > 1 ? 's' : ''}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-lg">
                                        {displayBalance}
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-lg">
                                          ${formatNumber(tokenValue)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                      <div className="text-sm text-gray-400">Prix actuel</div>
                                      <div className="flex items-center justify-end space-x-2">
                                        <span className="text-lg">
                                          ${token.marketData?.price ? formatNumber(token.marketData.price) : 'N/A'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-gray-400">Portfolio</div>
                                      <div className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                        {tokenPercentage > 0.01 
                                            ? tokenPercentage.toFixed(2) 
                                            : tokenPercentage > 0 
                                                ? '< 0.01' 
                                                : '0.00'}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                </div>
              </section>
              ) : (
                // NFTs View
                <section className="glass p-6 rounded-2xl max-w-5xl mx-auto">
                  <h2 className="text-xl font-semibold mb-4">NFTs</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {loading ? (
                      Array(8).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-48 bg-gray-800 rounded-lg mb-2"></div>
                          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                        </div>
                      ))
                    ) : wallets.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-400">
                        <p>Aucun NFT trouvé</p>
                      </div>
                    ) : (
                      wallets.flatMap(wallet => 
                        wallet.balance?.nfts?.filter(shouldDisplayNFT).map(nft => {
                          let metadata;
                          try {
                            metadata = typeof nft.metadata === 'string' ? JSON.parse(nft.metadata) : nft.metadata;
                          } catch (e) {
                            console.error('Erreur lors du parsing des métadonnées:', e);
                            metadata = null;
                          }

                          return (
                            <div key={`${nft.contractAddress}-${nft.tokenId}`} 
                              className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-all duration-200 group relative">
                              <div className="aspect-square bg-gray-900 relative">
                                {metadata?.image ? (
                                  metadata.image.toLowerCase().endsWith('.mp4') ? (
                                    <video 
                                      src={formatIPFSUrl(metadata.image)}
                                      className="w-full h-full object-cover"
                                      controls
                                      loop
                                      muted
                                    />
                                  ) : (
                                    <img 
                                      src={formatIPFSUrl(metadata.image)} 
                                      alt={metadata.name || nft.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-nft.png';
                                      }}
                                    />
                                  )
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                {/* Badge de prix */}
                                {typeof nft.floorPrice === 'number' && typeof nft.floorPriceUsd === 'number' && nft.floorPrice > 0 && (
                                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-lg text-sm">
                                    <div className="flex flex-col items-end">
                                      <div className="flex items-center space-x-1">
                                        <span>{nft.floorPrice.toFixed(4)} ETH</span>
                                        <span className="text-gray-400 text-xs">
                                          (${nft.floorPriceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                        </span>
                              </div>
                                      {nft.marketplace && (
                                        <span className="text-xs text-blue-400 mt-0.5">
                                          {nft.marketplace}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Informations de dernière vente au survol - Version Desktop */}
                                {nft.lastSale && (
                                  <div className="hidden md:block absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="bg-black/90 p-3 rounded-b-lg shadow-lg">
                                      <div className="text-sm">
                                        <h4 className="text-base font-semibold mb-2 flex items-center">
                                          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                                            Dernière vente collection
                                          </span>
                                        </h4>
                                        <div className="flex flex-col space-y-2">
                                          <div className="flex justify-between items-center">
                                            <span className="text-gray-400">{new Date(nft.lastSale.timestamp).toLocaleDateString('fr-FR', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric'
                                            })}</span>
                                            <div className="text-right">
                                              <div>{nft.lastSale.price.toFixed(4)} ETH</div>
                                              <div className="text-gray-500 text-xs">
                                                (${nft.lastSale.priceUsd.toLocaleString()})
                                              </div>
                                            </div>
                                          </div>
                                          {nft.lastSale.marketplace && (
                                            <div className="flex justify-end">
                                              <span className="text-gray-400">{nft.lastSale.marketplace}</span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex justify-start items-center space-x-4 mt-2 pt-2 border-t border-gray-700">
                                          {nft.lastSale.transactionHash && (
                                            <a 
                                              href={`https://etherscan.io/tx/${nft.lastSale.transactionHash}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                                            >
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                              Etherscan
                                            </a>
                                          )}
                                          {nft.openseaUrl && (
                                            <a 
                                              href={`${nft.openseaUrl}/${nft.tokenId}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                                            >
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                              OpenSea
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Informations de dernière vente - Version Mobile */}
                                {nft.lastSale && (
                                  <div className="md:hidden absolute bottom-0 inset-x-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="bg-black/90 p-3">
                                      <div className="text-sm">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                                            Dernière vente collection
                                      </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1.5">
                                          <span className="text-gray-400">Prix:</span>
                                          <div className="text-right">
                                            <div>{nft.lastSale.price.toFixed(4)} ETH</div>
                                            <div className="text-gray-500 text-xs">
                                              (${nft.lastSale.priceUsd.toLocaleString()})
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                          <div className="flex items-center space-x-2">
                                            {nft.lastSale.transactionHash && (
                                              <a 
                                                href={`https://etherscan.io/tx/${nft.lastSale.transactionHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 flex items-center"
                                              >
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Etherscan
                                              </a>
                                            )}
                                            {nft.openseaUrl && (
                                              <a 
                                                href={`${nft.openseaUrl}/${nft.tokenId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 flex items-center"
                                              >
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                OpenSea
                                              </a>
                                            )}
                                          </div>
                                          <span className="text-gray-400">
                                            {new Date(nft.lastSale.timestamp).toLocaleDateString('fr-FR', {
                                              day: 'numeric',
                                              month: 'short'
                                            })}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="font-medium truncate">{metadata?.name || nft.name}</h3>
                                <p className="text-sm text-gray-400 truncate">{nft.symbol}</p>

                                {/* Affichage des propriétés du NFT */}
                                {metadata?.attributes && metadata.attributes.length > 0 && (
                                  <div className="mt-2 text-xs">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium text-gray-400">Propriétés</h4>
                                      {metadata.attributes.length > 3 && (
                                        <button
                                          onClick={() => {
                                            const element = document.getElementById(`nft-attributes-${nft.tokenId}`);
                                            if (element) {
                                              element.classList.toggle('hidden');
                                            }
                                          }}
                                          className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                                        >
                                          Voir {metadata.attributes.length - 3} autres
                                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                    <div className="space-y-1">
                                      {/* 3 premières propriétés toujours visibles */}
                                      {metadata.attributes.slice(0, 3).map((attr: { trait_type: string; value: string | number }, index: number) => (
                                        <div 
                                          key={index}
                                          className="flex justify-between bg-gray-800/50 px-2 py-1 rounded"
                                        >
                                          <span className="text-gray-400">{attr.trait_type}</span>
                                          <span className="text-gray-200">{attr.value?.toString() || '-'}</span>
                                        </div>
                                      ))}
                                      
                                      {/* Propriétés restantes (cachées par défaut) */}
                                      {metadata.attributes.length > 3 && (
                                        <div id={`nft-attributes-${nft.tokenId}`} className="hidden space-y-1">
                                          {metadata.attributes.slice(3).map((attr: { trait_type: string; value: string | number }, index: number) => (
                                            <div 
                                              key={index + 3}
                                              className="flex justify-between bg-gray-800/50 px-2 py-1 rounded"
                                            >
                                              <span className="text-gray-400">{attr.trait_type}</span>
                                              <span className="text-gray-200">{attr.value?.toString() || '-'}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Informations supplémentaires */}
                                <div className="mt-2 text-xs text-gray-500">
                                  <p>Collection: {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}</p>
                                  <p>Token ID: {nft.tokenId}</p>
                                  <p>Wallet: {wallet.name}</p>
                                  {nft.lastTransfer?.timestamp && (
                                    <p>Dernier transfert: {new Date(nft.lastTransfer.timestamp * 1000).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }) || []
                      )
                    )}
                  </div>
                </section>
              )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 