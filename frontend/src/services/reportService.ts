// Service de gestion des rapports techniques
// Ce service gère toutes les interactions avec l'API pour les rapports techniques

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Interface pour le rapport technique
export interface TechnicalReport {
    id: number;
    title: string;
    content: string;
    project: number;
    project_name: string;
    author: number;
    author_name: string;
    reviewers: number[];
    reviewer_names: string[];
    status: string;
    status_display: string;
    created_at: string;
    updated_at: string;
}

// Interface pour la création/modification d'un rapport
export interface ReportFormData {
    title: string;
    content: string;
    project: number;
    reviewers: number[];
}

// Service de gestion des rapports
const reportService = {
    // Récupérer la liste des rapports
    getReports: async (): Promise<TechnicalReport[]> => {
        const response = await axios.get(`${API_URL}/reports/`);
        return response.data;
    },

    // Récupérer un rapport spécifique
    getReport: async (id: number): Promise<TechnicalReport> => {
        const response = await axios.get(`${API_URL}/reports/${id}/`);
        return response.data;
    },

    // Créer un nouveau rapport
    createReport: async (data: ReportFormData): Promise<TechnicalReport> => {
        const response = await axios.post(`${API_URL}/reports/`, data);
        return response.data;
    },

    // Mettre à jour un rapport
    updateReport: async (id: number, data: ReportFormData): Promise<TechnicalReport> => {
        const response = await axios.put(`${API_URL}/reports/${id}/`, data);
        return response.data;
    },

    // Supprimer un rapport
    deleteReport: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/reports/${id}/`);
    },

    // Soumettre un rapport pour relecture
    submitForReview: async (id: number): Promise<TechnicalReport> => {
        const response = await axios.post(`${API_URL}/reports/${id}/submit_for_review/`);
        return response.data;
    },

    // Approuver un rapport
    approveReport: async (id: number): Promise<TechnicalReport> => {
        const response = await axios.post(`${API_URL}/reports/${id}/approve/`);
        return response.data;
    },

    // Rejeter un rapport
    rejectReport: async (id: number): Promise<TechnicalReport> => {
        const response = await axios.post(`${API_URL}/reports/${id}/reject/`);
        return response.data;
    },

    // Récupérer mes rapports
    getMyReports: async (): Promise<TechnicalReport[]> => {
        const response = await axios.get(`${API_URL}/reports/my_reports/`);
        return response.data;
    },

    // Récupérer les rapports à relire
    getReportsToReview: async (): Promise<TechnicalReport[]> => {
        const response = await axios.get(`${API_URL}/reports/to_review/`);
        return response.data;
    }
};

export default reportService; 