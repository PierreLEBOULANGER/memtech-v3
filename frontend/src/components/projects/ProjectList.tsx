/**
 * ProjectList.tsx
 * Composant pour afficher la liste des projets en format tableau
 * Version alignée avec ProjectCard.tsx pour la cohérence des données
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthContext } from '../../contexts/AuthContext';
import DeleteProjectDialog from './DeleteProjectDialog';
import ProjectService from '../../services/projectService';
import { toast } from 'react-toastify';
import { Project } from '../../types/project';
import { useQueryClient } from '@tanstack/react-query';

const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    'EN_COURS': 'text-green-500',
    'EN_ATTENTE': 'text-yellow-500',
    'TERMINE': 'text-blue-500',
    'ARCHIVE': 'text-gray-500'
  };
  return statusColors[status] || 'text-gray-500';
};

const ProjectList: React.FC = () => {
  const { user } = useAuthContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);

  // Ajout du log pour déboguer le rôle utilisateur
  console.log('ProjectList - User role:', user?.role);

  const { data: projects, isLoading, error, refetch } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: ProjectService.getProjects,
  });

  const queryClient = useQueryClient();

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProject = async (projectId: string, adminPassword: string) => {
    try {
        await ProjectService.deleteProject(projectId, adminPassword);
        // Invalider le cache des projets pour forcer un rafraîchissement
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast({
            title: "Projet supprimé",
            description: "Le projet a été supprimé avec succès.",
            variant: "success",
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la suppression du projet.",
            variant: "destructive",
        });
    }
  };

  if (isLoading) {
    return <div>Chargement des projets...</div>;
  }

  if (error) {
    return <div>Erreur lors du chargement des projets.</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projets</CardTitle>
        <Link to="/projects/new">
          <Button>Nouveau Projet</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Progression</TableHead>
              <TableHead>Maître d'ouvrage</TableHead>
              <TableHead>Maître d'œuvre</TableHead>
              <TableHead>Documents requis</TableHead>
              <TableHead>Documents de référence</TableHead>
              <TableHead>Date de remise</TableHead>
              <TableHead>Dernière activité</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects?.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  <span className={getStatusColor(project.status)}>
                    {project.status_display}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${project.completion_percentage}%` }}
                      />
                    </div>
                    <span>{project.completion_percentage}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {project.maitre_ouvrage?.logo && (
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
                      <div className="font-medium">{project.maitre_ouvrage?.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {project.maitre_ouvrage?.address}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {project.maitre_oeuvre?.logo && (
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
                      <div className="font-medium">{project.maitre_oeuvre?.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {project.maitre_oeuvre?.address}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {project.project_documents.map((doc) => (
                      <div key={doc.id} className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          doc.status === 'APPROVED' ? 'bg-green-500' :
                          doc.status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm">{doc.document_type.type}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {project.reference_documents.map((doc) => (
                      <a
                        key={doc.type}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-700 text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {doc.type}
                      </a>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(project.offer_delivery_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {project.last_activity 
                    ? new Date(project.last_activity).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link to={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm">Voir</Button>
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteClick(project)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {selectedProject && (
        <DeleteProjectDialog
          isOpen={isDeleteDialogOpen}
          projectName={selectedProject.name}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedProject(null);
          }}
          onConfirm={handleDeleteProject}
        />
      )}
    </Card>
  );
};

export default ProjectList; 