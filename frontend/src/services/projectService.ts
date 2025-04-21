/**
 * Service de gestion des projets
 * Gère les appels API pour les opérations CRUD sur les projets
 */

import api from './api';
import { Project } from '../types/project';

export interface ProjectStatistics {
    total_documents: number;
    completed_documents: number;
    in_progress_documents: number;
    documents_by_type: {
        [key: string]: {
            total: number;
            completed: number;
        };
    };
}

export interface DeleteProjectResponse {
    success: boolean;
    message: string;
}

class ProjectService {
    static async getProjects(): Promise<Project[]> {
        const response = await api.get('/api/projects/');
        return response.data;
    }

    static async getProject(id: number): Promise<Project> {
        const response = await api.get(`/api/projects/${id}/`);
        return response.data;
    }

    static async createProject(projectData: Partial<Project>): Promise<Project> {
        const response = await api.post('/api/projects/', projectData);
        return response.data;
    }

    static async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
        const response = await api.put(`/api/projects/${id}/`, projectData);
        return response.data;
    }

    static async deleteProject(id: number, password: string): Promise<void> {
        await api.delete(`/api/projects/${id}/`, {
            data: { admin_password: password }
        });
    }

    static async getProjectStatistics(id: number): Promise<ProjectStatistics> {
        const response = await api.get(`/api/projects/${id}/statistics/`);
        return response.data;
    }

    static async getProjectDocumentsStatus(id: number): Promise<any> {
        const response = await api.get(`/api/projects/${id}/documents_status/`);
        return response.data;
    }

    static async addTeamMember(projectId: number, userId: number): Promise<void> {
        await api.post(`/api/projects/${projectId}/add_team_member/`, { user_id: userId });
    }

    static async removeTeamMember(projectId: number, userId: number): Promise<void> {
        await api.post(`/api/projects/${projectId}/remove_team_member/`, { user_id: userId });
    }

    static async addRequiredDocuments(projectId: number, documentIds: number[]): Promise<void> {
        await api.post(`/api/projects/${projectId}/add_required_documents/`, {
            document_type_ids: documentIds
        });
    }

    static async searchProjects(query: string): Promise<Project[]> {
        const response = await api.get('/api/projects/', {
            params: { search: query }
        });
        return response.data;
    }

    static async filterProjects(filters: {
        status?: string;
        start_date?: string;
        end_date?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    }): Promise<Project[]> {
        const response = await api.get('/api/projects/', { params: filters });
        return response.data;
    }
}

export default ProjectService; 