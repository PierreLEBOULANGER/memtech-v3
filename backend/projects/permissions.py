"""
Permissions personnalisées pour l'application projects.
Définit les règles d'accès aux projets et aux rapports techniques.
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