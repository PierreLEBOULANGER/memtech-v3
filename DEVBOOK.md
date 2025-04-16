# DEVBOOK - Application de Rédaction de Mémoires Techniques

## Table des matières
1. [Questions et clarifications](#questions-et-clarifications)
2. [Migration des données](#migration-des-données)
3. [Architecture et choix techniques](#architecture-et-choix-techniques)
4. [Plan de développement](#plan-de-développement)
5. [Tests et qualité](#tests-et-qualité)
6. [Déploiement](#déploiement)
7. [État actuel du développement](#état-actuel-du-développement)

## Questions et clarifications

Points clarifiés :

1. **Base de données** : 
   - Migration de SQLite vers PostgreSQL
   - Nécessité de migrer les données existantes de memos.db
   - Raisons du changement :
     - Meilleure gestion de la concurrence
     - Facilité de sauvegarde
     - Scalabilité future

2. **Authentification** :
   - Système simple avec email/mot de passe
   - Un seul type d'utilisateur (pas de différenciation Admin/Rédacteur)
   - Pas de 2FA nécessaire

3. **Stockage des fichiers** :
   - Configuration initiale standard :
     - Limite de taille par défaut : 10MB par fichier
     - Durée de conservation : illimitée
     - Ces paramètres pourront être ajustés selon les besoins

## Migration des données

### Plan de migration SQLite vers PostgreSQL

1. **Analyse préliminaire**
   - Extraction du schéma de memos.db
   - Identification des données à migrer
   - Validation de l'intégrité des données

2. **Processus de migration**
   - Création d'un script de migration Python
   - Tests de la migration sur un environnement de staging
   - Validation des données migrées
   - Plan de rollback en cas de problème

3. **Étapes de la migration**
   - Sauvegarde complète de memos.db
   - Conversion du schéma SQLite vers PostgreSQL
   - Migration des données
   - Vérification de l'intégrité
   - Tests fonctionnels post-migration

## Architecture et choix techniques

### Frontend
- React + TypeScript
- Shadcn/UI + TailwindCSS
- État global : Redux Toolkit
- Tests : Jest + React Testing Library
- Outils supplémentaires :
  - React-DnD pour le drag & drop
  - TinyMCE pour l'éditeur WYSIWYG
  - React-Query pour la gestion des requêtes API

### Backend
- Django + Django REST Framework
- Base de données : PostgreSQL (à confirmer)
- Tests : PyTest
- Outils supplémentaires :
  - WeasyPrint pour la génération PDF
  - Celery pour les tâches asynchrones
  - Django Storages pour la gestion des fichiers

## Plan de développement

### Phase 1 : Configuration et infrastructure
1. Configuration du projet GitHub
2. Mise en place de l'environnement de développement
3. Configuration CI/CD
4. Création des premiers tests d'infrastructure

### Phase 2 : Backend - Fonctionnalités de base
1. Modèles de données
2. API REST
3. Authentification
4. Tests unitaires et d'intégration

### Phase 3 : Frontend - Structure de base
1. Configuration React + TypeScript
2. Mise en place du design system
3. Routing et layout de base
4. Tests des composants principaux

### Phase 4 : Gestion des mémoires
1. CRUD des projets
2. Système de templates
3. Éditeur WYSIWYG
4. Tests fonctionnels

### Phase 5 : Fonctionnalités avancées
1. Intégration IA (OpenAI)
2. Système de drag & drop
3. Génération PDF
4. Tests end-to-end

### Phase 6 : Finalisation
1. Optimisation des performances
2. Documentation
3. Tests de charge
4. Déploiement en production

## Tests et qualité

### Stratégie de test
- TDD systématique
- Tests unitaires pour chaque composant
- Tests d'intégration pour les flux principaux
- Tests end-to-end pour les parcours utilisateur critiques

### Qualité du code
- ESLint + Prettier pour le frontend
- Black + Flake8 pour le backend
- Revue de code systématique
- Couverture de tests minimale : 80%

## Déploiement

### Environnements
- Développement : Local
- Test : Serveur de staging
- Production : À définir

### CI/CD
- GitHub Actions pour :
  - Tests automatisés
  - Analyse de qualité du code
  - Déploiement automatique
  - Génération de la documentation

### Monitoring
- Logs centralisés
- Métriques de performance
- Alerting sur incidents 

## État actuel du développement

### Backend
1. **Modèles implémentés** :
   - Project (avec champs name, offer_delivery_date, maitre_ouvrage, maitre_oeuvre, status)
   - TechnicalReport (avec relations vers Project et User)
   - MOA et MOE pour la gestion des maîtrises d'ouvrage et d'œuvre

2. **API REST** :
   - Endpoints CRUD pour les projets
   - Endpoints pour les rapports techniques
   - Gestion des MOA/MOE
   - Système de permissions configuré

3. **Authentification** :
   - Système JWT implémenté
   - Gestion des utilisateurs configurée

### Frontend
1. **Pages principales** :
   - Login/Register
   - Liste des projets
   - Création de projet
   - Gestion des rapports techniques

2. **Composants** :
   - Navigation
   - Formulaires de création/édition
   - Liste des projets
   - Interface MOA/MOE

3. **Fonctionnalités** :
   - Authentification utilisateur
   - Gestion des projets
   - Interface de création de rapports
   - Sélection MOA/MOE

### Prochaines étapes
1. **Backend** :
   - Optimisation des requêtes
   - Implémentation des webhooks
   - Système de notifications

2. **Frontend** :
   - Amélioration de l'UX
   - Système de templates
   - Éditeur WYSIWYG
   - Drag & Drop pour les sections

3. **Tests** :
   - Tests unitaires backend
   - Tests d'intégration frontend
   - Tests end-to-end 