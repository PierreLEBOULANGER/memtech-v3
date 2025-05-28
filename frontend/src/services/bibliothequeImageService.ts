/**
 * Service pour interagir avec l'API des images BLOB de la bibliothèque.
 * Toutes les requêtes sont protégées : le token JWT est envoyé dans le header Authorization.
 */

import axios from 'axios';
import { BibliothequeImage } from '../types/bibliotheque';

const API_URL = '/api/images/';

// Fonction utilitaire pour récupérer le token JWT depuis le localStorage
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Récupère toutes les images, ou celles liées à un élément précis
export async function getBibliothequeImages(elementId?: number): Promise<BibliothequeImage[]> {
  const params = elementId ? { element: elementId } : {};
  const response = await axios.get<BibliothequeImage[]>(API_URL, {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
}

// Upload une image en base64 (BLOB) dans la bibliothèque
export async function uploadBibliothequeImage(
  file: File,
  elementId?: number
): Promise<BibliothequeImage> {
  // Lecture du fichier en base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const data = {
    filename: file.name,
    mime_type: file.type,
    image_blob: base64,
    element: elementId ?? null,
  };

  const response = await axios.post<BibliothequeImage>(API_URL, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
} 