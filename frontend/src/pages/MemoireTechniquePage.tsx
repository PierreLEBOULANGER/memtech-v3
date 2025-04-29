/**
 * MemoireTechniquePage.tsx
 * Page d'édition des mémoires techniques
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MemoireTechniqueEditor from '../components/documents/MemoireTechniqueEditor';
import MemoireTechniqueLayout from '../components/layout/MemoireTechniqueLayout';

const MemoireTechniquePage: React.FC = () => {
  const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();

  useEffect(() => {
    console.log('MemoireTechniquePage - Chargement avec les paramètres:', { projectId, documentId });
  }, [projectId, documentId]);

  if (!projectId || !documentId) {
    console.error('MemoireTechniquePage - Paramètres manquants:', { projectId, documentId });
    return <div>Erreur: ID de projet ou de document manquant</div>;
  }

  return (
    <MemoireTechniqueLayout>
      <MemoireTechniqueEditor 
        projectId={projectId}
        documentId={documentId}
      />
    </MemoireTechniqueLayout>
  );
};

export default MemoireTechniquePage; 