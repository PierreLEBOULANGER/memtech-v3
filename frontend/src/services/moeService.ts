/**
 * Service de gestion des maîtres d'œuvre (MOE)
 * Gère toutes les opérations CRUD pour les maîtres d'œuvre
 */

import api from './api';

export interface MOE {
    id: number;
    name: string;
    address: string;
    logo: string | null;
}

export class MOEService {
    static async getMOEs(): Promise<MOE[]> {
        const response = await api.get('/api/moes/');
        return response.data;
    }

    static async getMOE(id: number): Promise<MOE> {
        const response = await api.get(`/api/moes/${id}/`);
        return response.data;
    }

    static async createMOE(moe: Omit<MOE, 'id'>): Promise<MOE> {
        const response = await api.post('/api/moes/', moe);
        return response.data;
    }

    static async updateMOE(id: number, moe: Partial<MOE>): Promise<MOE> {
        const response = await api.put(`/api/moes/${id}/`, moe);
        return response.data;
    }

    static async deleteMOE(id: number): Promise<void> {
        await api.delete(`/api/moes/${id}/`);
    }
}

export default MOEService; 