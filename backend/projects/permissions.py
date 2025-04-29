"""
Permissions personnalisées pour l'application projects.
Définit les règles d'accès aux projets et aux documents.
"""

from rest_framework import permissions

class IsProjectManagerOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée pour les projets :
    - Lecture autorisée pour tous les utilisateurs authentifiés
    - Modification uniquement pour les chefs de projet ou les administrateurs
    """
    
    def has_permission(self, request, view):
        """
        Vérifie si l'utilisateur a la permission globale.
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Vérifie si l'utilisateur a la permission sur l'objet spécifique.
        """
        # Autoriser les requêtes en lecture seule
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Autoriser les administrateurs
        if request.user.is_staff:
            return True
            
        # Autoriser le chef de projet
        return obj.manager == request.user

class IsProjectTeamMember(permissions.BasePermission):
    """
    Permission vérifiant si l'utilisateur est membre de l'équipe du projet.
    Utilisée pour les actions spécifiques aux membres de l'équipe.
    """
    
    def has_permission(self, request, view):
        """
        Vérifie si l'utilisateur a la permission globale.
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Vérifie si l'utilisateur est membre de l'équipe du projet.
        """
        # Autoriser les administrateurs
        if request.user.is_staff:
            return True
            
        # Autoriser le chef de projet
        if obj.manager == request.user:
            return True
            
        # Autoriser les membres de l'équipe
        return request.user in obj.team_members.all()

class CanManageTeamMembers(permissions.BasePermission):
    """
    Permission pour la gestion des membres de l'équipe.
    Seuls le chef de projet et les administrateurs peuvent modifier l'équipe.
    """
    
    def has_permission(self, request, view):
        """
        Vérifie si l'utilisateur a la permission globale.
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Vérifie si l'utilisateur peut gérer les membres de l'équipe.
        """
        # Autoriser les administrateurs
        if request.user.is_staff:
            return True
            
        # Autoriser le chef de projet
        return obj.manager == request.user 

class CanManageReport(permissions.BasePermission):
    """
    Permission pour la gestion des rapports techniques.
    - Lecture : membres du projet et relecteurs
    - Modification : auteur et chef de projet
    - Validation : relecteurs uniquement
    """
    
    def has_permission(self, request, view):
        """
        Vérifie si l'utilisateur a la permission globale.
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Vérifie si l'utilisateur peut gérer le rapport.
        """
        user = request.user
        
        # Autoriser les administrateurs
        if user.is_staff:
            return True
            
        # Lecture seule pour les membres du projet et les relecteurs
        if request.method in permissions.SAFE_METHODS:
            return (user == obj.project.manager or
                    user in obj.project.team_members.all() or
                    user in obj.reviewers.all())
        
        # Modification uniquement pour l'auteur et le chef de projet
        if request.method in ['PUT', 'PATCH']:
            # Si le rapport est déjà validé, seul l'admin peut le modifier
            if obj.status == 'APPROVED':
                return False
            return user == obj.author or user == obj.project.manager
        
        # Suppression uniquement pour l'auteur et le chef de projet
        if request.method == 'DELETE':
            return user == obj.author or user == obj.project.manager
        
        return False

class CanReviewReport(permissions.BasePermission):
    """
    Permission pour la relecture des rapports.
    Seuls les relecteurs assignés peuvent valider ou rejeter un rapport.
    """
    
    def has_permission(self, request, view):
        """
        Vérifie si l'utilisateur a la permission globale.
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Vérifie si l'utilisateur peut relire le rapport.
        """
        user = request.user
        
        # Autoriser les administrateurs
        if user.is_staff:
            return True
        
        # Seuls les relecteurs peuvent valider/rejeter
        if view.action in ['approve', 'reject']:
            return user in obj.reviewers.all()
        
        return False 

class DocumentPermissions:
    """
    Constantes pour les permissions de documents
    """
    ASSIGN_ROLES = 'document.assign_roles'
    EDIT_DOCUMENT = 'document.edit'
    REVIEW_DOCUMENT = 'document.review'
    VALIDATE_DOCUMENT = 'document.validate'
    VIEW_HISTORY = 'document.view_history'

# Définition des permissions par rôle
ROLE_PERMISSIONS = {
    'ADMIN': [
        DocumentPermissions.ASSIGN_ROLES,
        DocumentPermissions.EDIT_DOCUMENT,
        DocumentPermissions.REVIEW_DOCUMENT,
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

class DocumentPermissionMiddleware:
    """
    Middleware pour la vérification des permissions sur les documents
    """
    
    @staticmethod
    def has_permission(user, document, action):
        """
        Vérifie si l'utilisateur a la permission pour l'action spécifiée sur le document
        
        Args:
            user: L'utilisateur qui effectue l'action
            document: Le document concerné
            action: L'action à effectuer (ASSIGN_ROLES, EDIT_DOCUMENT, etc.)
            
        Returns:
            bool: True si l'utilisateur a la permission, False sinon
        """
        # Vérifier si l'utilisateur est authentifié
        if not user or not user.is_authenticated:
            return False
            
        # Les administrateurs ont toutes les permissions
        if user.role == 'ADMIN':
            return True
            
        # Vérifier les permissions spécifiques au rôle
        if user.role in ROLE_PERMISSIONS:
            return action in ROLE_PERMISSIONS[user.role]
            
        return False
    
    @staticmethod
    def can_assign_roles(user, document):
        """
        Vérifie si l'utilisateur peut assigner des rôles sur le document
        """
        return DocumentPermissionMiddleware.has_permission(
            user, document, DocumentPermissions.ASSIGN_ROLES
        )
    
    @staticmethod
    def can_edit_document(user, document):
        """
        Vérifie si l'utilisateur peut modifier le document
        """
        return DocumentPermissionMiddleware.has_permission(
            user, document, DocumentPermissions.EDIT_DOCUMENT
        )
    
    @staticmethod
    def can_review_document(user, document):
        """
        Vérifie si l'utilisateur peut relire le document
        """
        return DocumentPermissionMiddleware.has_permission(
            user, document, DocumentPermissions.REVIEW_DOCUMENT
        )
    
    @staticmethod
    def can_validate_document(user, document):
        """
        Vérifie si l'utilisateur peut valider le document
        """
        return DocumentPermissionMiddleware.has_permission(
            user, document, DocumentPermissions.VALIDATE_DOCUMENT
        )
    
    @staticmethod
    def can_view_history(user, document):
        """
        Vérifie si l'utilisateur peut voir l'historique du document
        """
        return DocumentPermissionMiddleware.has_permission(
            user, document, DocumentPermissions.VIEW_HISTORY
        )

class IsDocumentWriter(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur est le rédacteur du document
    """
    
    def has_object_permission(self, request, view, obj):
        return (
            request.user.role == 'ADMIN' or
            (request.user.role == 'WRITER' and obj.writer == request.user)
        )

class IsDocumentReviewer(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur est le relecteur du document
    """
    
    def has_object_permission(self, request, view, obj):
        return (
            request.user.role == 'ADMIN' or
            (request.user.role == 'REVIEWER' and obj.reviewer == request.user)
        )

class CanManageDocument(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur peut gérer le document
    """
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if request.user.role == 'WRITER':
            return obj.writer == request.user
            
        if request.user.role == 'REVIEWER':
            return obj.reviewer == request.user
            
        return False 