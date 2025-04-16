/**
 * Login.tsx
 * Page de connexion de l'application
 * Style inspiré de www.tpcourant.fr
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService, { LoginCredentials } from '../services/authService';

interface LoginError {
  message: string;
}

/**
 * Page de connexion avec vidéo en arrière-plan et logo TP Courant
 * Gère l'authentification des utilisateurs via l'API
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev: LoginCredentials) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('Tentative de connexion avec:', { email: credentials.email });
      const response = await authService.login(credentials);
      console.log('Connexion réussie:', response);
      
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
      }
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Erreur de connexion:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // TODO: Implémenter la logique de réinitialisation du mot de passe
    console.log('Réinitialisation du mot de passe demandée');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Bannière noire avec logo */}
      <div className="w-full bg-black py-4 px-6">
        <img
          src="/assets/Ecriture - Courant (001).png"
          alt="TP Courant Logo"
          className="h-12"
        />
      </div>

      {/* Conteneur principal avec vidéo */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Vidéo de fond */}
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        >
          <source src="/assets/CARRIERE3.mp4" type="video/mp4" />
        </video>

        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black opacity-20"></div>

        {/* Contenu du formulaire */}
        <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-lg shadow-xl mx-4">
          {/* Titre MemTech */}
          <h1 className="text-courant-yellow text-4xl font-bold tracking-wider text-center mb-8">
            MemTech
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message d'erreur */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white/5 border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-courant-yellow/80 focus:border-transparent"
                placeholder="votre.email@tpcourant.fr"
              />
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white/5 border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-courant-yellow/80 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Options supplémentaires */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-courant-yellow focus:ring-courant-yellow/80 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                  Se souvenir de moi
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-courant-yellow hover:text-courant-yellow/90"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#ffec00] hover:bg-[#ffec00]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-courant-yellow/80 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 