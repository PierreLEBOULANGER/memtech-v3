/**
 * RapportTechnique.tsx
 * Page de gestion des rapports techniques
 * Permet de visualiser et gérer les rapports techniques des projets
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const RapportTechnique: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Rapports Techniques
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Cette page permettra de gérer les rapports techniques des projets.
          Fonctionnalités à venir :
        </Typography>
        <ul>
          <li>Liste des rapports techniques</li>
          <li>Création de nouveaux rapports</li>
          <li>Modification des rapports existants</li>
          <li>Visualisation des rapports</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default RapportTechnique; 