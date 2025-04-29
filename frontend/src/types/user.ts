/**
 * user.ts
 * Définition des types pour les utilisateurs
 */

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'ADMIN' | 'PROJECT_MANAGER' | 'WRITER' | 'REVIEWER';
    created_at: string;
    updated_at: string;
    is_active: boolean;
    last_login?: string;
} 