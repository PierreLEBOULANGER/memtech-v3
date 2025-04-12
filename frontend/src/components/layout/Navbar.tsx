import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Composant Navbar
 * Barre de navigation principale de l'application
 * Reproduit le style et la structure de tpcourant.fr
 */
const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et titre */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              MemTech
            </Link>
          </div>

          {/* Navigation principale */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link
              to="/mes-memoires"
              className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              Mes Mémoires
            </Link>
            <Link
              to="/nouveau-memoire"
              className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              Nouveau Mémoire
            </Link>
            <Link
              to="/templates"
              className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              Templates
            </Link>
          </div>

          {/* Menu utilisateur */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <button
                type="button"
                className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600">U</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 