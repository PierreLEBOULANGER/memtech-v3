"""
Middleware pour la gestion des permissions des documents.
"""

from django.core.exceptions import PermissionDenied
from .permissions import DocumentPermissions, ROLE_PERMISSIONS

class DocumentPermissionMiddleware:
    """
    Middleware pour la vérification des permissions sur les documents.
    """
    
    @staticmethod
    def has_permission(user, document, action):
        """
        Vérifie si l'utilisateur a la permission pour l'action spécifiée sur le document.
        
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
        Vérifie si l'utilisateur peut assigner des rôles sur le document.
        """
        return DocumentPermissionMiddleware.has_permission(
            user, document, DocumentPermissions.ASSIGN_ROLES
        )
    
    @staticmethod
    def can_edit_document(user, document):
        """
        Vérifie si l'utilisateur peut modifier le document.
        """
        return DocumentPermissionMiddleware.has_permission(
            user, document, DocumentPermissions.EDIT_DOCUMENT
        )
    
    @staticmethod
    def can_review_document(user, document):
        """
        Vérifie si l'utilisateur peut relire le document.
        """
        return DocumentPermissionMiddleware.has_permission(
            user, document, DocumentPermissions.REVIEW_DOCUMENT
        )
    
    @staticmethod
    def can_validate_document(user, document):
        """
        Vérifie si l'utilisateur peut valider le document.
        """
        return DocumentPermissionMiddleware.has_permission(
            user, document, DocumentPermissions.VALIDATE_DOCUMENT
        )
    
    @staticmethod
    def can_view_history(user, document):
        """
        Vérifie si l'utilisateur peut voir l'historique du document.
        """
        return DocumentPermissionMiddleware.has_permission(
            user, document, DocumentPermissions.VIEW_HISTORY
        ) 