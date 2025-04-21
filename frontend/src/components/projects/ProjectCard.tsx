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
import { toast } from 'react-toastify';
import { Project } from '../../types/project';

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

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    try {
      await ProjectService.deleteProject(project.id, password);
      toast.success('Le projet a été supprimé avec succès');
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression du projet';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
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
                      src={project.maitre_ouvrage.logo} 
                      alt={project.maitre_ouvrage.name}
                      className="w-8 h-8 rounded-full mr-2"
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
                      src={project.maitre_oeuvre.logo} 
                      alt={project.maitre_oeuvre.name}
                      className="w-8 h-8 rounded-full mr-2"
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
            {project.required_documents && project.required_documents.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm text-gray-300 mb-2">Documents requis</h3>
                <div className="space-y-2">
                  {project.required_documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{doc.type}</div>
                        <div className="text-sm text-gray-400">{doc.description}</div>
                      </div>
                      {doc.status && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          doc.status === 'COMPLETED' ? 'bg-green-500' :
                          doc.status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}>
                          {doc.status}
                        </span>
                      )}
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
              to={`/projects/${project.id}`}
              className="inline-flex items-center text-[#ffec00] hover:text-[#ffec00]/80 transition-colors"
            >
              <span>Voir les détails</span>
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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