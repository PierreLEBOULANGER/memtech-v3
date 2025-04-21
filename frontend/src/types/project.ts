import { User } from './user';

/**
 * Types pour la gestion des projets
 * Définit les interfaces pour les projets et leurs composants associés
 */

export interface MOA {
  id: number;
  name: string;
  logo?: string;
  address: string;
}

export interface MOE {
  id: number;
  name: string;
  logo?: string;
  address: string;
}

export interface RequiredDocument {
  id: number;
  type: string;
  description: string;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ReferenceDocument {
  type: 'RC' | 'CCTP';
  file_url: string;
  name: string;
}

export interface Project {
  id: number;
  name: string;
  status: string;
  status_display: string;
  completion_percentage: number;
  maitre_ouvrage: MOA;
  maitre_oeuvre: MOE;
  offer_delivery_date: string;
  required_documents: RequiredDocument[];
  reference_documents: ReferenceDocument[];
  documents_count?: number;
  last_activity?: string;
}

export interface CreateProjectData {
  name: string;
  client: string;
  description: string;
  start_date: string;
  end_date?: string;
  manager?: number;
  team_members?: number[];
  status?: 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
}

export interface UpdateProjectData extends Partial<CreateProjectData> {} 