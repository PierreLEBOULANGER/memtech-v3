/**
 * Projects.tsx
 * Page de gestion des projets
 * Affiche la liste des projets et permet d'en créer de nouveaux
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectService from '../services/projectService';
import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Interface définissant la structure d'un projet
interface Project {
  id: number;
  name: string;
  offer_delivery_date: string;
  maitre_ouvrage: string;
  maitre_oeuvre: string;
  status: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await ProjectService.getProjects();
        // Assurez-vous que les données reçues correspondent à l'interface Project
        const formattedProjects = data.map((project: any) => ({
          id: project.id || 0,
          name: project.name || '',
          offer_delivery_date: project.offer_delivery_date || '',
          maitre_ouvrage: project.maitre_ouvrage || '',
          maitre_oeuvre: project.maitre_oeuvre || '',
          status: project.status || ''
        }));
        setProjects(formattedProjects);
      } catch (error) {
        setError('Erreur lors du chargement des projets');
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Chargement des projets...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Projets
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/projects/create"
        >
          Nouveau projet
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {project.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Maître d'ouvrage: {project.maitre_ouvrage}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Maître d'œuvre: {project.maitre_oeuvre}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Date de remise: {new Date(project.offer_delivery_date).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Statut: {project.status}
              </Typography>
              <Button
                component={Link}
                to={`/projects/${project.id}`}
                color="primary"
                sx={{ mt: 2 }}
              >
                Voir les détails
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Projects; 