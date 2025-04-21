/**
 * Service de gestion des types de documents
 * Gère toutes les opérations liées aux types de documents
 */

import api from './api';

export interface DocumentType {
    id: number;
    type: string;
    description: string;
    is_mandatory: boolean;
}

export class DocumentTypeService {
    static async getDocumentTypes(): Promise<DocumentType[]> {
        const response = await api.get('/api/document-types/');
        return response.data;
    }
}

export default DocumentTypeService; 