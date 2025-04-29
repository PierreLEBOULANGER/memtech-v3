/**
 * Service d'analyse des documents
 * Gère les appels API pour l'analyse du RC et la génération du sommaire
 */

import api from './api';

export interface AnalysisResult {
  analysis: {
    token_count: number;
    sections: Array<{
      number: string;
      title: string;
      level: number;
    }>;
    keywords: string[];
    structure: Array<{
      title: string;
      subsections: string[];
    }>;
  };
  summary: {
    title: string;
    sections: Array<{
      number: string;
      title: string;
      level: number;
    }>;
    sections_by_level: {
      [key: number]: Array<{
        number: string;
        title: string;
        level: number;
      }>;
    };
    recommendations: string[];
  };
}

class AnalysisService {
  /**
   * Lance l'analyse du RC d'un projet
   */
  static async analyzeRC(projectId: number): Promise<AnalysisResult> {
    const response = await api.post(`/api/analysis/${projectId}/analyze_rc/`);
    return response.data;
  }

  /**
   * Récupère le sommaire généré
   */
  static async getSummary(projectId: number): Promise<AnalysisResult> {
    const response = await api.get(`/api/analysis/${projectId}/get_summary/`);
    return response.data;
  }
}

export default AnalysisService; 