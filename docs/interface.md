# Interface d'Édition de Documents - Spécifications
#
# Ce document décrit les spécifications fonctionnelles et techniques de l'interface d'édition, la gestion des bibliothèques, l'intégration de l'analyse IA du RC, et le workflow utilisateur. Il est mis à jour à chaque évolution majeure du projet.

## Objectif Principal
Créer une interface d'édition de documents permettant de gagner du temps en réutilisant des éléments préexistants et en automatisant l'analyse des documents de référence.

## Dernières évolutions (01/05/2024)
- **Ajout d'une fonctionnalité IA d'analyse automatique du RC** :
  - Upload du RC en PDF, analyse automatique, génération de sommaire, suggestions d'éléments pertinents
  - Intégration backend et frontend (bouton d'analyse, insertion du sommaire)
- **Gestion des bibliothèques spécifiques** :
  - Organisation par type de document, catégories enrichies, accès rapide
- **Corrections techniques** :
  - Correction du typage ProseMirror et initialisation du contenu
  - Nettoyage de la base SQLite (suppression des tables orphelines)
  - Amélioration de la gestion des erreurs réseau et migrations
- **Prochaines étapes** :
  - Amélioration de la robustesse de l'analyse IA
  - Tests utilisateurs sur la génération automatique du sommaire
  - Documentation utilisateur et guides API
  - Optimisation des performances

## Structure de l'Interface

### 1. Éditeur Principal
- Zone d'édition principale avec formatage riche
- Barre d'outils de formatage standard
- Système de sections et sous-sections
- Numérotation automatique des chapitres

### 2. Bibliothèques Spécifiques par Type de Document
Chaque type de document (Mémoire Technique, SOGED, SOPAQ, etc.) dispose de sa propre bibliothèque d'éléments, adaptée à ses besoins spécifiques.

#### Types de Documents et leurs Bibliothèques
1. **Mémoire Technique**
   - Bibliothèque spécifique aux aspects techniques
   - Éléments de présentation de l'entreprise
   - Méthodologies de travail
   - Références techniques

2. **SOGED (Schéma d'Organisation de Gestion et d'Élimination des Déchets)**
   - Bibliothèque dédiée à la gestion des déchets
   - Procédures de tri
   - Tableaux de suivi
   - Documents réglementaires spécifiques

3. **SOPAQ (Schéma d'Organisation du Plan d'Assurance Qualité)**
   - Bibliothèque qualité
   - Procédures qualité
   - Tableaux de contrôle
   - Documents de suivi qualité

4. **SOPRE (Schéma d'Organisation du Plan de Respect de l'Environnement)**
   - Bibliothèque environnementale
   - Procédures environnementales
   - Documents de suivi
   - Réglementations spécifiques

5. **PPSPS (Plan Particulier de Sécurité et de Protection de la Santé)**
   - Bibliothèque sécurité
   - Procédures de sécurité
   - Documents de prévention
   - Tableaux de suivi sécurité

6. **PAQ (Plan d'Assurance Qualité)**
   - Bibliothèque qualité
   - Procédures qualité
   - Documents de contrôle
   - Tableaux de suivi

#### Structure Commune des Bibliothèques
Chaque bibliothèque contient les catégories suivantes :

1. **Textes**
   - Paragraphes types
   - Formulations standard
   - Textes réglementaires
   - Clauses types

2. **Tableaux**
   - Tableaux de données
   - Grilles de calcul
   - Tableaux comparatifs
   - Matrices d'analyse

3. **Photos**
   - Images techniques
   - Schémas
   - Plans
   - Photographies de référence

4. **Documents Techniques**
   - Spécifications
   - Normes
   - Cahiers des charges
   - Documents de référence

5. **Signalisation**
   - Panneaux
   - Pictogrammes
   - Schémas de signalisation
   - Plans d'implantation

6. **Procédures**
   - Processus types
   - Méthodes de travail
   - Protocoles
   - Checklists

7. **Fiches Techniques**
   - Fiches produits
   - Fiches sécurité
   - Fiches d'intervention
   - Fiches de contrôle

### 3. Système d'Analyse du RC
- Upload du RC en PDF
- Analyse automatique par IA pour identifier :
  - Chapitres requis
  - Sous-chapitres obligatoires
  - Points spécifiques à traiter
  - Contraintes particulières
- Génération d'une structure de document basée sur l'analyse
- Suggestions d'éléments pertinents de la bibliothèque spécifique au type de document

### 4. Fonctionnalités de la Bibliothèque
- Recherche par mot-clé
- Filtrage par catégorie
- Prévisualisation des éléments
- Favoris et éléments récents
- Tags personnalisés
- Système de notation et commentaires
- Filtrage par type de document

### 5. Gestion des Éléments
- Ajout d'éléments à la bibliothèque spécifique
- Catégorisation automatique
- Métadonnées (auteur, date, version, type de document)
- Système de versions
- Partage d'éléments entre utilisateurs
- Gestion des droits d'accès par type de document

## Base de Données
Structure dans `memos.db` :
- Table des éléments
- Table des catégories
- Table des métadonnées
- Table des relations
- Table des versions
- Table des analyses de RC
- Table des types de documents
- Table des bibliothèques par type de document

## Workflow Proposé
1. Upload et analyse du RC
2. Génération de la structure du document
3. Sélection du type de document
4. Accès à la bibliothèque spécifique
5. Sélection des éléments pertinents
6. Édition et personnalisation
7. Validation et export

## Priorités de Développement
1. Interface frontend de base (implémentée)
2. Système de bibliothèques spécifiques (en cours d'amélioration)
3. Intégration de l'éditeur (implémentée)
4. Système d'analyse du RC (implémenté, à enrichir)
5. Fonctionnalités avancées (à venir)

## Points d'Attention
- Performance de l'interface
- Facilité d'utilisation
- Organisation claire des éléments
- Rapidité d'accès aux ressources
- Qualité de l'analyse du RC
- Gestion efficace des bibliothèques spécifiques
- Cohérence entre les différents types de documents 