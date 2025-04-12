/**
 * NotFound.tsx
 * Page d'erreur 404
 * Affichée lorsqu'une route demandée n'existe pas
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Composant NotFound
 * Affiche un message d'erreur et un lien pour retourner à l'accueil
 */
const NotFound: React.FC = () => {
  return (
    <div className="min-h-full bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <p className="text-4xl font-bold text-primary-600 sm:text-5xl">404</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
                Page non trouvée
              </h1>
              <p className="mt-1 text-base text-gray-500">
                Désolé, nous n'avons pas trouvé la page que vous recherchez.
              </p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFound; 