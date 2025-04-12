from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Template, Projet, Section, ContenuReutilisable, GenerationIA

class UserSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les utilisateurs.
    Utilisé pour représenter les auteurs des projets et contenus.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class TemplateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les templates de mise en page.
    Permet de convertir les templates en JSON pour l'API.
    """
    class Meta:
        model = Template
        fields = ['id', 'nom', 'description', 'html_template', 'css_style', 
                 'date_creation', 'date_modification']

class SectionSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les sections de mémoire.
    Gère la structure hiérarchique des sections.
    """
    class Meta:
        model = Section
        fields = ['id', 'projet', 'titre', 'contenu', 'ordre', 'parent',
                 'date_creation', 'date_modification']

class ContenuReutilisableSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les contenus réutilisables.
    Gère les différents types de contenus (texte, tableau, image).
    """
    auteur = UserSerializer(read_only=True)

    class Meta:
        model = ContenuReutilisable
        fields = ['id', 'titre', 'contenu', 'type', 'theme', 'auteur',
                 'date_creation', 'date_modification', 'fichier']

class GenerationIASerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les générations de contenu par l'IA.
    Permet de suivre l'historique des générations.
    """
    auteur = UserSerializer(read_only=True)

    class Meta:
        model = GenerationIA
        fields = ['id', 'projet', 'prompt', 'contenu_genere', 'date_generation',
                 'auteur', 'section']

class ProjetSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les projets (mémoires techniques).
    Inclut les sections associées et les informations sur l'auteur.
    """
    auteur = UserSerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    generations_ia = GenerationIASerializer(many=True, read_only=True)

    class Meta:
        model = Projet
        fields = ['id', 'titre', 'description', 'auteur', 'template',
                 'date_creation', 'date_modification', 'version', 'statut',
                 'sections', 'generations_ia']
        
    def create(self, validated_data):
        """
        Surcharge de la création pour gérer l'auteur automatiquement
        """
        validated_data['auteur'] = self.context['request'].user
        return super().create(validated_data) 