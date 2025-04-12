from django.db import models
from django.contrib.auth.models import User

class Template(models.Model):
    """
    Modèle pour les templates de mise en page des mémoires techniques.
    Permet de définir différents styles de présentation pour les documents.
    """
    nom = models.CharField(max_length=100)
    description = models.TextField()
    html_template = models.TextField()
    css_style = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

class Projet(models.Model):
    """
    Modèle principal pour les mémoires techniques.
    Chaque projet représente un mémoire technique complet.
    """
    titre = models.CharField(max_length=200)
    description = models.TextField()
    auteur = models.ForeignKey(User, on_delete=models.CASCADE)
    template = models.ForeignKey(Template, on_delete=models.SET_NULL, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    version = models.CharField(max_length=50)
    statut = models.CharField(max_length=50, choices=[
        ('brouillon', 'Brouillon'),
        ('en_cours', 'En cours'),
        ('finalise', 'Finalisé'),
        ('archive', 'Archivé')
    ])

class Section(models.Model):
    """
    Modèle pour les sections du mémoire.
    Permet une structure hiérarchique du document.
    """
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE)
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    ordre = models.IntegerField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

class ContenuReutilisable(models.Model):
    """
    Modèle pour la base de données de contenus réutilisables.
    Stocke des paragraphes, tableaux et images réutilisables.
    """
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    type = models.CharField(max_length=50, choices=[
        ('texte', 'Texte'),
        ('tableau', 'Tableau'),
        ('image', 'Image')
    ])
    theme = models.CharField(max_length=100, choices=[
        ('securite', 'Sécurité'),
        ('environnement', 'Environnement'),
        ('methodologie', 'Méthodologie'),
        ('autre', 'Autre')
    ])
    auteur = models.ForeignKey(User, on_delete=models.CASCADE)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    fichier = models.FileField(upload_to='contenus/', null=True, blank=True)

class GenerationIA(models.Model):
    """
    Modèle pour suivre les générations de contenu par l'IA.
    Stocke l'historique des prompts et des contenus générés.
    """
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE)
    prompt = models.TextField()
    contenu_genere = models.TextField()
    date_generation = models.DateTimeField(auto_now_add=True)
    auteur = models.ForeignKey(User, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True)
