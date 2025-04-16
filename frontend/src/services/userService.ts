// Service de gestion des utilisateurs
// Ce service gère toutes les interactions avec l'API pour les utilisateurs

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configuration des en-têtes avec le token
const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

// Interface pour l'utilisateur
export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
}

// Service de gestion des utilisateurs
const userService = {
    // Récupérer la liste des utilisateurs
    getUsers: async (): Promise<User[]> => {
        const response = await axios.get(`${API_URL}/users/`, getAuthHeaders());
        return response.data;
    },

    // Récupérer un utilisateur spécifique
    getUser: async (id: number): Promise<User> => {
        const response = await axios.get(`${API_URL}/users/${id}/`, getAuthHeaders());
        return response.data;
    },

    // Récupérer le profil de l'utilisateur connecté
    getCurrentUser: async (): Promise<User> => {
        const response = await axios.get(`${API_URL}/users/me/`, getAuthHeaders());
        return response.data;
    }
};

export default userService; 