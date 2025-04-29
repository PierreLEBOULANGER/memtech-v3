/**
 * RCAnalysis.tsx
 * Composant pour l'analyse du RC et la génération du sommaire
 */

import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Box, Typography } from '@mui/material';
import { AutoFixHigh as AutoFixHighIcon } from '@mui/icons-material';
import AnalysisService, { AnalysisResult } from '../../services/analysisService';

interface RCAnalysisProps {
  projectId: number;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const RCAnalysis: React.FC<RCAnalysisProps> = ({ projectId, onAnalysisComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AnalysisService.analyzeRC(projectId);
      onAnalysisComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse du RC");
      console.error('Erreur lors de l\'analyse du RC:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
        onClick={handleAnalyze}
        disabled={loading}
        sx={{
          backgroundColor: '#ffec00',
          color: 'black',
          '&:hover': {
            backgroundColor: 'rgba(255, 236, 0, 0.8)'
          },
          '&:disabled': {
            backgroundColor: 'rgba(255, 236, 0, 0.3)'
          }
        }}
      >
        {loading ? "Analyse en cours..." : "Analyser le RC"}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default RCAnalysis; 