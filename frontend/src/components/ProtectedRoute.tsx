/**
 * ProtectedRoute.tsx
 * Composant de protection des routes
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Props du composant ProtectedRoute
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Composant ProtectedRoute
 * Vérifie si l'utilisateur est authentifié avant d'afficher le contenu
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 