"""
Ce fichier définit les vues (API) pour la bibliothèque des Mémoires Techniques.
Chaque vue expose un modèle via l'API REST, pour lister, créer, modifier ou supprimer
les éléments de la bibliothèque, les tags, les commentaires et les notes.
Chaque classe est commentée pour faciliter la compréhension.
"""

from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tag, Commentaire, Note, BibliothequeMemoireTechnique, BibliothequeImage
from .serializers import TagSerializer, CommentaireSerializer, NoteSerializer, BibliothequeMemoireTechniqueSerializer, BibliothequeImageSerializer
from rest_framework.permissions import BasePermission

# -----------------------------------------------------------------------------
# ViewSet : Tag
# Permet de gérer les tags de la bibliothèque (CRUD)
# -----------------------------------------------------------------------------
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

# -----------------------------------------------------------------------------
# ViewSet : Commentaire
# Permet de gérer les commentaires associés aux éléments de la bibliothèque (CRUD)
# -----------------------------------------------------------------------------
class CommentaireViewSet(viewsets.ModelViewSet):
    queryset = Commentaire.objects.all()
    serializer_class = CommentaireSerializer
    permission_classes = [permissions.IsAuthenticated]

# -----------------------------------------------------------------------------
# ViewSet : Note
# Permet de gérer les notes attribuées aux éléments de la bibliothèque (CRUD)
# -----------------------------------------------------------------------------
class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

# -----------------------------------------------------------------------------
# ViewSet principal : BibliothequeMemoireTechnique
# Permet de gérer les éléments de la bibliothèque des Mémoires Techniques (CRUD)
# -----------------------------------------------------------------------------
class BibliothequeMemoireTechniqueViewSet(viewsets.ModelViewSet):
    queryset = BibliothequeMemoireTechnique.objects.all()
    serializer_class = BibliothequeMemoireTechniqueSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def textes(self, request):
        """
        Endpoint pour récupérer uniquement les textes de la bibliothèque.
        """
        textes = BibliothequeMemoireTechnique.objects.filter(categorie='texte')
        serializer = self.get_serializer(textes, many=True)
        return Response(serializer.data)

    # L'endpoint create_test_photos a été supprimé : les photos doivent être uploadées en BLOB, pas par URL.

# -----------------------------------------------------------------------------
# Permission personnalisée : accès uniquement aux admins et rédacteurs
# -----------------------------------------------------------------------------
class IsAdminOrRedacteur(BasePermission):
    """
    Autorise uniquement les utilisateurs ayant le rôle 'ADMIN' (Administrateur) ou 'WRITER' (Rédacteur).
    Attention : les valeurs sont en MAJUSCULES et en ANGLAIS, comme dans le modèle User.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Vérification du champ 'role' (en majuscules)
        if hasattr(user, 'role'):
            return user.role in ['ADMIN', 'WRITER']
        # Si gestion par groupes Django (optionnel)
        if user.groups.filter(name__in=['ADMIN', 'WRITER']).exists():
            return True
        # Si superuser, accès autorisé
        if user.is_superuser:
            return True
        return False

# -----------------------------------------------------------------------------
# ViewSet : BibliothequeImage
# Permet de gérer les images stockées en BLOB dans la base (CRUD)
# -----------------------------------------------------------------------------
class BibliothequeImageViewSet(viewsets.ModelViewSet):
    """
    API REST pour gérer les images de la bibliothèque (upload, récupération, suppression).
    Les images sont stockées en BLOB dans la base et encodées en base64 pour l'API.
    """
    queryset = BibliothequeImage.objects.all()
    serializer_class = BibliothequeImageSerializer
    permission_classes = [permissions.AllowAny]  # TEMPORAIRE : accès ouvert à tous pour debug
