// Ce fichier définit le service d'appel API pour la bibliothèque des Mémoires Techniques.
// Il permet d'interagir avec le backend (Django REST API) pour récupérer, rechercher,
// ajouter ou insérer des éléments de la bibliothèque.
// Chaque fonction est commentée pour faciliter la compréhension.

import api from './api';
import {
  BibliothequeMemoireTechnique,
  BibliothequeTag,
  BibliothequeCommentaire,
  BibliothequeNote
} from '../types/bibliotheque';

const API_URL = '/api/elements/'; // Endpoint principal pour la bibliothèque

// Récupère la liste de tous les éléments de la bibliothèque
export async function getBibliothequeElements(): Promise<BibliothequeMemoireTechnique[]> {
  console.log('Appel API getBibliothequeElements');
  const response = await api.get<BibliothequeMemoireTechnique[]>(API_URL);
  return response.data;
}

// Récupère uniquement les textes de la bibliothèque
export async function getBibliothequeTextes(): Promise<BibliothequeMemoireTechnique[]> {
  console.log('Appel API getBibliothequeTextes');
  const response = await api.get<BibliothequeMemoireTechnique[]>(`${API_URL}textes/`);
  return response.data;
}

// Crée des photos de test dans la bibliothèque
export async function createTestPhotos(): Promise<BibliothequeMemoireTechnique[]> {
  console.log('Appel API createTestPhotos');
  const response = await api.post<{ message: string; photos: BibliothequeMemoireTechnique[] }>(`${API_URL}create_test_photos/`);
  return response.data.photos;
}

// Recherche des éléments de la bibliothèque par mot-clé ou filtre
export async function searchBibliothequeElements(query: string): Promise<BibliothequeMemoireTechnique[]> {
  console.log('Appel API searchBibliothequeElements avec query:', query);
  const response = await api.get<BibliothequeMemoireTechnique[]>(API_URL, {
    params: { search: query }
  });
  return response.data;
}

// Récupère un élément précis de la bibliothèque par son ID
export async function getBibliothequeElement(id: number): Promise<BibliothequeMemoireTechnique> {
  console.log('Appel API getBibliothequeElement avec id:', id);
  const response = await api.get<BibliothequeMemoireTechnique>(`${API_URL}${id}/`);
  return response.data;
}

// Ajoute un nouvel élément à la bibliothèque
export async function addBibliothequeElement(element: Partial<BibliothequeMemoireTechnique>): Promise<BibliothequeMemoireTechnique> {
  console.log('Appel API addBibliothequeElement avec element:', element);
  const response = await api.post<BibliothequeMemoireTechnique>(API_URL, element);
  return response.data;
}

// Insère un élément de la bibliothèque dans l'éditeur (fonction utilitaire)
// Cette fonction retourne le contenu à insérer (texte, HTML, etc.)
export async function getElementContentForInsert(id: number): Promise<string> {
  console.log('Appel API getElementContentForInsert avec id:', id);
  const element = await getBibliothequeElement(id);
  return element.contenu;
} 