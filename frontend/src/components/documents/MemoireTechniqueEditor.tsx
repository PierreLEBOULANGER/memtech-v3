/**
 * MemoireTechniqueEditor.tsx
 * Composant principal pour l'édition des mémoires techniques
 * Intégration de l'éditeur OnlyOffice.
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import RCAnalysis from './RCAnalysis';
import { AnalysisResult } from '../../services/analysisService';
// import BibliothequeMemoireTechnique from './BibliothequeMemoireTechnique';
import { BibliothequeMemoireTechnique as BibliothequeElement } from '../../types/bibliotheque';
import OnlyOfficeEditor from './OnlyOfficeEditor';
import axios from 'axios';

interface MemoireTechniqueEditorProps {
  projectId: string;
  documentId: string;
}

const MemoireTechniqueEditor: React.FC<MemoireTechniqueEditorProps> = ({
  projectId,
  documentId,
}) => {
  const [lastSave, setLastSave] = useState<string>('Jamais');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // const [content, setContent] = useState<string>('');
  // const [wordUrl, setWordUrl] = useState<string | null>(null);
  // const [documentData, setDocumentData] = useState<string | null>(null);
  const [loadingWordUrl, setLoadingWordUrl] = useState<boolean>(false);
  const [errorWordUrl, setErrorWordUrl] = useState<string | null>(null);
  const [onlyofficeToken, setOnlyofficeToken] = useState<string | null>(null);

  // Référence vers OnlyOfficeEditor
  // const onlyOfficeRef = useRef<any>(null);

  // useEffect(() => {
  //   console.log(`[MemoireTechniqueEditor] Chargement du document ${documentId} du projet ${projectId}`);
  // }, [projectId, documentId]);

  // useEffect(() => {
  //   const fetchWordUrl = async () => {
  //     setLoadingWordUrl(true);
  //     setErrorWordUrl(null);
  //     try {
  //       const authToken = localStorage.getItem('access_token');
  //       const response = await axios.get(
  //         `/api/documents/${documentId}/word_url/`,
  //         {
  //           headers: {
  //             'Authorization': `Bearer ${authToken}`
  //           }
  //         }
  //       );
  //       setOnlyofficeToken(response.data.token);
  //     } catch (error: any) {
  //       console.error('[MemoireTechniqueEditor] Erreur lors du chargement :', error);
  //       setErrorWordUrl("Impossible de charger le document Word : " + (error?.response?.data?.error || error.message));
  //     } finally {
  //       setLoadingWordUrl(false);
  //     }
  //   };
  //   fetchWordUrl();
  // }, []);




  // Log de l'état avant le rendu
  // useEffect(() => {
  //   console.log('[MemoireTechniqueEditor] State mis à jour', {
  //     wordUrl,
  //     onlyofficeToken,
  //     loadingWordUrl,
  //     errorWordUrl
  //   });
  // }, [wordUrl, onlyofficeToken, loadingWordUrl, errorWordUrl]);

  // Fonction d'insertion depuis la bibliothèque (à adapter pour OnlyOffice)
  // const handleInsertFromBibliotheque = (element: BibliothequeElement) => {
  //   // À implémenter avec l'API OnlyOffice
  //   alert('Insertion dans OnlyOffice à implémenter');
  // };

  // Simuler une sauvegarde
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSave(new Date().toLocaleTimeString());
    } finally {
      setIsSaving(false);
    }
  };

  // Simuler un export
  const handleExport = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  // Gérer l'analyse du RC
  const handleAnalysisComplete = (result: AnalysisResult) => {
    // À adapter pour OnlyOffice
    alert('Insertion du sommaire dans OnlyOffice à implémenter');
  };

  // // Gestion du drop dans l'éditeur (à adapter pour OnlyOffice)
  // const handleDrop = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   alert('Drag & drop dans OnlyOffice à implémenter');
  // };

  // // Gestion du drag over
  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.dataTransfer.dropEffect = 'copy';
  // };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="edit" className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="edit">Édition</TabsTrigger>
            <TabsTrigger value="preview">Aperçu</TabsTrigger>
          </TabsList>
        <TabsContent value="edit" className="flex-1">
          <div className="grid grid-cols-[300px_1fr] gap-4 h-full">
            <ScrollArea.Root className="h-full">
              <ScrollArea.Viewport>
                {/* <BibliothequeMemoireTechnique
                  onInsert={handleInsertFromBibliotheque}
                /> */}
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical">
                <ScrollArea.Thumb />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
            <div className="flex flex-col h-full">
                <Card className="h-full">
                  <div className="p-4">
                    <RCAnalysis
                      projectId={parseInt(projectId)}
                      onAnalysisComplete={handleAnalysisComplete}
                    />
                  <div className="editor-wrapper" style={{ height: 'calc(100vh - 300px)' }}>
                    {loadingWordUrl && (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500">Chargement du document Word...</span>
                      </div>
                    )}
                    {errorWordUrl && (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-red-500">{errorWordUrl}</span>
                      </div>
                    )}
                      <div className="h-full">
                        <OnlyOfficeEditor
                          projectId={projectId}
                          documentId={documentId}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="preview">
            <div className="p-4">
            <div className="prose max-w-none text-gray-500">
              Aperçu non disponible (géré par OnlyOffice)
              </div>
            </div>
          </TabsContent>
        </Tabs>
      {/* Barre d'état inférieure */}
      <div className="border-t p-2 flex justify-between items-center bg-gray-50">
        <div className="text-sm text-gray-500">
          Dernière sauvegarde: {lastSave}
        </div>
        <div className="space-x-2">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button 
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={handleExport}
          >
            Exporter
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoireTechniqueEditor; 