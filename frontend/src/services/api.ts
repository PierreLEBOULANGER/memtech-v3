import axios from 'axios';

/**
 * Configuration de base d'Axios pour l'application
 * Gère les requêtes API avec les en-têtes d'authentification et la gestion des erreurs
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// URLs d'authentification
const AUTH_URLS = {
    login: '/api/auth/login/',
    refresh: '/api/auth/refresh/',
    logout: '/api/auth/logout/',
    verify: '/api/auth/verify/'
};

const api = axios.create({
    baseURL: BASE_URL,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Ne pas définir Content-Type pour les requêtes multipart/form-data
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si l'erreur est 401 et que nous n'avons pas déjà tenté de rafraîchir le token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Tentative de rafraîchissement du token
                const response = await axios.post(
                    `${BASE_URL}${AUTH_URLS.refresh}`,
                    { refresh: refreshToken }
                );

                const { access } = response.data;
                localStorage.setItem('access_token', access);

                // Réessayer la requête originale avec le nouveau token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // En cas d'échec du rafraîchissement, déconnexion
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { AUTH_URLS };
export default api; 