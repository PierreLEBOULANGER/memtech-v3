import { User } from './user';

export interface Project {
  id: number;
  name: string;
  client: string;
  description: string;
  start_date: string;
  end_date?: string;
  manager: User;
  team_members: User[];
  status: 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
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