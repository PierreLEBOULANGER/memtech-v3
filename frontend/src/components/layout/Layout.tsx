import React from 'react';
import Navbar from './Navbar';

/**
 * Composant Layout
 * Structure principale de l'application qui englobe toutes les pages
 * Inclut la barre de navigation et le conteneur principal
 */
interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Conteneur principal avec padding et largeur max */}
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MemTech. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 