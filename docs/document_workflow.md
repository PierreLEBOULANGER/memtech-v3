# Workflow de Documents - Plan de Développement
#
# Ce document décrit le workflow de gestion documentaire, les étapes de validation, les rôles, et le plan de développement associé. Il est mis à jour à chaque évolution majeure du projet.

## Vue d'ensemble
Ce document détaille l'implémentation du workflow de gestion des documents dans l'application Memtech. Le système permet de suivre la progression des documents à travers différentes étapes, avec des rôles spécifiques pour la rédaction et la relecture.

## Dernières évolutions (01/05/2024)
- **Ajout d'une fonctionnalité IA d'analyse automatique du RC** :
  - Service backend d'analyse PDF (extraction de texte, détection de sections, sommaire automatique)
  - API dédiée et intégration frontend (bouton d'analyse, insertion du sommaire)
  - Nettoyage de la base de données et correction des migrations
- **Corrections techniques** :
  - Correction du typage ProseMirror et initialisation du contenu
  - Nettoyage de la base SQLite (suppression des tables orphelines)
  - Amélioration de la gestion des erreurs réseau et migrations
- **Prochaines étapes** :
  - Amélioration de la robustesse de l'analyse IA
  - Tests utilisateurs sur la génération automatique du sommaire
  - Documentation API et guides utilisateurs
  - Optimisation des performances

## Workflow et Pondération
1. **Rédaction** (45%)
   - Assignation du rédacteur
   - Notification au redacteur
   - Rédaction du document
   - Marquage comme prêt pour relecture

2. **Relecture** (30%)
   - Notification au relecteur que le document est pret a etre relu
   - Revue par le relecteur assigné
   - Ajout de commentaires éventuels 
   - Demande de corrections si nécessaire (étape 3 et 4) sinon étape 5

3. **Correction** (20%)
   - Notification au redacteur si des demandes de correction sont formulées
   - Prise en compte des commentaires
   - Modifications par le rédacteur
   - Marquage comme prêt pour relecture

4. **2eme Relecture** (0%)
   - Notification au relecteur que le document est pret a etre relu
   - Revue par le relecteur assigné
   

4. **Validation Finale** (5%)
   - Vérification finale
   - Approbation définitive
   - Archivage du document

## Plan de Développement

### 1. Backend

#### 1.0 Système de Permissions (backend/projects/permissions.py)
- [ ] Création des permissions spécifiques
  ```python
  class DocumentPermissions:
      ASSIGN_ROLES = 'document.assign_roles'
      EDIT_DOCUMENT = 'document.edit'
      REVIEW_DOCUMENT = 'document.review'
      VALIDATE_DOCUMENT = 'document.validate'
      VIEW_HISTORY = 'document.view_history'
  ```

- [ ] Définition des rôles et capacités
  ```python
  ROLE_PERMISSIONS = {
      'ADMIN': [ALL_PERMISSIONS],
      'PROJECT_MANAGER': [
          DocumentPermissions.ASSIGN_ROLES,
          DocumentPermissions.VALIDATE_DOCUMENT,
          DocumentPermissions.VIEW_HISTORY
      ],
      'WRITER': [
          DocumentPermissions.EDIT_DOCUMENT,
          DocumentPermissions.VIEW_HISTORY
      ],
      'REVIEWER': [
          DocumentPermissions.REVIEW_DOCUMENT,
          DocumentPermissions.VIEW_HISTORY
      ]
  }
  ```

- [ ] Middleware de vérification des permissions
  ```python
  class DocumentPermissionMiddleware:
      def has_permission(user, document, action)
      def can_assign_roles(user, document)
      def can_edit_document(user, document)
      def can_review_document(user, document)
  ```

#### 1.1 Modèles de données (backend/projects/models.py)
- [ ] Mise à jour du modèle ProjectDocument
  ```python
  DOCUMENT_STATUS = [
      ('DRAFT', 'En rédaction'),
      ('REVIEW_1', 'Première relecture'),
      ('CORRECTION', 'En correction'),
      ('REVIEW_2', 'Deuxième relecture'),
      ('VALIDATION', 'En validation finale'),
      ('APPROVED', 'Validé')
  ]
  ```
- [ ] Nouveaux champs :
  - writer (ForeignKey)
  - reviewer (ForeignKey)
  - comments (JSONField)
  - status_history (JSONField)
  - completion_percentage (FloatField)
  - review_cycle (IntegerField, default=1)
  - needs_correction (BooleanField, default=False)
  - last_notification_sent (DateTimeField)

#### 1.2 Modèle de Commentaires (backend/projects/models.py)
- [ ] Création du modèle DocumentComment
  ```python
  class DocumentComment:
      - document (ForeignKey)
      - author (ForeignKey)
      - content (TextField)
      - created_at (DateTimeField)
      - review_cycle (IntegerField)
      - requires_correction (BooleanField)
      - resolved (BooleanField)
  ```

#### 1.3 API Endpoints (backend/projects/views.py)
- [ ] POST /api/projects/{id}/documents/{doc_id}/assign/
- [ ] GET/POST /api/projects/{id}/documents/{doc_id}/comments/
- [ ] PUT /api/projects/{id}/documents/{doc_id}/status/
- [ ] GET /api/projects/{id}/documents/{doc_id}/history/
- [ ] POST /api/projects/{id}/documents/{doc_id}/request-review/
- [ ] POST /api/projects/{id}/documents/{doc_id}/submit-corrections/

### 2. Frontend

#### 2.0 Gestion des Permissions (frontend/src/utils/permissions.ts)
- [ ] Hooks de vérification des permissions
  ```typescript
  interface UseDocumentPermissions {
    canAssignRoles: boolean;
    canEdit: boolean;
    canReview: boolean;
    canValidate: boolean;
  }
  ```

- [ ] Composants de contrôle d'accès
  ```typescript
  interface PermissionGateProps {
    requires: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }
  ```

#### 2.1 Composants React

- [ ] RoleAssignment (frontend/src/components/documents/RoleAssignment.tsx)
  ```typescript
  interface RoleAssignmentProps {
    projectId: number;
    documentId: number;
    currentWriter?: User;
    currentReviewer?: User;
    onAssignmentComplete: () => void;
  }
  ```
  - Composant principal pour l'assignation des rôles
  - Gestion des conflits (même personne ne peut pas être rédacteur et relecteur)
  - Historique des assignations précédentes
  - Suggestions intelligentes basées sur l'expertise

- [ ] UserSelectionDialog (frontend/src/components/documents/UserSelectionDialog.tsx)
  ```typescript
  interface UserSelectionDialogProps {
    role: 'writer' | 'reviewer';
    excludeUsers?: User[];
    onUserSelect: (user: User) => void;
  }
  ```
  - Modal de sélection d'utilisateur avec recherche
  - Filtrage par rôle et disponibilité
  - Affichage des compétences et de l'expérience
  - Indicateur de charge de travail

- [ ] AssignmentConfirmation (frontend/src/components/documents/AssignmentConfirmation.tsx)
  ```typescript
  interface AssignmentConfirmationProps {
    writer: User;
    reviewer: User;
    document: Document;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```
  - Résumé des assignations
  - Aperçu des délais estimés
  - Options de notification

- [ ] AssignmentHistory (frontend/src/components/documents/AssignmentHistory.tsx)
  ```typescript
  interface AssignmentHistoryProps {
    documentId: number;
    limit?: number;
  }
  ```
  - Historique des changements d'assignation
  - Raisons des changements
  - Durée des assignations

#### 2.2 Mise à jour des composants existants

- [ ] ProjectDocuments.tsx
  - Ajout du bouton "Assigner les rôles"
  - Intégration de RoleAssignment
  - Affichage des assignations actuelles
  - Menu contextuel pour la gestion des rôles

- [ ] DocumentCard.tsx
  ```typescript
  interface DocumentCardProps {
    document: Document;
    onAssignmentClick: () => void;
    showAssignmentHistory: boolean;
  }
  ```
  - Affichage des rôles assignés
  - Statut d'avancement par rôle
  - Actions rapides d'assignation

#### 2.3 Styles et UX (frontend/src/styles/components/assignment.css)

- [ ] Styles pour l'interface d'assignation
  ```css
  .assignment-card {
    /* Styles spécifiques pour la carte d'assignation */
  }
  .role-selector {
    /* Styles pour le sélecteur de rôle */
  }
  .user-list {
    /* Styles pour la liste des utilisateurs */
  }
  ```

- [ ] Animations et transitions
  - Animation d'ouverture/fermeture des modals
  - Transitions sur les changements de rôle
  - Effets de hover et focus

#### 2.4 Intégration avec le système de notifications

- [ ] Notifications d'assignation
  ```typescript
  interface AssignmentNotification {
    type: 'ROLE_ASSIGNED' | 'ROLE_CHANGED' | 'ASSIGNMENT_REMINDER';
    role: 'writer' | 'reviewer';
    document: Document;
    assignedUser: User;
    assignedBy: User;
    timestamp: Date;
  }
  ```

- [ ] Emails automatiques
  - Template d'email pour nouvelle assignation
  - Rappels de délais
  - Résumé des responsabilités

### 3. Services et Types

#### 3.1 Services (frontend/src/services/documentService.ts)
- [ ] assignDocument(projectId, documentId, writerId, reviewerId)
- [ ] addComment(projectId, documentId, comment, requiresCorrection)
- [ ] updateStatus(projectId, documentId, status, reviewCycle)
- [ ] getComments(projectId, documentId, reviewCycle)
- [ ] getHistory(projectId, documentId)
- [ ] requestReview(projectId, documentId)
- [ ] submitCorrections(projectId, documentId)
- [ ] subscribeToNotifications(projectId, documentId)

#### 3.2 Types (frontend/src/types/document.ts)
```typescript
interface DocumentWorkflowStatus {
  status: 'DRAFT' | 'REVIEW_1' | 'CORRECTION' | 'REVIEW_2' | 'VALIDATION' | 'APPROVED';
  reviewCycle: number;
  needsCorrection: boolean;
  lastUpdated: Date;
}

interface DocumentComment {
  id: number;
  author: User;
  content: string;
  reviewCycle: number;
  requiresCorrection: boolean;
  resolved: boolean;
  createdAt: Date;
}

interface DocumentNotification {
  id: number;
  type: 'ASSIGNMENT' | 'REVIEW_READY' | 'CORRECTION_NEEDED' | 'VALIDATION_READY';
  documentId: number;
  message: string;
  createdAt: Date;
  read: boolean;
}
```

### 4. Calcul de Progression

#### 4.1 Backend (backend/projects/services.py)
- [ ] Implémentation du calcul de progression
  ```python
  def calculate_progress(document):
      base_progress = {
          'DRAFT': 0.45,
          'REVIEW_1': 0.30,
          'CORRECTION': 0.20,
          'REVIEW_2': 0,  # Inclus dans la correction
          'VALIDATION': 0.05
      }
  ```
- [ ] Gestion des cycles de relecture
- [ ] Tests unitaires
- [ ] Intégration avec le modèle

#### 4.2 Frontend
- [ ] Affichage de la progression
- [ ] Mise à jour en temps réel
- [ ] Indicateurs visuels

### 5. Système de Notifications

#### 5.1 Backend
- [ ] Service de notifications
- [ ] Intégration avec le workflow
- [ ] Configuration des triggers

#### 5.2 Frontend
- [ ] Composant de notifications
- [ ] Intégration dans l'interface
- [ ] Gestion des états

## Tests et Validation

### 1. Tests Unitaires
- [ ] Models
- [ ] Services
- [ ] API Endpoints

### 2. Tests d'Intégration
- [ ] Workflow complet
- [ ] Calcul de progression
- [ ] Système de notifications

### 3. Tests Utilisateur
- [ ] Scénarios de test
- [ ] Validation des rôles
- [ ] Performance

## Notes de Déploiement
- Backup de la base de données avant migration
- Déploiement séquentiel (Backend puis Frontend)
- Communication aux utilisateurs des nouvelles fonctionnalités

## Suivi des Modifications
| Date | Description | Status |
|------|-------------|--------|
| 01/05/2024 | Ajout de la fonctionnalité IA d'analyse du RC, corrections techniques, nettoyage base, intégration frontend | En cours |

## Développements Ultérieurs Possibles

### 1. Gestion de la Charge de Travail
- Dashboard de charge de travail par utilisateur
- Alertes de surcharge
- Calendrier des échéances
- Métriques de performance

### 2. Système de Remplacement
- Procédure d'indisponibilité
- Transfert de responsabilités
- Historique des remplacements

### 3. Reporting et Analytics
- Temps moyen par étape
- Taux de correction
- Performance des utilisateurs
- Analyse des blocages

### 4. Intégration Planning
- Synchronisation calendriers
- Estimation automatique
- Gestion des conflits

### 5. Système de Rappels et Escalade
- Rappels automatiques
- Processus d'escalade
- Notifications graduelles

### 6. Gestion des Versions
- Historique des modifications
- Comparaison de versions
- Restauration

### 7. Métriques de Qualité
- Scoring des documents
- Analyse des cycles
- Satisfaction

### 8. Collaboration et Communication
- Chat intégré
- Annotations collaboratives
- Réunions automatiques

### 9. Automatisation et Intelligence
- Suggestions automatiques
- Détection des blocages
- Prédiction des délais

### 10. Documentation et Formation
- Guides par rôle
- Processus d'onboarding
- Templates

### 11. Archivage et Conformité
- Politique de rétention
- Traçabilité
- Conformité RGPD

## Notes de Mise à Jour
| Date | Description | Status |
|------|-------------|--------|
| | | | 