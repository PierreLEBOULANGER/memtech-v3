/**
 * ProjectCard.tsx
 * Composant pour afficher une carte de projet individuelle
 * Affiche les informations principales d'un projet avec des indicateurs visuels
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import DeleteProjectDialog from './DeleteProjectDialog';
import ProjectService from '../../services/projectService';
import DocumentService from '../../services/documentService';
import { toast } from 'react-toastify';
import { Project } from '../../types/project';
import { Document, DocumentAssignment } from '../../types/document';
import { User } from '../../types/user';
import { Button } from '../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Ajout de la configuration de l'URL de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ProjectCardProps {
  project: Project;
  onDelete?: () => void;
}

const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    'IN_PROGRESS': 'bg-green-500',
    'PENDING': 'bg-yellow-500',
    'COMPLETED': 'bg-blue-500',
    'CANCELLED': 'bg-gray-500'
  };
  return statusColors[status] || 'bg-gray-500';
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const { user } = useAuthContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isRoleAssignmentOpen, setIsRoleAssignmentOpen] = useState(false);
  const queryClient = useQueryClient();

  // Récupérer la liste des rédacteurs
  const { data: writers } = useQuery<User[]>({
    queryKey: ['users', 'WRITER'],
    queryFn: async () => {
      const response = await fetch('/api/users/?role=WRITER');
      return response.json();
    }
  });

  // Récupérer la liste des relecteurs
  const { data: reviewers } = useQuery<User[]>({
    queryKey: ['users', 'REVIEWER'],
    queryFn: async () => {
      const response = await fetch('/api/users/?role=REVIEWER');
      return response.json();
    }
  });

  // Mutation pour l'assignation des rôles
  const assignRolesMutation = useMutation({
    mutationFn: (assignment: DocumentAssignment) =>
      DocumentService.assignRoles(project.id, selectedDocument!.id, assignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Rôles assignés avec succès');
      setIsRoleAssignmentOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation des rôles');
    }
  });

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    try {
      await ProjectService.deleteProject(project.id, password);
      toast.success('Le projet a été supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression du projet';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleRoleAssignment = (doc: Document) => {
    setSelectedDocument(doc);
    setIsRoleAssignmentOpen(true);
  };

  const handleAssignRoles = (writerId: string, reviewerId: string) => {
    if (!selectedDocument) return;

    const assignment: DocumentAssignment = {};
    if (writerId) assignment.writer_id = parseInt(writerId);
    if (reviewerId) assignment.reviewer_id = parseInt(reviewerId);

    assignRolesMutation.mutate(assignment);
  };

  return (
    <>
      <div className="bg-black/50 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg text-white hover:transform hover:scale-102 transition-all duration-200">
        <div className="p-5">
          {/* En-tête de la carte */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#ffec00]/10 rounded-md p-3">
                <svg className="h-6 w-6 text-[#ffec00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-[#ffec00] truncate">
                  {project.name}
                </h2>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status_display || project.status}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-300">Progression</span>
              <span className="text-sm text-[#ffec00]">{project.completion_percentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-[#ffec00] h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.completion_percentage || 0}%` }}
              />
            </div>
          </div>

          {/* Informations du projet */}
          <div className="space-y-4 mb-4">
            {/* MOA */}
            {project.maitre_ouvrage && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  {project.maitre_ouvrage.logo && (
                    <img 
                      src={`data:image/png;base64,${project.maitre_ouvrage.logo}`}
                      alt={project.maitre_ouvrage.name}
                      className="w-8 h-8 rounded-full mr-2 object-cover object-center"
                      style={{
                        maxWidth: '32px',
                        maxHeight: '32px',
                        objectFit: 'cover',
                        border: '1px solid rgba(255, 236, 0, 0.2)'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZWMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5MT0dPPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  )}
                  <div>
                    <div className="text-sm text-gray-300">Maître d'ouvrage</div>
                    <div className="font-medium">{project.maitre_ouvrage.name}</div>
                  </div>
                </div>
                {project.maitre_ouvrage.address && (
                  <div className="text-sm text-gray-400">{project.maitre_ouvrage.address}</div>
                )}
              </div>
            )}

            {/* MOE */}
            {project.maitre_oeuvre && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  {project.maitre_oeuvre.logo && (
                    <img 
                      src={`data:image/png;base64,${project.maitre_oeuvre.logo}`}
                      alt={project.maitre_oeuvre.name}
                      className="w-8 h-8 rounded-full mr-2 object-cover object-center"
                      style={{
                        maxWidth: '32px',
                        maxHeight: '32px',
                        objectFit: 'cover',
                        border: '1px solid rgba(255, 236, 0, 0.2)'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZWMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5MT0dPPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  )}
                  <div>
                    <div className="text-sm text-gray-300">Maître d'œuvre</div>
                    <div className="font-medium">{project.maitre_oeuvre.name}</div>
                  </div>
                </div>
                {project.maitre_oeuvre.address && (
                  <div className="text-sm text-gray-400">{project.maitre_oeuvre.address}</div>
                )}
              </div>
            )}

            {/* Documents requis */}
            {project.project_documents && project.project_documents.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm text-gray-300 mb-2">Documents requis</h3>
                <div className="space-y-2">
                  {project.project_documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{doc.document_type.type}</div>
                        <div className="text-sm text-gray-400">{doc.document_type.description}</div>
                        {/* Affichage des rôles */}
                        <div className="mt-1 space-y-1">
                          {doc.writer && (
                            <div className="text-sm text-gray-300">
                              Rédacteur: {doc.writer.first_name} {doc.writer.last_name}
                            </div>
                          )}
                          {doc.reviewer && (
                            <div className="text-sm text-gray-300">
                              Relecteur: {doc.reviewer.first_name} {doc.reviewer.last_name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {doc.status && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            doc.status === 'APPROVED' ? 'bg-green-500' :
                            doc.status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}>
                            {doc.status_display || doc.status}
                          </span>
                        )}
                        {user?.role === 'ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRoleAssignment(doc as Document)}
                          >
                            Assigner les rôles
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents de référence */}
            {project.reference_documents && project.reference_documents.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm text-gray-300 mb-2">Documents de référence</h3>
                <div className="space-y-2">
                  {project.reference_documents.map((doc) => (
                    <a
                      key={doc.type}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-[#ffec00] hover:text-[#ffec00]/80"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {doc.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center text-sm">
              <span className="text-gray-300 w-32">Date de remise:</span>
              <span className="text-white">
                {project.offer_delivery_date ? new Date(project.offer_delivery_date).toLocaleDateString() : 'Non définie'}
              </span>
            </div>
            {project.last_activity && (
              <div className="flex items-center text-sm">
                <span className="text-gray-300 w-32">Dernière activité:</span>
                <span className="text-white">
                  {new Date(project.last_activity).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
            <Link
              to={`/projects/${project.id}/documents`}
              className="inline-flex items-center text-[#ffec00] hover:text-[#ffec00]/80 transition-colors"
            >
              <span>Rédiger les documents</span>
            </Link>
            
            {user?.role === 'ADMIN' && (
              <button
                onClick={handleDeleteClick}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dialog pour l'assignation des rôles */}
      <Dialog open={isRoleAssignmentOpen} onOpenChange={setIsRoleAssignmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner les rôles</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Rédacteur
              </label>
              <Select
                value={selectedDocument?.writer?.id.toString()}
                onValueChange={(value: string) => handleAssignRoles(value, selectedDocument?.reviewer?.id.toString() || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rédacteur" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(writers) ? writers : []).map((writer: User) => (
                    <SelectItem
                      key={writer.id}
                      value={writer.id.toString()}
                    >
                      {writer.first_name} {writer.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Relecteur
              </label>
              <Select
                value={selectedDocument?.reviewer?.id.toString()}
                onValueChange={(value: string) => handleAssignRoles(selectedDocument?.writer?.id.toString() || '', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un relecteur" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(reviewers) ? reviewers : []).map((reviewer: User) => (
                    <SelectItem
                      key={reviewer.id}
                      value={reviewer.id.toString()}
                    >
                      {reviewer.first_name} {reviewer.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteProjectDialog
        isOpen={isDeleteDialogOpen}
        projectName={project.name}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default ProjectCard; 