/**
 * Service de gestion des maîtres d'ouvrage (MOA)
 * Gère toutes les opérations CRUD pour les maîtres d'ouvrage
 */

import api from './api';

export interface MOA {
    id: number;
    name: string;
    address: string;
    logo: string | null;
}

export class MOAService {
    static async getMOAs(): Promise<MOA[]> {
        const response = await api.get('/api/moas/');
        return response.data;
    }

    static async getMOA(id: number): Promise<MOA> {
        const response = await api.get(`/api/moas/${id}/`);
        return response.data;
    }

    static async createMOA(moa: Omit<MOA, 'id'>): Promise<MOA> {
        const response = await api.post('/api/moas/', moa);
        return response.data;
    }

    static async updateMOA(id: number, moa: Partial<MOA>): Promise<MOA> {
        const response = await api.put(`/api/moas/${id}/`, moa);
        return response.data;
    }

    static async deleteMOA(id: number): Promise<void> {
        await api.delete(`/api/moas/${id}/`);
    }
}

export default MOAService; 