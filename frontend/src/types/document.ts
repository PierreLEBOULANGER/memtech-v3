/**
 * document.ts
 * Définition des types pour les documents du projet
 */

import { User } from './user';

export interface DocumentType {
    id: number;
    type: string;
    description: string;
    is_mandatory: boolean;
}

export interface Document {
    id: number;
    project: number;
    document_type: DocumentType;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'IN_CORRECTION' | 'APPROVED';
    status_display?: string;
    writer?: User;
    reviewer?: User;
    comments: Comment[];
    created_at: string;
    updated_at: string;
    version: number;
    content?: string;
}

export interface Comment {
    id: number;
    document: number;
    user: User;
    content: string;
    created_at: string;
    type: 'GENERAL' | 'REVIEW' | 'CORRECTION';
}

export interface DocumentComment {
    id: number;
    document: number;
    author: User;
    content: string;
    created_at: string;
    review_cycle: number;
    requires_correction: boolean;
    resolved: boolean;
}

export interface StatusHistoryEntry {
    from_status: string;
    to_status: string;
    user: number;
    timestamp: string;
}

export interface DocumentAssignment {
    writer_id?: number;
    reviewer_id?: number;
}

export interface DocumentHistory {
    status_history: StatusHistoryEntry[];
    comments: DocumentComment[];
} 