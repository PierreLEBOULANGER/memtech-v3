// -----------------------------------------------------------------------------
// BibliothequeMemoireTechnique.tsx
// Composant principal de la bibliothèque des Mémoires Techniques.
// Affiche un panneau latéral de catégories (Textes, Tableaux, Photos, etc.)
// et permet de filtrer dynamiquement les éléments de la bibliothèque.
// Gère désormais les images uniquement en BLOB (base64) via l'API dédiée.
// Toute gestion de photo (affichage, insertion, prévisualisation) passe par le BLOB/base64.
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { BibliothequeMemoireTechnique as BibliothequeElement, BibliothequeImage } from '../../types/bibliotheque';
import { getBibliothequeElements, searchBibliothequeElements, getBibliothequeTextes } from '../../services/bibliothequeService';
import { getBibliothequeImages, uploadBibliothequeImage } from '../../services/bibliothequeImageService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, X, ChevronDown, ChevronRight, FileText, Image } from 'lucide-react';

// Liste des catégories disponibles (doit correspondre au backend)
const CATEGORIES = [
  { key: 'texte', label: 'Textes' },
  { key: 'photo', label: 'Photos' },
  { key: 'tableau', label: 'Tableaux' },
  { key: 'document_technique', label: 'Documents techniques' },
  { key: 'signalisation', label: 'Signalisation' },
  { key: 'procedure', label: 'Procédures' },
  { key: 'fiche_technique', label: 'Fiches techniques' },
];

// Sous-catégories pour les photos
const PHOTO_CATEGORIES = [
  { key: 'chantier', label: 'Photos de chantier' },
  { key: 'equipement', label: 'Équipements' },
  { key: 'installation', label: 'Installations' },
  { key: 'documentation', label: 'Documentation' },
];

// Props du composant : onSelect est appelée avec l'élément sélectionné
interface BibliothequeMemoireTechniqueProps {
  onSelect: (element: BibliothequeElement) => void;
  onClose?: () => void; // Pour fermer la modal/drawer si besoin
}

/**
 * Composant principal de la bibliothèque des Mémoires Techniques
 * Affiche un panneau latéral de catégories et filtre dynamiquement les éléments.
 */
const BibliothequeMemoireTechnique: React.FC<BibliothequeMemoireTechniqueProps> = ({ onSelect, onClose }) => {
  // État pour la liste des éléments
  const [elements, setElements] = useState<BibliothequeElement[]>([]);
  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  // État pour l'élément sélectionné (prévisualisation)
  const [selected, setSelected] = useState<string | null>(null);
  // État de chargement
  const [loading, setLoading] = useState(false);
  // État d'erreur
  const [error, setError] = useState<string | null>(null);
  // État pour la catégorie sélectionnée
  const [activeCategory, setActiveCategory] = useState<'texte' | 'tableau' | 'image'>('texte');
  // État pour l'élément sélectionné (prévisualisation)
  const [selectedElement, setSelectedElement] = useState<BibliothequeElement | null>(null);
  // État pour gérer l'expansion du menu des textes
  const [isTextesExpanded, setIsTextesExpanded] = useState(true);
  // État pour gérer l'expansion du menu des photos
  const [isPhotosExpanded, setIsPhotosExpanded] = useState(false);
  // État pour la sous-catégorie sélectionnée pour les photos
  const [activePhotoCategory, setActivePhotoCategory] = useState<string | null>(null);
  // État pour la liste des images
  const [images, setImages] = useState<BibliothequeImage[]>([]);
  // State pour la sous-catégorie sélectionnée (null = toutes)
  const [selectedSousCategorie, setSelectedSousCategorie] = useState<string | null>(null);

  // Fonction pour charger les éléments selon la catégorie
  const loadElements = async (category: string) => {
    console.log('Chargement des éléments pour la catégorie:', category);
    setLoading(true);
    try {
      if (category === 'texte') {
        console.log('Chargement des textes...');
        const data = await getBibliothequeTextes();
        console.log('Textes reçus:', data);
        setElements(data);
      } else if (category === 'photo') {
        console.log('Chargement des photos...');
        const data = await getBibliothequeElements();
        console.log('Photos reçues:', data);
        setElements(data.filter(e => e.categorie === 'photo'));
      } else {
        console.log('Chargement de tous les éléments...');
        const data = await getBibliothequeElements();
        console.log('Éléments reçus:', data);
        setElements(data);
      }
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur lors du chargement des éléments');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les images BLOB
  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await getBibliothequeImages();
      setImages(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des images');
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial et lors du changement de catégorie
  useEffect(() => {
    loadElements(activeCategory);
  }, [activeCategory]);

  // useEffect pour charger les images BLOB quand la catégorie 'photo' est active
  useEffect(() => {
    if (activeCategory === 'photo') {
      loadImages();
    }
  }, [activeCategory]);

  // Recherche dans la bibliothèque (filtrée par catégorie)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Recherche avec le terme:', searchTerm);
    setLoading(true);
    try {
      const results = searchTerm
        ? await searchBibliothequeElements(searchTerm)
        : activeCategory === 'texte'
          ? await getBibliothequeTextes()
          : await getBibliothequeElements();
      console.log('Résultats de la recherche:', results);
      setElements(Array.isArray(results) ? results : []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  // Sélection d'un élément pour prévisualisation
  const handleSelect = (element: BibliothequeElement) => {
    console.log('Élément sélectionné:', element);
    setSelected(element.id);
    setSelectedElement(element);
  };

  // Validation de l'insertion
  const handleInsert = () => {
    if (selectedElement) {
      console.log('Insertion de l\'élément:', selectedElement);
      onSelect(selectedElement);
      setSelected(null); // Réinitialiser la sélection après l'insertion
      setSelectedElement(null);
    }
  };

  // Fonction pour gérer le drag & drop
  const handleDragStart = (e: React.DragEvent, element: BibliothequeElement) => {
    // Ajout d'une classe pour le style pendant le drag
    e.currentTarget.classList.add('dragging');
    
    // Configuration des données de drag
    const dragData = {
      type: 'bibliotheque-element',
      element: element
    };
    
    // Stockage des données dans l'événement de drag
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    
    // Configuration de l'effet de drag
    e.dataTransfer.effectAllowed = 'copy';
    
    // Ajout d'une image de drag personnalisée (optionnel)
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-preview';
    dragImage.textContent = element.titre;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Nettoyage de l'image après le drag
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  // Ajout d'une fonction pour gérer la fin du drag
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
  };

  // Filtrage des éléments selon la catégorie sélectionnée
  const filteredElements = Array.isArray(elements)
    ? activeCategory === 'texte'
      ? elements
      : elements.filter(e => {
          console.log('Élément:', {
            id: e.id,
            categorie: e.categorie,
            sous_categorie: e.sous_categorie,
            contenu: e.contenu,
            titre: e.titre
          });
          return e.categorie === activeCategory;
        })
    : [];

  console.log('Éléments filtrés:', filteredElements);

  // Sélection d'une image pour prévisualisation
  const handleSelectImage = (image: BibliothequeImage) => {
    console.log('Image sélectionnée:', image);
    setSelected(image.id);
    setSelectedElement(image);
  };

  // Fonction pour gérer l'upload d'une nouvelle image BLOB
  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      await uploadBibliothequeImage(file);
      await loadImages(); // Recharger la mosaïque après upload
    } catch (err) {
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setLoading(false);
    }
  };

  // Récupération des sous-catégories distinctes présentes dans les images
  const sousCategories = Array.from(new Set((images || []).map(img => img.sous_categorie).filter(Boolean)));

  // Fonction de filtrage des images selon la sous-catégorie sélectionnée dans le menu latéral
  const filteredImages = activePhotoCategory
    ? (images || []).filter(img => img.sous_categorie === activePhotoCategory)
    : (images || []);

  return (
    <div className="h-full flex flex-col">
      {/* Barre latérale des catégories */}
      <div className="p-4 border-b">
        <div className="space-y-2">
          {/* Menu déroulant pour les textes */}
          <div className="space-y-2">
            <div className="border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                className="w-full justify-between px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setIsTextesExpanded(!isTextesExpanded);
                  if (!isTextesExpanded) {
                    setActiveCategory('texte');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Textes</span>
                </div>
                {isTextesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              {isTextesExpanded && activeCategory === 'texte' && (
                <div className="border-t bg-gray-50">
                  {filteredElements.map((element) => (
                    <Button
                      key={element.id}
                      variant={selected === element.id ? 'default' : 'ghost'}
                      className="w-full justify-start text-sm px-4 py-2 hover:bg-gray-100 cursor-move"
                      onClick={() => handleSelect(element)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, element)}
                      onDragEnd={handleDragEnd}
                    >
                      {element.titre}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Menu déroulant pour les photos */}
          <div className="space-y-2">
            <div className="border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                className="w-full justify-between px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setIsPhotosExpanded(!isPhotosExpanded);
                  if (!isPhotosExpanded) {
                    setActiveCategory('photo');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span className="font-medium">Photos</span>
                </div>
                {isPhotosExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              {isPhotosExpanded && activeCategory === 'photo' && (
                <div className="border-t bg-gray-50">
                  {PHOTO_CATEGORIES.map((category) => (
                    <Button
                      key={category.key}
                      variant={activePhotoCategory === category.key ? 'default' : 'ghost'}
                      className="w-full justify-start text-sm px-4 py-2 hover:bg-gray-100"
                      onClick={() => setActivePhotoCategory(category.key)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Autres catégories */}
          <Button
            variant={activeCategory === 'tableau' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => {
              setActiveCategory('tableau');
              setSelected(null);
              setSelectedElement(null);
              setIsTextesExpanded(false);
            }}
          >
            Tableaux
          </Button>
          <Button
            variant={activeCategory === 'document_technique' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => {
              setActiveCategory('document_technique');
              setSelected(null);
              setSelectedElement(null);
              setIsTextesExpanded(false);
            }}
          >
            Documents techniques
          </Button>
          <Button
            variant={activeCategory === 'signalisation' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => {
              setActiveCategory('signalisation');
              setSelected(null);
              setSelectedElement(null);
              setIsTextesExpanded(false);
            }}
          >
            Signalisation
          </Button>
          <Button
            variant={activeCategory === 'procedure' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => {
              setActiveCategory('procedure');
              setSelected(null);
              setSelectedElement(null);
              setIsTextesExpanded(false);
            }}
          >
            Procédures
          </Button>
          <Button
            variant={activeCategory === 'fiche_technique' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => {
              setActiveCategory('fiche_technique');
              setSelected(null);
              setSelectedElement(null);
              setIsTextesExpanded(false);
            }}
          >
            Fiches techniques
          </Button>
        </div>
        {onClose && (
          <Button variant="ghost" className="mt-8 w-full" onClick={onClose}>Fermer</Button>
        )}
      </div>

      {/* Zone de recherche */}
      <div className="p-4 border-b">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Rechercher par mot-clé, titre, catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Affichage des erreurs ou du chargement */}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading && <div>Chargement...</div>}

      {/* Affichage des photos en mosaïque (BLOB) */}
      {activeCategory === 'photo' && (
        <div className="flex-1 overflow-auto p-4">
          {/* Affichage de la mosaïque filtrée par sous-catégorie (selon le menu latéral) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border ${
                    selected === image.id ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                onClick={() => handleSelect(image.id)}
                >
                    <img
                      src={`data:${image.mime_type};base64,${image.image_base64}`}
                      alt={image.filename}
                  className="object-cover w-full h-32"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 truncate">
                  {image.filename}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Liste des éléments pour les autres catégories */}
      {activeCategory !== 'texte' && activeCategory !== 'photo' && (
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {filteredElements.map((element) => (
              <div
                key={element.id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selected === element.id ? 'border-blue-500' : 'border-gray-200'
                }`}
                onClick={() => handleSelect(element)}
                draggable
                onDragStart={(e) => handleDragStart(e, element)}
              >
                <h3 className="font-medium">{element.titre}</h3>
                <p className="text-sm text-gray-500">{element.categorie}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prévisualisation de l'élément sélectionné */}
      {selectedElement && (
        <div className="border-t p-4 bg-white">
          <div className="mb-4">
            <h3 className="font-medium text-lg mb-2">{selectedElement.titre}</h3>
            {activeCategory === 'photo' && selectedElement.image_base64 ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={`data:${selectedElement.mime_type};base64,${selectedElement.image_base64}`}
                  alt={selectedElement.titre}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="prose max-w-none">
                {selectedElement.contenu}
              </div>
            )}
          </div>
          <Button
            className="w-full"
            onClick={handleInsert}
          >
            Insérer dans l'éditeur
          </Button>
        </div>
      )}
    </div>
  );
};

export default BibliothequeMemoireTechnique; 