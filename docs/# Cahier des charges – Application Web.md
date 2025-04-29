# Cahier des charges – Application Web pour la rédaction de mémoires techniques

## 1. Contexte et objectifs

Cette application a pour objectif de faciliter, automatiser et professionnaliser la rédaction des mémoires techniques destinés aux appels d'offres dans le secteur des travaux publics.

Elle doit permettre :
- de structurer un mémoire technique de manière modulaire,
- d'insérer des contenus réutilisables (textes, tableaux, images),
- de générer du contenu avec une IA (OpenAI GPT-4),
- de sélectionner un modèle de mise en page,
- de générer un fichier PDF final formaté.

L’interface utilisateur s’inspirera du site [www.tpcourant.fr](https://www.tpcourant.fr), avec un design sobre, professionnel et intuitif.

## 2. Architecture technique

### 2.1 Frontend
- **Framework :** React + TypeScript
- **Librairie UI :** Shadcn/UI, TailwindCSS
- **Fonctionnalités :**
  - Interface modulaire avec drag & drop
  - Aperçu du mémoire en temps réel
  - Éditeur WYSIWYG
  - Interaction avec l’API IA
  - Formulaires de saisie

### 2.2 Backend
- **Framework :** Django
- **Base de données :** SQLite
- **API :** Django REST Framework
- **Fonctionnalités :**
  - Authentification des utilisateurs
  - Gestion des projets, contenus, templates
  - Génération de fichiers PDF à partir de templates HTML (via WeasyPrint ou Puppeteer)
  - Appels à l’API ChatGPT pour la génération assistée

## 3. Fonctionnalités attendues

### 3.1. Gestion des utilisateurs
- Authentification par email et mot de passe
- Gestion des sessions
- Rôles : Admin, Rédacteur

### 3.2. Gestion des projets (mémoires)
- Création / édition / duplication de projets
- Sauvegarde automatique en base
- Aperçu structuré (sections, sous-sections)

### 3.3. Base de données de contenu
- Paragraphes classés par thèmes (sécurité, environnement, méthodologie…)
- Tableaux standards et images
- Interface CRUD complète
- Réutilisation rapide dans un projet

### 3.4. Rédaction assistée par IA
- Génération de paragraphes sur prompt personnalisé
- Sélection du ton, niveau de détail
- Intégration directe dans le projet

### 3.5. Interface de mise en forme
- Édition riche (WYSIWYG)
- Drag & drop de sections, images, tableaux
- Visualisation en arborescence
- Gestion des styles à travers des templates

### 3.6. Templates de mise en page
- Choix de plusieurs templates visuels
- Structure : couverture, sommaire, entêtes/pieds de page, style de texte
- Prévisualisation rapide dans le navigateur

### 3.7. Export PDF
- Génération d’un PDF complet à partir du projet
- Fidèle au template sélectionné
- Téléchargement depuis l’application
- Archivage des versions générées

## 4. Design

- Interface inspirée de [www.tpcourant.fr](https://www.tpcourant.fr)
- UI responsive, desktop-first
- Palette de couleurs sobre et professionnelle
- Typographie lisible
- Navigation fluide et sans surcharge

## 5. Sécurité et performance

- Données stockées en SQLite (stockage local ou hébergé)
- Authentification sécurisée
- Protection contre injections et
