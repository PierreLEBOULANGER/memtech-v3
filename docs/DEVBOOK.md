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

### Mise à jour du 28/04/2024

#### Nouvelles fonctionnalités implémentées
1. **Gestion des Statuts de Projet** :
   - Mise à jour automatique du statut des projets en fonction des documents
   - Statut "Terminé" automatique pour les projets sans documents requis
   - Logique de progression basée sur l'état des documents
   - Historique des changements de statut

2. **Améliorations de la Suppression** :
   - Correction du système de suppression des projets
   - Rafraîchissement automatique de la liste après suppression
   - Gestion des erreurs 404 pour les projets déjà supprimés
   - Amélioration des notifications utilisateur

3. **Système de Rôles** :
   - Assignation des rôles (rédacteur/relecteur) pour les documents
   - Interface de sélection des utilisateurs par rôle
   - Validation des permissions lors de l'assignation
   - Mise à jour en temps réel des assignations

#### Modifications techniques
1. **Backend** :
   - Ajout de la méthode `update_status` dans le modèle Project
   - Amélioration de la gestion des statuts de documents
   - Optimisation des requêtes de suppression
   - Meilleure gestion des erreurs API

2. **Frontend** :
   - Amélioration de la gestion du cache avec React Query
   - Mise à jour automatique des listes après modifications
   - Amélioration des composants de gestion des rôles
   - Meilleure gestion des états de chargement

#### Problèmes résolus
1. **Gestion des Statuts** :
   - Correction du statut initial des projets sans documents
   - Mise à jour automatique des statuts lors des changements
   - Meilleure cohérence entre l'état des documents et le statut du projet

2. **Suppression de Projets** :
   - Résolution des erreurs 404 lors de la suppression
   - Amélioration de la gestion du cache après suppression
   - Meilleure expérience utilisateur avec les notifications

### Prochaines étapes prioritaires
1. **Améliorations de l'Interface** :
   - Ajout d'un tableau de bord pour les statistiques
   - Amélioration de la visualisation des statuts
   - Interface de gestion des versions de documents

2. **Fonctionnalités à développer** :
   - Système de notifications en temps réel
   - Éditeur de documents techniques
   - Système de commentaires et annotations
   - Export des documents en différents formats

3. **Tests et Documentation** :
   - Tests unitaires pour la gestion des statuts
   - Tests d'intégration pour le workflow complet
   - Documentation utilisateur mise à jour
   - Documentation API complétée

## Problèmes connus
1. Erreur 431 sur certaines requêtes HMR (Headers too large)
2. Optimisation nécessaire des requêtes API
3. Gestion de la mémoire à améliorer
4. Documentation API à compléter 