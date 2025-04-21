# DEVBOOK - Application de Rédaction de Mémoires Techniques

## Table des matières
1. [Questions et clarifications](#questions-et-clarifications)
2. [Architecture et choix techniques](#architecture-et-choix-techniques)
3. [Plan de développement](#plan-de-développement)
4. [Tests et qualité](#tests-et-qualité)
5. [Déploiement](#déploiement)
6. [État actuel du développement](#état-actuel-du-développement)
7. [Structure des Projets et Documents](#structure-des-projets-et-documents)

## Questions et clarifications

Points clarifiés :

1. **Base de données** : 
   - Utilisation de SQLite comme base de données par défaut
   - Base de données stockée dans le dossier `data/memos.db`
   - Choix adapté pour :
     - Simplicité de configuration
     - Portabilité du projet
     - Facilité de sauvegarde (un seul fichier)

2. **Authentification** :
   - Système avec JWT (JSON Web Tokens)
   - Deux types d'utilisateurs : ADMIN et USER
   - Vérification du mot de passe administrateur pour les opérations sensibles
   - Gestion des permissions basée sur les rôles

3. **Stockage des fichiers** :
   - Configuration initiale standard :
     - Limite de taille par défaut : 10MB par fichier
     - Durée de conservation : illimitée
     - Types de fichiers acceptés : PDF pour RC et CCTP
     - Stockage organisé par projet : `/media/projects/<project_id>/`

## Structure des Projets et Documents

### Documents par Projet

1. **Documents de Référence (PDF)** :
   - RC (Règlement de Consultation)
   - CCTP (Cahier des Clauses Techniques Particulières)
   - Stockés dans `/reference_documents/` par projet

2. **Documents Techniques à Produire** :
   - Mémoire technique
   - SOGED (Schéma d'Organisation de Gestion et d'Élimination des Déchets)
   - SOPAQ (Schéma d'Organisation du Plan d'Assurance Qualité)
   - SOPRE (Schéma d'Organisation du Plan de Respect de l'Environnement)
   - PPSPS (Plan Particulier de Sécurité et de Protection de la Santé)
   - PAQ (Plan d'Assurance Qualité)
   - Gestion via le modèle `ProjectDocument`

### Workflow des Documents

1. **États des Documents** :
   - NOT_STARTED (Non commencé)
   - IN_PROGRESS (En cours de rédaction)
   - UNDER_REVIEW (En relecture)
   - IN_CORRECTION (En correction)
   - APPROVED (Validé)

2. **Système de Validation** :
   - Workflow implémenté dans `ProjectDocument`
   - Historique des modifications via `updated_at`
   - Système de relecteurs multiples
   - Gestion des versions et statuts

## Architecture et choix techniques

### Frontend
- React + TypeScript + Vite
- Shadcn/UI + TailwindCSS pour l'interface
- React Query pour la gestion des requêtes API
- Gestion des formulaires avec validation
- Composants réutilisables dans `components/ui`

### Backend
- Django + Django REST Framework
- Base de données : SQLite
- Système de permissions basé sur les rôles
- API RESTful avec endpoints documentés
- Gestion des fichiers avec Django File Storage

## État actuel du développement

### Mise à jour du 21/04/2024

#### Nouvelles fonctionnalités implémentées
1. **Authentification** :
   - Système JWT avec gestion des rôles ADMIN/USER
   - Vérification du mot de passe administrateur pour les opérations sensibles
   - Protection des routes sensibles

2. **Gestion des Projets** :
   - CRUD complet des projets avec validation
   - Système de suppression sécurisée avec confirmation admin
   - Filtrage et recherche des projets
   - Interface responsive avec mode liste/grille

3. **Documents** :
   - Système de documents requis fonctionnel
   - Upload des documents de référence (RC/CCTP)
   - Organisation des fichiers par projet

#### Modifications techniques
1. **Frontend** :
   - Migration vers Vite pour le développement
   - Implémentation de React Query pour la gestion des requêtes
   - Nouveau système de composants UI avec Shadcn

2. **Backend** :
   - Nouveau modèle ProjectDocument pour la gestion des documents
   - API endpoints pour la gestion des documents requis
   - Système de permissions basé sur les rôles

#### Problèmes identifiés
1. **Performance** :
   - Erreur 431 (Headers too large) sur certaines requêtes HMR
   - Optimisation nécessaire des requêtes API
   - Gestion de la mémoire à améliorer

2. **Documentation** :
   - Documentation API à compléter
   - Besoin de documentation utilisateur

### Backend
1. **Modèles à implémenter** : ✅
   - Project (mise à jour avec documents requis et références)
   - DocumentType (configuration des types de documents)
   - Document (instance d'un document technique)
   - DocumentVersion (gestion des versions)
   - DocumentValidation (workflow de validation)

2. **API REST** : ✅
   - Endpoints CRUD pour les projets et documents
   - Gestion des workflows de validation
   - Upload et téléchargement des PDF
   - Calcul des états d'avancement

3. **Authentification** : ✅
   - Système JWT implémenté
   - Gestion des rôles pour la validation

### Frontend
1. **Pages principales** : ✅
   - Liste des projets avec filtres et recherche
   - Création de projet avec sélection des documents
   - Vue détaillée du projet
   - Interface de gestion des documents

2. **Composants** : ✅
   - ProjectCard (affichage détaillé des projets)
   - ProjectList (liste avec filtres)
   - DeleteProjectDialog (suppression sécurisée)
   - ProjectFilters (filtrage et tri)

3. **Fonctionnalités** : ⏳
   - Création de projet avec documents requis ✅
   - Upload des documents de référence ✅
   - Gestion des statuts et progression ✅
   - Interface responsive et moderne ✅
   - Éditeur de documents techniques ⏳
   - Système de validation et workflow ⏳

### Prochaines étapes prioritaires
1. **Correction des bugs** :
   - Résolution de l'erreur 431 HMR
   - Optimisation des requêtes API
   - Amélioration de la gestion mémoire

2. **Nouvelles fonctionnalités** :
   - Éditeur de documents techniques
   - Interface de validation
   - Tableau de bord statistiques
   - Système de notifications

3. **Tests et Documentation** :
   - Tests unitaires frontend
   - Tests d'intégration API
   - Documentation utilisateur
   - Documentation API

## Problèmes connus
1. Erreur 431 sur certaines requêtes HMR (Headers too large)
2. Optimisation nécessaire des requêtes API
3. Gestion de la mémoire à améliorer
4. Documentation API à compléter 