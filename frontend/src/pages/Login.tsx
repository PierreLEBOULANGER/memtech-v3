/**
 * Login.tsx
 * Page de connexion de l'application
 * Style inspiré de www.tpcourant.fr
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Page de connexion de l'application
 * Affiche un formulaire de connexion avec une bannière noire en haut contenant le logo
 * et une vidéo en arrière-plan
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulation d'authentification
      if (formData.email && formData.password) {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
      } else {
        setError('Veuillez remplir tous les champs');
      }
    } catch (err) {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Bannière noire avec logo */}
      <div className="w-full bg-black py-4 px-6 flex justify-start items-center absolute top-0 z-20">
        <img 
          src="/assets/Ecriture - Courant (001).png"
          alt="TP Courant Logo"
          className="h-12 object-contain"
        />
      </div>

      {/* Vidéo d'arrière-plan */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 min-w-full min-h-full object-cover z-0"
      >
        <source src="/assets/CARRIERE3.mp4" type="video/mp4" />
      </video>

      {/* Overlay sombre */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>

      {/* Conteneur du formulaire */}
      <div className="relative min-h-screen flex items-center justify-center px-4 z-20 pt-20">
        <div className="w-full max-w-md">
          {/* Titre MemTech */}
          <h1 className="text-4xl font-bold text-tp-yellow text-center mb-8 drop-shadow-lg">
            MemTech
          </h1>

          <div className="p-8 bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="prenom.nom@tpcourant.fr"
                  className="mt-1 block w-full px-3 py-2 bg-white/20 border border-gray-300 rounded-md text-white placeholder-gray-400
                           focus:outline-none focus:ring-tp-yellow focus:border-tp-yellow"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  className="mt-1 block w-full px-3 py-2 bg-white/20 border border-gray-300 rounded-md text-white
                           focus:outline-none focus:ring-tp-yellow focus:border-tp-yellow"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-tp-yellow focus:ring-tp-yellow border-gray-300 rounded"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                    Se souvenir de moi
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-tp-yellow hover:text-tp-yellow/80">
                    Mot de passe oublié ?
                  </a>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium
                         text-black bg-tp-yellow hover:bg-tp-yellow/90 focus:outline-none focus:ring-2 focus:ring-offset-2
                         focus:ring-tp-yellow transition-colors duration-200"
              >
                Se connecter
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-300">
              © 2024 TP Courant. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 