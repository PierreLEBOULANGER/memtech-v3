/**
 * Navbar.tsx
 * Composant de la barre de navigation
 * Affiche le logo, le titre et les actions principales de l'application
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Composant Navbar
 * Gère l'affichage de la barre de navigation supérieure avec le logo,
 * le titre de l'application et les actions utilisateur
 */
const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                MemTech
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none">
              <span className="sr-only">Notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <div className="ml-3 relative">
              <button className="flex items-center max-w-xs bg-white rounded-full focus:outline-none">
                <span className="sr-only">Menu utilisateur</span>
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Photo de profil"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 