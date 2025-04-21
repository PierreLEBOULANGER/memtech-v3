/**
 * Service d'authentification
 * Gère toutes les opérations liées à l'authentification des utilisateurs
 */

import api, { AUTH_URLS } from './api';

// Configuration de l'URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('API_URL configurée:', API_URL);

// Types pour TypeScript
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export class AuthService {
    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // 1. Obtenir les tokens
        const tokenResponse = await api.post(AUTH_URLS.login, credentials);
        const { access, refresh } = tokenResponse.data;
        
        // 2. Stocker les tokens
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // 3. Récupérer les informations de l'utilisateur
        try {
            const userResponse = await api.get('/api/users/me/');
            const user = userResponse.data;
            
            // S'assurer que le rôle est bien défini
            if (!user.role) {
                throw new Error('Le rôle de l\'utilisateur n\'est pas défini');
            }
            
            localStorage.setItem('user', JSON.stringify(user));
            return { access, refresh, user };
        } catch (error) {
            console.error('Erreur lors de la récupération des informations utilisateur:', error);
            // En cas d'erreur, on déconnecte l'utilisateur
            await this.logout();
            throw error;
        }
    }

    static async logout(): Promise<void> {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                await api.post(AUTH_URLS.logout, { refresh: refreshToken });
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    }

    static async verifyToken(): Promise<boolean> {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return false;

            await api.post(AUTH_URLS.verify, { token });
            return true;
        } catch {
            return false;
        }
    }

    static async resetPassword(token: string, newPassword: string): Promise<void> {
        await api.post('/api/users/reset-password-confirm/', {
            token,
            new_password: newPassword
        });
    }

    static async requestPasswordReset(email: string): Promise<void> {
        await api.post('/api/users/reset-password/', { email });
    }

    static getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
}

export default AuthService; 