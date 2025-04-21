/**
 * ProjectFilters.tsx
 * Composant pour gérer les filtres et la recherche des projets
 */

import React from 'react';

interface ProjectFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}) => {
  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'ARCHIVE', label: 'Archivé' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Nom' },
    { value: 'created_at', label: 'Date de création' },
    { value: 'status', label: 'Statut' },
    { value: 'completion', label: 'Progression' },
  ];

  return (
    <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Barre de recherche */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-black/50 text-white border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#ffec00] transition-colors"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-4">
          {/* Filtre par statut */}
          <select
            className="bg-black/50 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#ffec00] transition-colors"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Tri */}
          <select
            className="bg-black/50 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#ffec00] transition-colors"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Trier par {option.label}
              </option>
            ))}
          </select>

          {/* Boutons de vue */}
          <div className="flex rounded-lg border border-gray-700 overflow-hidden">
            <button
              className={`px-3 py-2 ${
                viewMode === 'grid'
                  ? 'bg-[#ffec00] text-black'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={`px-3 py-2 ${
                viewMode === 'list'
                  ? 'bg-[#ffec00] text-black'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
              onClick={() => setViewMode('list')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters; 