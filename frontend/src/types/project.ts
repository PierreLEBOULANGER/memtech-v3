import { User } from './user';
import { Document } from './document';

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
  offer_delivery_date: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  last_activity?: string;
  maitre_ouvrage: {
    id: number;
    name: string;
    address?: string;
    logo?: string;
  };
  maitre_oeuvre: {
    id: number;
    name: string;
    address?: string;
    logo?: string;
  };
  project_documents: Document[];
  reference_documents: {
    id: number;
    type: string;
    type_display: string;
    file_url: string;
    name: string;
  }[];
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