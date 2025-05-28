/**
 * Ce fichier définit les types TypeScript pour la bibliothèque des Mémoires Techniques.
 * Il inclut le type pour les images stockées en BLOB (base64) dans la base de données.
 */

// Tag associé à un élément de la bibliothèque
export interface BibliothequeTag {
  id: number;
  nom: string;
}

// Commentaire sur un élément de la bibliothèque
export interface BibliothequeCommentaire {
  id: number;
  auteur: number; // id utilisateur
  auteur_nom: string;
  texte: string;
  date: string; // ISO
}

// Note attribuée à un élément de la bibliothèque
export interface BibliothequeNote {
  id: number;
  auteur: number; // id utilisateur
  auteur_nom: string;
  valeur: number; // 1 à 5
  date: string; // ISO
}

// Élément principal de la bibliothèque des Mémoires Techniques
export interface BibliothequeMemoireTechnique {
  id: number;
  type_document: string;
  categorie: string;
  titre: string;
  contenu: string;
  auteur: number;
  auteur_nom: string;
  date_creation: string;
  date_modification: string;
  tags: BibliothequeTag[];
  version: number;
  droits_acces: string;
  favoris: number[];
  recent: string | null;
  commentaires: BibliothequeCommentaire[];
  notes: BibliothequeNote[];
}

export interface BibliothequeImage {
  id: number;
  element: number | null; // Lien vers l'élément parent, ou null
  filename: string;
  mime_type: string;
  date_ajout: string;
  image_base64: string; // Image encodée en base64 pour affichage direct
} 