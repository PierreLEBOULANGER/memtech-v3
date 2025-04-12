/**
 * Layout.tsx
 * Composant principal qui structure l'application
 * Intègre la barre de navigation et la barre latérale
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Composant Layout
 * Gère la disposition générale de l'application avec une barre de navigation en haut,
 * une barre latérale à gauche et le contenu principal au centre
 */
const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 