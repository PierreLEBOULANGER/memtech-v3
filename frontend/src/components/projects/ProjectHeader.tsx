/**
 * ProjectHeader.tsx
 * Composant pour l'en-tête de la page des projets
 * Affiche le titre et les actions principales
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface ProjectHeaderProps {
  totalProjects: number;
  completedProjects: number;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  totalProjects,
  completedProjects,
}) => {
  const completionPercentage = totalProjects > 0
    ? Math.round((completedProjects / totalProjects) * 100)
    : 0;

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-4xl font-bold text-[#ffec00] mb-2">
            Projets
          </h1>
          <p className="text-gray-400">
            {totalProjects} projet{totalProjects > 1 ? 's' : ''} au total, {completedProjects} terminé{completedProjects > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Statistiques rapides */}
          <div className="hidden md:block bg-black/30 backdrop-blur-sm rounded-lg p-4 mr-4">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-400">Progression globale</p>
                <p className="text-2xl font-bold text-[#ffec00]">{completionPercentage}%</p>
              </div>
              <div className="h-12 w-12 relative">
                <svg className="transform -rotate-90 w-12 h-12">
                  <circle
                    className="text-gray-700"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="20"
                    cx="24"
                    cy="24"
                  />
                  <circle
                    className="text-[#ffec00]"
                    strokeWidth="4"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 * (1 - completionPercentage / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="20"
                    cx="24"
                    cy="24"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Bouton Nouveau Projet */}
          <Link
            to="/projects/create"
            className="inline-flex items-center px-4 py-2 bg-[#ffec00] text-black rounded-lg hover:bg-[#ffec00]/90 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau projet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader; 