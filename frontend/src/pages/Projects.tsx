/**
 * Projects.tsx
 * Page principale de gestion des projets
 * Intègre tous les composants de gestion des projets
 */

import React, { useEffect, useState } from 'react';
import ProjectService from '../services/projectService';
import ProjectHeader from '../components/projects/ProjectHeader';
import ProjectFilters from '../components/projects/ProjectFilters';
import ProjectCard from '../components/projects/ProjectCard';
import { Project } from '../types/project';

const Projects: React.FC = () => {
  // États
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fonction pour rafraîchir la liste des projets
  const refreshProjects = async () => {
    try {
      setLoading(true);
      const data = await ProjectService.getProjects();
      console.log('Projets reçus:', data); // Ajout de log pour debug
      setProjects(data);
    } catch (error) {
      setError('Erreur lors du chargement des projets');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Utilisation de refreshProjects dans useEffect
  useEffect(() => {
    refreshProjects();
  }, []);

  // Filtrage et tri des projets
  const filteredAndSortedProjects = React.useMemo(() => {
    return projects
      .filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.maitre_ouvrage?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.maitre_oeuvre?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = !selectedStatus || project.status === selectedStatus;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'created_at':
            return new Date(b.offer_delivery_date).getTime() - new Date(a.offer_delivery_date).getTime();
          case 'status':
            return a.status.localeCompare(b.status);
          case 'completion':
            return b.completion_percentage - a.completion_percentage;
          default:
            return 0;
        }
      });
  }, [projects, searchQuery, selectedStatus, sortBy]);

  // Statistiques pour l'en-tête
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#ffec00]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <ProjectHeader
        totalProjects={projects.length}
        completedProjects={completedProjects}
      />

      {/* Filtres */}
      <ProjectFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Liste des projets avec onDelete prop */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-400">Aucun projet trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || selectedStatus
              ? 'Essayez de modifier vos filtres'
              : 'Commencez par créer un nouveau projet'}
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }>
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onDelete={refreshProjects}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;