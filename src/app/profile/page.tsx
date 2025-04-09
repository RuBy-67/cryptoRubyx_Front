"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { getToken, removeToken } from "@/utils/cookies";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ApiKey {
  id: string;
  service: string;
  key: string;
  label: string;
  created_at: string;
}

type SupportedChain = {
  name: string;
  chain: string;
  description: string;
  disabled?: boolean;
};

// Configuration des chaînes supportées par Moralis
const SUPPORTED_CHAINS: Record<string, SupportedChain> = {
  ETHEREUM: {
    name: 'Ethereum',
    chain: 'ETHEREUM',
    description: 'Réseau principal Ethereum'
  },
  BSC: {
    name: 'Binance Smart Chain',
    chain: 'BSC',
    description: 'Réseau Binance Smart Chain'
  },
  POLYGON: {
    name: 'Polygon',
    chain: 'POLYGON',
    description: 'Réseau Polygon'
  },
  ARBITRUM: {
    name: 'Arbitrum',
    chain: 'ARBITRUM',
    description: 'Réseau Arbitrum'
  },
  OPTIMISM: {
    name: 'Optimism',
    chain: 'OPTIMISM',
    description: 'Réseau Optimism'
  },
  BASE: {
    name: 'Base',
    chain: 'BASE',
    description: 'Réseau Base'
  },
  LINEA: {
    name: 'Linea',
    chain: 'LINEA',
    description: 'Réseau Linea'
  },
  AVALANCHE: {
    name: 'Avalanche',
    chain: 'AVALANCHE',
    description: 'Réseau Avalanche'
  },
  FANTOM: {
    name: 'Fantom',
    chain: 'FANTOM',
    description: 'Réseau Fantom'
  },
  CRONOS: {
    name: 'Cronos',
    chain: 'CRONOS',
    description: 'Réseau Cronos'
  },
  GNOSIS: {
    name: 'Gnosis',
    chain: 'GNOSIS',
    description: 'Réseau Gnosis'
  },
  CHILLIZ: {
    name: 'Chilliz',
    chain: 'CHILLIZ',
    description: 'Réseau Chilliz'
  },
  MOONBEAM: {
    name: 'Moonbeam',
    chain: 'MOONBEAM',
    description: 'Réseau Moonbeam'
  },
  BLAST: {
    name: 'Blast',
    chain: 'BLAST',
    description: 'Réseau Blast',
    disabled: true
  },
  ZKSYNC: {
    name: 'ZkSync',
    chain: 'ZKSYNC',
    description: 'Réseau ZkSync',
    disabled: true
  },
  MANTLE: {
    name: 'Mantle',
    chain: 'MANTLE',
    description: 'Réseau Mantle',
    disabled: true
  },
  OPBNB: {
    name: 'OpBNB',
    chain: 'OPBNB',
    description: 'Réseau OpBNB',
    disabled: true
  },
  POLYGON_ZKEVM: {
    name: 'Polygon zkEVM',
    chain: 'POLYGON_ZKEVM',
    description: 'Réseau Polygon zkEVM',
    disabled: true
  },
  ZETACHAIN: {
    name: 'ZetaChain',
    chain: 'ZETACHAIN',
    description: 'Réseau ZetaChain',
    disabled: true
  },
  FLOW: {
    name: 'Flow',
    chain: 'FLOW',
    description: 'Réseau Flow'
  },
  RONIN: {
    name: 'Ronin',
    chain: 'RONIN',
    description: 'Réseau Ronin'
  },
  LISK: {
    name: 'Lisk',
    chain: 'LISK',
    description: 'Réseau Lisk'
  },
  PULSECHAIN: {
    name: 'PulseChain',
    chain: 'PULSECHAIN',
    description: 'Réseau PulseChain'
  },
  SOLANA: {
    name: 'Solana',
    chain: 'SOLANA',
    description: 'Réseau Solana'
  }
};

// Mise à jour de l'interface Wallet
interface Wallet {
  id: string;
  name: string;
  address: string;
  chain: string;
}

interface UserProfile {
  username: string;
  email: string;
  apiKeys: ApiKey[];
  wallets: Wallet[];
}

// Mettre à jour l'interface BannedToken
interface BannedToken {
  id: number;
  address: string;
  name: string;
  symbol: string;
  reason: string;
  created_at: string;
}

interface BannedTokensResponse {
  tokens: BannedToken[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    username: "",
    email: "",
    apiKeys: [],
    wallets: [],
  });

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // État pour la nouvelle clé API
  const [newApiKey, setNewApiKey] = useState({
    key: '',
    service: ''
  });

  const [newWallet, setNewWallet] = useState({
    name: '',
    address: '',
    type: '' as keyof typeof SUPPORTED_CHAINS,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [bannedTokens, setBannedTokens] = useState<BannedToken[]>([]);
  const [bannedTokensTotal, setBannedTokensTotal] = useState(0);
  const [bannedTokensPage, setBannedTokensPage] = useState(1);
  const [bannedTokensSearch, setBannedTokensSearch] = useState('');
  const [isTokenBanModalOpen, setIsTokenBanModalOpen] = useState(false);
  const [newBannedToken, setNewBannedToken] = useState({
    address: '',
    name: '',
    symbol: '',
    reason: ''
  });

  // Section des clés API
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Charger les données du profil
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push("/");
          return;
        }

        // Récupérer les informations du profil
        const profileResponse = await fetch(
          "http://localhost:8080//api/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Erreur lors du chargement du profil");
        }

        const profileData = await profileResponse.json();
        console.log('Données du profil reçues:', profileData); // Debug
        
        // Mettre à jour le state avec la bonne structure
        setProfile({
          username: profileData.user.username,
          email: profileData.user.email,
          wallets: profileData.wallets || [],
          apiKeys: profileData.apiKeys || []
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Mise à jour du chargement des tokens bannis
  useEffect(() => {
    const fetchBannedTokens = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(
          `http://localhost:8080//api/token-ban?page=${bannedTokensPage}&limit=10&search=${encodeURIComponent(bannedTokensSearch)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des tokens bannis');
        }

        const data: BannedTokensResponse = await response.json();
        
        // Vérifier que data.tokens est un tableau
        if (!Array.isArray(data.tokens)) {
          console.error('Format de réponse invalide:', data);
          setBannedTokens([]);
          setBannedTokensTotal(0);
          return;
        }

        setBannedTokens(data.tokens);
        setBannedTokensTotal(data.total || 0);
      } catch (error) {
        console.error('Erreur lors du chargement des tokens bannis:', error);
        setBannedTokens([]);
        setBannedTokensTotal(0);
      }
    };

    fetchBannedTokens();
  }, [bannedTokensPage, bannedTokensSearch]);

  // Sauvegarder les modifications du profil
  const handleSaveProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch("http://localhost:8080//api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde du profil");
      }

      const data = await response.json();
      setProfile(prev => ({
        ...prev,
        username: data.user.username,
        email: data.user.email
      }));
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  // Mettre à jour le mot de passe
  const handleUpdatePassword = async () => {
    try {
      if (passwords.newPassword !== passwords.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }

      const token = getToken();
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch("http://localhost:8080//api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du mot de passe");
      }

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMode(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  // Supprimer le compte
  const handleDeleteAccount = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch("http://localhost:8080//api/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du compte");
      }

      logout();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  // Ajouter une clé API
  const handleAddApiKey = async (service: string) => {
    try {
        if (!service) {
            setError("Veuillez sélectionner un type de clé API");
            return;
        }

        if (!newApiKey.key) {
            setError("Veuillez entrer une clé API");
            return;
        }

        // Vérifier si une clé API existe déjà pour ce service
        const existingKey = profile.apiKeys.find(key => key.service === service);
        if (existingKey) {
            setError(`Une clé API existe déjà pour ${service === 'MORALIS' ? 'Moralis' : 'Mistral AI'}`);
            return;
        }

        const token = getToken();
        if (!token) {
            router.push("/");
            return;
        }

        console.log('Ajout de la clé API:', { service, key: newApiKey.key }); // Debug

        const response = await fetch('http://localhost:8080//api/keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                key: newApiKey.key,
                service: service
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Réponse du serveur:', data); // Debug

            // Créer un nouvel objet ApiKey avec les données reçues
            const newKey: ApiKey = {
                id: data.id || String(data.id), // Convertir en string si nécessaire
                service: service,
                key: newApiKey.key,
                label: service === 'MORALIS' ? 'Moralis' : 'Mistral AI',
                created_at: new Date().toISOString()
            };

            console.log('Nouvelle clé API créée:', newKey); // Debug

            setProfile(prev => ({
                ...prev,
                apiKeys: [...prev.apiKeys, newKey]
            }));
            setNewApiKey({ key: '', service: '' });
            setShowApiKeyModal(false);
        } else {
            const error = await response.json();
            console.error('Erreur serveur:', error); // Debug
            setError(error.message || "Erreur lors de l'ajout de la clé API");
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la clé API:', error);
        setError("Erreur lors de l'ajout de la clé API");
    }
  };

  // Supprimer une clé API
  const handleDeleteApiKey = async (id: string, service: string) => {
    if (!service) {
      setError("Service de la clé API manquant");
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette clé API ?')) return;

    try {
        const token = getToken();
        if (!token) {
            router.push("/");
            return;
        }

        console.log('Suppression de la clé API:', { service }); // Debug

        // Vérifier si la clé existe dans le profil avant de tenter la suppression
        const keyExists = profile.apiKeys.some(key => key.service === service);
        if (!keyExists) {
            setError("Cette clé API n'existe pas dans votre profil");
            return;
        }

        // Envoyer uniquement le service au backend
        const response = await fetch(`http://localhost:8080//api/keys/${service}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Mettre à jour le profil uniquement si la suppression a réussi
            setProfile(prev => ({
                ...prev,
                apiKeys: prev.apiKeys.filter(key => key.service !== service)
            }));
        } else {
            const error = await response.json();
            console.error('Erreur serveur lors de la suppression:', error); // Debug
            setError(error.message || 'Erreur lors de la suppression de la clé API');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de la clé API:', error);
        setError('Erreur lors de la suppression de la clé API');
    }
  };

  // Ajouter un wallet
  const handleAddWallet = async () => {
    try {
        if (!newWallet.address || !newWallet.type || !newWallet.name) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        // Vérifier si la chaîne est supportée
        if (!SUPPORTED_CHAINS[newWallet.type]) {
            setError("Chaîne non supportée");
            return;
        }

        const token = getToken();
        if (!token) {
            router.push("/");
            return;
        }

        const response = await fetch("http://localhost:8080//api/wallets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                address: newWallet.address,
                chain: SUPPORTED_CHAINS[newWallet.type].chain,
                name: newWallet.name
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de l'ajout du wallet");
        }

        const data = await response.json();
        setProfile({
            ...profile,
            wallets: [...profile.wallets, {
                id: data.id,
                name: newWallet.name || `Wallet ${profile.wallets.length + 1}`,
                address: data.address,
                chain: newWallet.type
            }],
        });
        setNewWallet({
            name: "",
            address: "",
            type: '' as keyof typeof SUPPORTED_CHAINS,
        });
        setIsWalletModalOpen(false);
        setError(null);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  // Supprimer un wallet
  const handleDeleteWallet = async (id: string) => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch(`http://localhost:8080//api/wallets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du wallet");
      }

      setProfile({
        ...profile,
        wallets: profile.wallets.filter((wallet) => wallet.id !== id),
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Ajouter les fonctions de gestion des tokens bannis
  const handleAddBannedToken = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch('http://localhost:8080//api/token-ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBannedToken),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du token banni');
      }

      const data = await response.json();
      
      // Créer un nouvel objet BannedToken avec les données reçues
      const newToken: BannedToken = {
        id: data.id,
        address: newBannedToken.address,
        name: newBannedToken.name,
        symbol: newBannedToken.symbol,
        reason: newBannedToken.reason,
        created_at: new Date().toISOString()
      };

      // Mettre à jour la liste des tokens bannis
      setBannedTokens(prev => [...prev, newToken]);
      
      // Réinitialiser le formulaire et fermer le modal
      setNewBannedToken({ address: '', name: '', symbol: '', reason: '' });
      setIsTokenBanModalOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  const handleDeleteBannedToken = async (id: number) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:8080//api/token-ban/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du token banni');
      }

      setBannedTokens(bannedTokens.filter(token => token.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clés API:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white grid-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Grouper les wallets par type
  const walletsByType =
    profile?.wallets?.reduce((acc, wallet) => {
      if (!acc[wallet.chain]) {
        acc[wallet.chain] = [];
      }
      acc[wallet.chain].push(wallet);
      return acc;
    }, {} as Record<string, Wallet[]>) || {};

  return (
    <div className="min-h-screen bg-black text-white grid-bg">
      {/* Header avec retour et déconnexion */}
      <header className="p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-sm z-50">
        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Profil</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
        >
          <span>Déconnexion</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6 animate-fade-in">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche : Informations personnelles et Clés API */}
          <div className="lg:col-span-1 space-y-6">
            {/* Section Informations Personnelles */}
            <section className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Informations Personnelles
                </h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  {editMode ? "Annuler" : "Modifier"}
                </button>
              </div>

              <div className="space-y-4">
                {!passwordMode ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Nom d'utilisateur
                      </label>
                      <input
                        type="text"
                        value={profile.username}
                        onChange={(e) =>
                          setProfile({ ...profile, username: e.target.value })
                        }
                        disabled={!editMode}
                        className="input-dark w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        disabled={!editMode}
                        className="input-dark w-full"
                      />
                    </div>
                    {editMode && (
                      <button
                        onClick={handleSaveProfile}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                      >
                        Enregistrer
                      </button>
                    )}
                    
                    <div className="pt-4 border-t border-gray-800 space-y-4">
                      <button
                        onClick={() => setPasswordMode(!passwordMode)}
                        className="w-full py-2 bg-blue-600/20 text-blue-500 hover:bg-blue-600/30 rounded-lg transition-colors"
                      >
                        Mot de passe
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation(true)}
                        className="w-full py-2 bg-red-600/20 text-red-500 hover:bg-red-600/30 rounded-lg transition-colors"
                      >
                        Supprimer mon compte
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 mt-4 pt-4 border-t border-gray-800">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) =>
                          setPasswords({ ...passwords, currentPassword: e.target.value })
                        }
                        className="input-dark w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) =>
                          setPasswords({ ...passwords, newPassword: e.target.value })
                        }
                        className="input-dark w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) =>
                          setPasswords({ ...passwords, confirmPassword: e.target.value })
                        }
                        className="input-dark w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPasswordMode(false)}
                        className="w-1/2 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleUpdatePassword}
                        className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                      >
                        Mettre à jour
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Colonne de droite : Wallets, Clés API et Tokens Bannis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Wallets par Type */}
            <section className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Vos Wallets</h2>
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="p-2 hover:bg-gray-800/50 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {Object.entries(walletsByType).map(([chain, wallets]) => (
                    <div key={`wallet-type-${chain}`} className="space-y-4">
                        <h3 className="text-lg font-medium text-blue-400">
                            {chain}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {wallets.map((wallet) => (
                                <div
                                    key={wallet.id}
                                    className="bg-gray-800/50 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{wallet.name}</span>
                                        <button
                                            onClick={() => handleDeleteWallet(wallet.id)}
                                            className="text-red-500 hover:text-red-400 transition-colors"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-400 break-all">
                                        {wallet.address}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
              </div>
            </section>
            {/* Section Clés API */}
            <section className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Clés API</h2>
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="p-2 hover:bg-gray-800/50 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {profile.apiKeys && profile.apiKeys.length > 0 ? (
                  <div className="space-y-4">
                    {profile.apiKeys.map((key, index) => (
                      <div key={`api-key-${key.id || index}`} className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group">
                        <div>
                          <div className="text-white">
                            {key.service === 'MORALIS' ? 'Clé API Moralis' : 'Clé API Mistral AI'}
                          </div>
                          <div className="text-sm text-gray-400">
                            Ajoutée le {new Date(key.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            console.log('Suppression de la clé API:', { id: key.id, service: key.service }); // Debug
                            handleDeleteApiKey(key.id, key.service);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Aucune clé API configurée</p>
                )}
              </div>
            </section>
            {/* Section Tokens Bannis */}
            <section className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Tokens Bannis</h2>
                <button
                  onClick={() => setIsTokenBanModalOpen(true)}
                  className="p-2 hover:bg-gray-800/50 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>

              {/* Barre de recherche */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Rechercher un token..."
                  value={bannedTokensSearch}
                  onChange={(e) => {
                    setBannedTokensSearch(e.target.value);
                    setBannedTokensPage(1); // Réinitialiser la page lors de la recherche
                  }}
                  className="input-dark w-full"
                />
              </div>

              <div className="space-y-4">
                {Array.isArray(bannedTokens) && bannedTokens.length > 0 ? (
                  bannedTokens.map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">{token.name}</div>
                          <div className="text-xs text-gray-400 break-all">
                            {token.address}
                          </div>
                          {token.symbol && (
                            <div className="text-xs text-gray-500">
                              {token.symbol}
                            </div>
                          )}
                          <div className="text-xs text-red-400 mt-1">
                            {token.reason}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBannedToken(token.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    Aucun token banni trouvé
                  </div>
                )}

                {/* Pagination */}
                {bannedTokensTotal > 10 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                    <div className="text-sm text-gray-400">
                      {bannedTokensTotal} tokens au total
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBannedTokensPage(prev => Math.max(1, prev - 1))}
                        disabled={bannedTokensPage === 1}
                        className="px-3 py-1 bg-gray-800/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={() => setBannedTokensPage(prev => Math.min(Math.ceil(bannedTokensTotal / 10), prev + 1))}
                        disabled={bannedTokensPage >= Math.ceil(bannedTokensTotal / 10)}
                        className="px-3 py-1 bg-gray-800/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Modal Ajout Clé API */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Ajouter une clé API</h2>
                    <button
                        onClick={() => setShowApiKeyModal(false)}
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Type de clé API
                        </label>
                        <select
                            value={newApiKey.service}
                            onChange={(e) => setNewApiKey({ ...newApiKey, service: e.target.value })}
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Sélectionnez un type</option>
                            <option value="MORALIS">Moralis</option>
                            <option value="MISTRAL">Mistral AI</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Clé API
                        </label>
                        <input
                            type="text"
                            value={newApiKey.key}
                            onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Entrez votre clé API"
                        />
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button
                            onClick={() => setShowApiKeyModal(false)}
                            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => {
                                if (newApiKey.service === 'MORALIS' || newApiKey.service === 'MISTRAL') {
                                    handleAddApiKey(newApiKey.service);
                                }
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>
        </div>
        )}

        {/* Modal Ajout Wallet */}
        {isWalletModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Ajouter un wallet</h3>
                <button
                  onClick={() => setIsWalletModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nom du wallet</label>
                  <input
                    type="text"
                    placeholder="Mon wallet"
                    value={newWallet.name}
                    onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Adresse</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={newWallet.address}
                    onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Chaîne</label>
                  <select
                    value={newWallet.type}
                    onChange={(e) => setNewWallet({ ...newWallet, type: e.target.value as keyof typeof SUPPORTED_CHAINS })}
                    className="input-dark w-full"
                  >
                    <option value="">Sélectionner une chaîne</option>
                    {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                      <option 
                        key={key} 
                        value={key}
                        disabled={chain.disabled}
                        className={chain.disabled ? 'text-gray-500' : ''}
                      >
                        {chain.name} {chain.disabled ? '(Non disponible)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    handleAddWallet();
                    setIsWalletModalOpen(false);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Ajouter le wallet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md animate-fade-in">
              <h3 className="text-xl font-semibold mb-4">Supprimer le compte</h3>
              <p className="text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmation(false)}
                  className="w-1/2 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-1/2 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ajout Token Banni */}
        {isTokenBanModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Ajouter un token banni</h3>
                <button
                  onClick={() => setIsTokenBanModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Adresse du token</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={newBannedToken.address}
                    onChange={(e) => setNewBannedToken({ ...newBannedToken, address: e.target.value })}
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nom du token</label>
                  <input
                    type="text"
                    placeholder="Nom du token"
                    value={newBannedToken.name}
                    onChange={(e) => setNewBannedToken({ ...newBannedToken, name: e.target.value })}
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Symbole du token</label>
                  <input
                    type="text"
                    placeholder="SYMBOL"
                    value={newBannedToken.symbol}
                    onChange={(e) => setNewBannedToken({ ...newBannedToken, symbol: e.target.value })}
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Raison du bannissement</label>
                  <textarea
                    placeholder="Expliquez pourquoi ce token est banni"
                    value={newBannedToken.reason}
                    onChange={(e) => setNewBannedToken({ ...newBannedToken, reason: e.target.value })}
                    className="input-dark w-full h-24 resize-none"
                  />
                </div>
                <button
                  onClick={handleAddBannedToken}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                >
                  Bannir le token
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
