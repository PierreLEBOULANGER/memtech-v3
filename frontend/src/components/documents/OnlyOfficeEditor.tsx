import { DocumentEditor } from "@onlyoffice/document-editor-react";

const OnlyOfficeEditor = ({ projectId, documentId }: { projectId: string, documentId: string }) => {

  // TODO :: Passer les URLs des services en variables d'environnement

  return (
    <DocumentEditor
      id="docxEditor"
      documentServerUrl="http://localhost:8080/"
      config={{
          "document": {
            "fileType": "docx",
            "key": `memoire_${projectId}_${documentId}`,
            "title": "Mémoire technique",
            "url": `https://courant.eu.ngrok.io/media/memoires/memoire_${projectId}_${documentId}.docx`,
          },
          "documentType": "word",
          "editorConfig": {
              "callbackUrl": "https://courant.eu.ngrok.io/api/documents/onlyoffice_callback/"
          }
      }}
    />
  );
};

export default OnlyOfficeEditor; 