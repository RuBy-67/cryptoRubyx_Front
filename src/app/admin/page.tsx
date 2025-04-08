'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SystemStats {
  uptime: number;
  totalMemory: number;
  freeMemory: number;
  cpuUsage: number[];
  platform: string;
  hostname: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Wallet {
  _id: string;
  address: string;
  balance: number;
  user: User;
}

interface PortfolioHistory {
  _id: string;
  user: User;
  totalValue: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioHistory[]>([]);
  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = document.cookie.split('token=')[1]?.split(';')[0];
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:3001/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Non autorisé');
        }

        const data = await response.json();
        if (data.email !== 'admin@cryptorubyx.local') {
          router.push('/dashboard');
        }
      } catch (error) {
        router.push('/login');
      }
    };
    checkAdmin();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = document.cookie.split('token=')[1]?.split(';')[0];
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        // Récupération des données utilisateurs séparément pour déboguer
        const usersRes = await fetch('http://localhost:3001/api/admin/users', { headers });
        if (!usersRes.ok) {
          throw new Error('Erreur lors de la récupération des utilisateurs');
        }
        const usersData = await usersRes.json();
        console.log('Données utilisateurs reçues:', usersData);

        // Vérification que usersData est un tableau
        if (!Array.isArray(usersData)) {
          console.error('Les données utilisateurs ne sont pas un tableau:', usersData);
          setUsers([]);
        } else {
          setUsers(usersData);
        }

        // Récupération des autres données
        const [statsRes, walletsRes, historyRes] = await Promise.all([
          fetch('http://localhost:3001/api/admin/stats/system', { headers }),
          fetch('http://localhost:3001/api/admin/wallets', { headers }),
          fetch('http://localhost:3001/api/admin/portfolio-history', { headers })
        ]);

        const [stats, wallets, history] = await Promise.all([
          statsRes.json(),
          walletsRes.json(),
          historyRes.json()
        ]);

        setSystemStats(stats);
        setWallets(Array.isArray(wallets) ? wallets : []);
        setPortfolioHistory(Array.isArray(history) ? history : []);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Tableau de bord administrateur</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-red-500">
            {error}
          </div>
        )}

        {/* Navigation des onglets */}
        <div className="flex space-x-4 mb-8">
          {['system', 'users', 'wallets', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className="bg-gray-900 rounded-lg p-6">
          {activeTab === 'system' && systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Système</h3>
                <p>Plateforme: {systemStats.platform}</p>
                <p>Hôte: {systemStats.hostname}</p>
                <p>Uptime: {formatUptime(systemStats.uptime)}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Mémoire</h3>
                <p>Total: {formatBytes(systemStats.totalMemory)}</p>
                <p>Libre: {formatBytes(systemStats.freeMemory)}</p>
                <p>Utilisée: {formatBytes(systemStats.totalMemory - systemStats.freeMemory)}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">CPU</h3>
                <p>Charge 1m: {systemStats.cpuUsage[0].toFixed(2)}</p>
                <p>Charge 5m: {systemStats.cpuUsage[1].toFixed(2)}</p>
                <p>Charge 15m: {systemStats.cpuUsage[2].toFixed(2)}</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Date de création</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id} className="border-b border-gray-700">
                        <td className="p-4">{user.username}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">{user.role}</td>
                        <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <button className="text-blue-500 hover:text-blue-400 mr-2">Modifier</button>
                          <button className="text-red-500 hover:text-red-400">Supprimer</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'wallets' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="p-4">Adresse</th>
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Solde</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet) => (
                    <tr key={wallet._id} className="border-b border-gray-700">
                      <td className="p-4">{wallet.address}</td>
                      <td className="p-4">{wallet.user.username}</td>
                      <td className="p-4">{wallet.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Valeur totale</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioHistory.map((entry) => (
                    <tr key={entry._id} className="border-b border-gray-700">
                      <td className="p-4">{entry.user.username}</td>
                      <td className="p-4">{entry.totalValue}</td>
                      <td className="p-4">{new Date(entry.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 