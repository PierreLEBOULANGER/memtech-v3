/**
 * MemoireTechniqueEditor.tsx
 * Composant principal pour l'édition des mémoires techniques
 * Implémente le layout défini dans memoire_technique.md
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import Editor from '../editor/Editor';
import RCAnalysis from './RCAnalysis';
import { AnalysisResult } from '../../services/analysisService';

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
  const [content, setContent] = useState<string>(JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: ' ' }]
      }
    ]
  }));

  useEffect(() => {
    // TODO: Charger le document avec projectId et documentId
    console.log(`Chargement du document ${documentId} du projet ${projectId}`);
  }, [projectId, documentId]);

  const handleContentChange = (newContent: string) => {
    try {
      const parsedContent = JSON.parse(newContent);
      // S'assurer qu'il n'y a pas de nœuds de texte vides
      if (parsedContent.content) {
        parsedContent.content = parsedContent.content.map((node: any) => {
          if (node.type === 'paragraph' && (!node.content || node.content.length === 0)) {
            return {
              ...node,
              content: [{ type: 'text', text: ' ' }]
            }
          }
          return node;
        });
      }
      setContent(JSON.stringify(parsedContent));
    } catch (e) {
      console.error('Erreur lors du parsing du contenu:', e);
    }
    // Sauvegarde automatique après 1 seconde d'inactivité
    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000);
    return () => clearTimeout(timeoutId);
  };

  // Simuler une sauvegarde
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implémenter la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSave(new Date().toLocaleTimeString());
    } finally {
      setIsSaving(false);
    }
  };

  // Simuler un export
  const handleExport = async () => {
    try {
      // TODO: Implémenter l'export
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  // Gérer l'analyse du RC
  const handleAnalysisComplete = (result: AnalysisResult) => {
    // Convertir le sommaire en format ProseMirror
    const summaryContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Sommaire' }]
        },
        ...result.analysis.structure.map((section, index) => ({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: `${index + 1}. ${section.title}` }]
        })),
        {
          type: 'paragraph',
          content: [{ type: 'text', text: ' ' }]
        }
      ]
    };

    // Mettre à jour le contenu de l'éditeur
    setContent(JSON.stringify(summaryContent));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Barre d'outils supérieure */}
      <div className="border-b p-2 bg-gray-50">
        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">Édition</TabsTrigger>
            <TabsTrigger value="preview">Aperçu</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <div className="flex-1 flex">
              {/* Bibliothèque MT (gauche) */}
              <div className="w-1/3 border-r p-4 bg-white">
                <Card className="h-full bg-white">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Bibliothèque</h3>
                    <ScrollArea.Root className="h-[calc(100vh-200px)]">
                      <ScrollArea.Viewport className="h-full">
                        <div className="space-y-2">
                          <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                            Textes
                          </button>
                          <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                            Tableaux
                          </button>
                          <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                            Photos
                          </button>
                          <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                            Documents
                          </button>
                          <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                            Signalisation
                          </button>
                          <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                            Procédures
                          </button>
                          <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                            Fiches
                          </button>
                        </div>
                      </ScrollArea.Viewport>
                      <ScrollArea.Scrollbar orientation="vertical">
                        <ScrollArea.Thumb />
                      </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                  </div>
                </Card>
              </div>

              {/* Zone d'édition (droite) */}
              <div className="w-2/3 p-4 bg-white">
                <Card className="h-full">
                  <div className="p-4">
                    {/* Bouton d'analyse du RC */}
                    <RCAnalysis
                      projectId={parseInt(projectId)}
                      onAnalysisComplete={handleAnalysisComplete}
                    />
                    <Editor
                      content={content}
                      onChange={handleContentChange}
                    />
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="preview">
            <div className="p-4">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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