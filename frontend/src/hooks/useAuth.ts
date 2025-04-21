/**
 * Hook personnalisé pour gérer l'authentification dans l'application
 * Fournit les fonctionnalités de connexion, déconnexion et gestion de l'état de l'utilisateur
 */

import { useState, useEffect } from 'react';
import authService, { User } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: authService.getCurrentUser(),
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: true,
    error: null,
  });

  // Fonction pour vérifier si le token est présent et valide
  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const isValid = await authService.verifyToken();
      const user = authService.getCurrentUser();
      
      setAuthState({
        user,
        isAuthenticated: isValid,
        isLoading: false,
        error: null
      });
    } catch (error) {
      await authService.logout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expirée'
      });
    }
  };

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: 'Identifiants invalides'
      }));
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    await authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  // Vérification de l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout,
    checkAuth
  };
};

export default useAuth; 