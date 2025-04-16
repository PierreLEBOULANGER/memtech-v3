/**
 * Service de gestion des projets
 * Gère toutes les opérations CRUD pour les projets
 */

import api from './api';

export interface Project {
    id?: number;
    name: string;
    offer_delivery_date: string;
    maitre_ouvrage: string;
    maitre_oeuvre: string;
    status: string;
}

export class ProjectService {
    static async getProjects(): Promise<Project[]> {
        const response = await api.get('/api/projects/');
        return response.data;
    }

    static async getProject(id: number): Promise<Project> {
        const response = await api.get(`/api/projects/${id}/`);
        return response.data;
    }

    static async createProject(project: Project): Promise<Project> {
        const response = await api.post('/api/projects/', project);
        return response.data;
    }

    static async updateProject(id: number, project: Project): Promise<Project> {
        const response = await api.put(`/api/projects/${id}/`, project);
        return response.data;
    }

    static async deleteProject(id: number): Promise<void> {
        await api.delete(`/api/projects/${id}/`);
    }

    static async addTeamMember(projectId: number, userId: number): Promise<void> {
        await api.post(`/api/projects/${projectId}/add_team_member/`, { user_id: userId });
    }

    static async removeTeamMember(projectId: number, userId: number): Promise<void> {
        await api.post(`/api/projects/${projectId}/remove_team_member/`, { user_id: userId });
    }

    static async getProjectStatistics(projectId: number): Promise<any> {
        const response = await api.get(`/api/projects/${projectId}/statistics/`);
        return response.data;
    }
}

export default ProjectService; 