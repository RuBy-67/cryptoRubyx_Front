'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.rb-rubydev.fr/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: formData.username, 
          password: formData.password 
        }),
      });

      if (!response.ok) {
        throw new Error('Identifiants invalides');
      }

      const { token, user } = await response.json();
      // Stocker le token dans un cookie
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 jours
      
      // Redirection automatique vers le tableau de bord
      window.location.href = '/dashboard';
    } catch (error: any) {
      setError(error?.message || 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white grid-bg">
      {/* Logo et titre */}
      <div className="absolute top-8 left-8">
        <Link href="/">
          <Image
            src="/logos/logoWithTxtWithoutBg.png"
            alt="CryptoRubyx"
            width={180}
            height={48}
            priority
            unoptimized
          />
        </Link>
      </div>

      {/* Formulaire de connexion */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 relative">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Connexion</h2>
            <p className="mt-2 text-gray-400">
              Connectez-vous à votre compte CryptoRubyx
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-dark w-full mt-1"
                placeholder="JohnDoe"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-dark w-full mt-1"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium transition-all duration-200 focus-ring disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : 'Se connecter'}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-400">Pas encore de compte ?</span>{' '}
              <span className="text-red-500 font-medium cursor-not-allowed" title="Service temporairement indisponible">
                Créer un compte
              </span>
              <div className="mt-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                Service temporairement indisponible : Manque de ressources
              </div>
            </div>
          </form>

          {/* Effet de lumière d'ambiance */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-subtle-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-subtle-pulse delay-1000"></div>
        </div>
      </div>
    </div>
  );
} 