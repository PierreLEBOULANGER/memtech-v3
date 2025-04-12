from django.shortcuts import render
from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from .models import Template, Projet, Section, ContenuReutilisable, GenerationIA
from .serializers import (
    UserSerializer, TemplateSerializer, ProjetSerializer,
    SectionSerializer, ContenuReutilisableSerializer, GenerationIASerializer
)
from .auth import RegisterSerializer

# Create your views here.

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Vue en lecture seule pour les utilisateurs.
    Permet uniquement de consulter les informations des utilisateurs.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class TemplateViewSet(viewsets.ModelViewSet):
    """
    Vue complète pour les templates.
    Permet de créer, lire, mettre à jour et supprimer des templates.
    """
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Tri par date de modification"""
        return self.queryset.order_by('-date_modification')

class ProjetViewSet(viewsets.ModelViewSet):
    """
    Vue complète pour les projets.
    Permet de gérer les mémoires techniques.
    """
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtre les projets par utilisateur"""
        if self.request.user.is_staff:
            return self.queryset.order_by('-date_modification')
        return self.queryset.filter(auteur=self.request.user).order_by('-date_modification')

class SectionViewSet(viewsets.ModelViewSet):
    """
    Vue complète pour les sections.
    Permet de gérer la structure des mémoires.
    """
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtre les sections par projet"""
        projet_id = self.request.query_params.get('projet', None)
        queryset = self.queryset
        if projet_id:
            queryset = queryset.filter(projet_id=projet_id)
        return queryset.order_by('ordre')

class ContenuReutilisableViewSet(viewsets.ModelViewSet):
    """
    Vue complète pour les contenus réutilisables.
    Permet de gérer la bibliothèque de contenus.
    """
    queryset = ContenuReutilisable.objects.all()
    serializer_class = ContenuReutilisableSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtre par type et thème"""
        queryset = self.queryset
        type_contenu = self.request.query_params.get('type', None)
        theme = self.request.query_params.get('theme', None)
        
        if type_contenu:
            queryset = queryset.filter(type=type_contenu)
        if theme:
            queryset = queryset.filter(theme=theme)
            
        return queryset.order_by('-date_modification')

    def perform_create(self, serializer):
        """Ajoute automatiquement l'auteur"""
        serializer.save(auteur=self.request.user)

class GenerationIAViewSet(viewsets.ModelViewSet):
    """
    Vue complète pour les générations IA.
    Permet de gérer l'historique des générations.
    """
    queryset = GenerationIA.objects.all()
    serializer_class = GenerationIASerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtre par projet"""
        projet_id = self.request.query_params.get('projet', None)
        if projet_id:
            return self.queryset.filter(projet_id=projet_id).order_by('-date_generation')
        return self.queryset.order_by('-date_generation')

    def perform_create(self, serializer):
        """Ajoute automatiquement l'auteur"""
        serializer.save(auteur=self.request.user)

class RegisterView(generics.CreateAPIView):
    """
    Vue pour l'inscription des utilisateurs.
    Permet de créer un nouveau compte.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Vue pour la gestion du profil utilisateur.
    Permet de consulter et modifier ses informations.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    Vue pour le changement de mot de passe.
    Vérifie l'ancien mot de passe et met à jour avec le nouveau.
    """
    user = request.user
    if not user.check_password(request.data.get('old_password')):
        return Response(
            {'message': 'Ancien mot de passe incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(request.data.get('new_password'))
    user.save()
    return Response({'message': 'Mot de passe modifié avec succès'})
