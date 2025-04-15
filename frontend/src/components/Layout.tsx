/**
 * Layout.tsx
 * Composant principal qui structure l'application
 * Intègre la barre de navigation et la barre latérale
 */

import React from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import AuthService from '../services/authService';

/**
 * Composant Layout
 * Template principal de l'application pour les pages protégées
 * Inclut la navigation et le menu latéral
 */
const Layout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Bannière noire avec logo */}
      <div className="w-full bg-black py-4 px-6 flex justify-between items-center">
        <img
          src="/assets/Ecriture - Courant (001).png"
          alt="TP Courant Logo"
          className="h-12"
        />
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[#ffec00] text-black rounded hover:bg-[#ffec00]/90 transition-colors font-medium"
        >
          Déconnexion
        </button>
      </div>

      {/* Conteneur principal avec vidéo */}
      <div className="flex-1 relative">
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

        {/* Menu latéral et contenu principal */}
        <div className="flex relative z-10">
          {/* Menu latéral */}
          <aside className="w-64 bg-black/50 backdrop-blur-sm min-h-[calc(100vh-5rem)] text-white">
            <nav className="mt-5 px-2">
              <Link
                to="/dashboard"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-white/10"
              >
                Tableau de bord
              </Link>
              <Link
                to="/projects"
                className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-white/10"
              >
                Projets
              </Link>
              <Link
                to="/reports"
                className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-white/10"
              >
                Rapports techniques
              </Link>
            </nav>
          </aside>

          {/* Contenu principal */}
          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout; 