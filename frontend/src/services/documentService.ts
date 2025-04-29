/**
 * Service pour la gestion des documents
 * Gère les appels API pour les opérations sur les documents
 */

import api from './api';
import { Document, DocumentComment, DocumentAssignment } from '../types/document';

class DocumentService {
    /**
     * Récupère les documents d'un projet
     */
    static async getProjectDocuments(projectId: number): Promise<Document[]> {
        const response = await api.get(`/api/projects/${projectId}/documents/`);
        return response.data;
    }

    /**
     * Récupère un document spécifique
     */
    static async getDocument(projectId: number, documentId: number): Promise<Document> {
        const response = await api.get(`/api/projects/${projectId}/documents/${documentId}/`);
        return response.data;
    }

    /**
     * Crée un nouveau document
     */
    static async createDocument(projectId: number, data: Partial<Document>): Promise<Document> {
        const response = await api.post(`/api/projects/${projectId}/documents/`, data);
        return response.data;
    }

    /**
     * Met à jour un document
     */
    static async updateDocument(projectId: number, documentId: number, data: Partial<Document>): Promise<Document> {
        const response = await api.patch(`/api/projects/${projectId}/documents/${documentId}/`, data);
        return response.data;
    }

    /**
     * Assigne les rôles (rédacteur et relecteur) à un document
     */
    static async assignRoles(projectId: number, documentId: number, assignment: DocumentAssignment): Promise<Document> {
        const response = await api.post(
            `/api/projects/${projectId}/documents/${documentId}/assign_roles/`,
            assignment
        );
        return response.data;
    }

    /**
     * Change le statut d'un document
     */
    static async changeStatus(projectId: number, documentId: number, status: string): Promise<Document> {
        const response = await api.post(
            `/api/projects/${projectId}/documents/${documentId}/change_status/`,
            { status }
        );
        return response.data;
    }

    /**
     * Ajoute un commentaire à un document
     */
    static async addComment(projectId: number, documentId: number, content: string, requiresCorrection: boolean = false): Promise<Document> {
        const response = await api.post(
            `/api/projects/${projectId}/documents/${documentId}/add_comment/`,
            { content, requires_correction: requiresCorrection }
        );
        return response.data;
    }

    /**
     * Récupère l'historique d'un document
     */
    static async getDocumentHistory(projectId: number, documentId: number): Promise<{
        status_history: any[];
        comments: any[];
    }> {
        const response = await api.get(`/api/projects/${projectId}/documents/${documentId}/history/`);
        return response.data;
    }

    /**
     * Récupère les commentaires d'un document
     */
    static async getDocumentComments(projectId: number, documentId: number): Promise<DocumentComment[]> {
        const response = await api.get(`/api/projects/${projectId}/documents/${documentId}/comments/`);
        return response.data;
    }

    /**
     * Marque un commentaire comme résolu
     */
    static async resolveComment(projectId: number, documentId: number, commentId: number): Promise<DocumentComment> {
        const response = await api.post(
            `/api/projects/${projectId}/documents/${documentId}/comments/${commentId}/resolve/`
        );
        return response.data;
    }
}

export default DocumentService; 