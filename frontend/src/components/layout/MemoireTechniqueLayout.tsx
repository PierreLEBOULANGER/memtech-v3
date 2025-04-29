/**
 * MemoireTechniqueLayout.tsx
 * Layout spécifique pour la page de rédaction des mémoires techniques
 * Inclut une barre de navigation simplifiée et un menu latéral rabattable
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

interface MemoireTechniqueLayoutProps {
  children: React.ReactNode;
}

const MemoireTechniqueLayout: React.FC<MemoireTechniqueLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Bannière noire avec logo et déconnexion */}
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

      {/* Conteneur principal */}
      <div className="flex-1 flex">
        {/* Menu latéral rabattable */}
        <div 
          className={`bg-black/50 backdrop-blur-sm transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-4 flex justify-end">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded text-white hover:bg-white/10 transition-colors"
            >
              {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>
          <nav className="mt-5 px-2">
            <Link
              to="/dashboard"
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-white/10 ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              {!isSidebarCollapsed && <span>Tableau de bord</span>}
            </Link>
            <Link
              to="/projects"
              className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-white/10 ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              {!isSidebarCollapsed && <span>Projets</span>}
            </Link>
            <Link
              to="/rapport-technique"
              className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-white/10 ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              {!isSidebarCollapsed && <span>Rapport techniques</span>}
            </Link>
          </nav>
        </div>

        {/* Contenu principal */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MemoireTechniqueLayout; 