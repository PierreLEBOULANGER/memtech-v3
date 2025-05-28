/**
 * OnlyOfficeEditor.tsx
 *
 * Ce composant React permet d'intégrer l'éditeur OnlyOffice dans l'application via l'API JS OnlyOffice.
 * ATTENTION : Le script OnlyOffice doit être chargé UNE SEULE FOIS dans le HTML principal (index.html) !
 *
 * IMPORTANT :
 * Le paramètre documentServerUrl n'est PAS reconnu par l'API JS OnlyOffice. L'URL du serveur est déduite automatiquement
 * à partir de l'URL de chargement du script DocsAPI.js (qui doit donc venir du serveur OnlyOffice).
 *
 * Fonctionnement :
 * - Utilise DocsAPI.DocEditor si disponible (le script doit être déjà chargé)
 * - Détruit proprement l'instance précédente à chaque changement de document
 * - Commente chaque étape pour pédagogie
 */

import React, { useEffect, useRef, useState } from 'react';
import sha1 from 'crypto-js/sha1'; // Pour générer un hash unique

// Log pour vérifier le montage du composant
console.log('[OnlyOffice] Composant OnlyOfficeEditor monté');

interface OnlyOfficeEditorProps {
  /**
   * URL du document à éditer (doit être accessible par le serveur OnlyOffice)
   */
  documentUrl: string;
  /**
   * Token JWT pour sécuriser l'accès à OnlyOffice
   */
  onlyofficeToken: string;
}

/**
 * Composant principal pour afficher l'éditeur OnlyOffice dans un conteneur sécurisé.
 * @param documentUrl Lien vers le document à éditer (doit être accessible par le serveur OnlyOffice)
 */
const OnlyOfficeEditor: React.FC<OnlyOfficeEditorProps> = ({ documentUrl, onlyofficeToken }) => {
  // Référence vers le conteneur DOM qui accueillera l'éditeur
  const editorRef = useRef<HTMLDivElement>(null);
  // Référence vers l'instance de l'éditeur pour pouvoir la détruire proprement
  const docEditorRef = useRef<any>(null);
  // État pour suivre la disponibilité de l'API
  const [isApiAvailable, setIsApiAvailable] = useState<boolean>(false);

  // Effet pour vérifier la disponibilité de l'API
  useEffect(() => {
    let checkInterval: number | undefined;
    let attempts = 0;
    const maxAttempts = 20; // 10 secondes maximum (20 * 500ms)

    const checkDocsAPI = () => {
      if ((window as any).DocsAPI) {
        console.log('[OnlyOffice] DocsAPI disponible');
        setIsApiAvailable(true);
        if (checkInterval) {
          window.clearInterval(checkInterval);
        }
      } else {
        attempts++;
        console.log(`[OnlyOffice] En attente de DocsAPI (tentative ${attempts}/${maxAttempts})`);
        if (attempts >= maxAttempts) {
          console.error('[OnlyOffice] DocsAPI non disponible après plusieurs tentatives');
          if (checkInterval) {
            window.clearInterval(checkInterval);
          }
        }
      }
    };

    // Vérification immédiate
    checkDocsAPI();
    
    // Vérification périodique
    if (!(window as any).DocsAPI) {
      checkInterval = window.setInterval(checkDocsAPI, 500);
    }

    return () => {
      if (checkInterval) {
        window.clearInterval(checkInterval);
      }
    };
  }, []);

  // Effet pour la destruction propre de l'éditeur
  useEffect(() => {
    console.log('[OnlyOffice] Montage composant');
    return () => {
      if (docEditorRef.current) {
        console.log('[OnlyOffice] Destruction de l\'éditeur');
        docEditorRef.current.destroyEditor && docEditorRef.current.destroyEditor();
        docEditorRef.current = null;
      }
    };
  }, []);

  // Effet pour l'initialisation de l'éditeur
  useEffect(() => {
    if (!isApiAvailable) {
      console.log('[OnlyOffice] En attente de l\'API...');
      return;
    }

    console.log('[OnlyOffice] useEffect déclenché', { documentUrl, onlyofficeToken });
    
    if (!editorRef.current) {
      console.error('[OnlyOffice] Conteneur non disponible');
      return;
    }

    console.log('[OnlyOffice] DocsAPI et ref OK, création de l\'éditeur');
    
    // Normalisation du chemin (remplace les antislashs par des slashs)
    let onlyofficeUrl = documentUrl.replace(/\\/g, '/');
    
    // Si ce n'est pas une URL absolue, préfixe avec le host
    if (!onlyofficeUrl.startsWith('http')) {
      onlyofficeUrl = `http://localhost:8000${onlyofficeUrl}`;
    }
    
    console.log('[OnlyOffice] URL transmise à OnlyOffice :', onlyofficeUrl);

    // Nettoyage de l'instance précédente si elle existe
    if (docEditorRef.current) {
      docEditorRef.current.destroyEditor();
      docEditorRef.current = null;
    }

    // Construction de la configuration OnlyOffice
    const config = {
      document: {
        fileType: 'docx',
        key: sha1(onlyofficeUrl).toString(),
        title: 'Mémoire technique',
        url: onlyofficeUrl,
      },
      documentType: 'word',
      editorConfig: {
        mode: 'edit',
        lang: 'fr',
        callbackUrl: 'http://host.docker.internal:8000/api/documents/onlyoffice_callback/',
        user: {
          id: '1',
          name: 'Utilisateur',
        },
      },
      permissions: {
        edit: true,
        download: true,
        print: true,
        review: true,
      },
      height: '100%',
      width: '100%',
      token: onlyofficeToken,
      // documentServerUrl supprimé : inutile et ignoré par l'API
    };

    console.log('[OnlyOffice] Config transmise à DocsAPI.DocEditor :', config);

    try {
      // Création de l'instance de l'éditeur
      docEditorRef.current = new (window as any).DocsAPI.DocEditor(editorRef.current, config);
      console.log('[OnlyOffice] DocEditor initialisé, ref :', docEditorRef.current);

      // Vérification du contenu après un délai
      setTimeout(() => {
        if (editorRef.current) {
          console.log('[OnlyOffice] Contenu du div après init :', editorRef.current.innerHTML);
        }
      }, 1000);
    } catch (error) {
      console.error('[OnlyOffice] Erreur lors de l\'initialisation :', error);
    }
  }, [documentUrl, onlyofficeToken, isApiAvailable]); // Ajout de isApiAvailable comme dépendance

  // Affichage du conteneur de l'éditeur
  return (
    <div
      ref={editorRef}
      id="onlyoffice-editor-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px', // pour garantir une hauteur minimale
        border: '2px dashed #ffec00', // bordure jaune temporaire pour debug
        background: '#fffbe6', // fond jaune pâle pour debug
      }}
    />
  );
};

export default OnlyOfficeEditor; 