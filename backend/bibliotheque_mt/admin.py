"""
Ce fichier enregistre les modèles de la bibliothèque dans l'interface d'administration Django.
Il permet de gérer les éléments de la bibliothèque via l'interface d'administration.
"""

from django.contrib import admin
from .models import (
    BibliothequeMemoireTechnique,
    Tag,
    Commentaire,
    Note,
    BibliothequeImage
)
from django import forms

@admin.register(BibliothequeMemoireTechnique)
class BibliothequeMemoireTechniqueAdmin(admin.ModelAdmin):
    list_display = ('titre', 'categorie', 'sous_categorie', 'auteur', 'date_creation', 'date_modification')
    list_filter = ('categorie', 'sous_categorie', 'auteur', 'date_creation')
    search_fields = ('titre', 'contenu')
    date_hierarchy = 'date_creation'
    
    fieldsets = (
        ("Informations générales", {
            'fields': ('titre', 'categorie', 'sous_categorie', 'auteur')
        }),
        ("Contenu", {
            'fields': ('contenu',),
            'description': "Pour les textes et tableaux uniquement. Les photos doivent être ajoutées via l'onglet Images (stockage BLOB uniquement)."
        }),
        ("Métadonnées", {
            'fields': ('tags', 'droits_acces', 'version'),
            'classes': ('collapse',)
        })
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if obj and obj.categorie == 'photo':
            form.base_fields['contenu'].help_text = "Ne pas utiliser pour les photos. Ajouter les images via l'onglet Images (stockage BLOB uniquement)."
        return form

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('nom',)
    search_fields = ('nom',)

@admin.register(Commentaire)
class CommentaireAdmin(admin.ModelAdmin):
    list_display = ('auteur', 'texte', 'date')
    list_filter = ('auteur', 'date')
    search_fields = ('texte',)

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('auteur', 'valeur', 'date')
    list_filter = ('auteur', 'valeur', 'date')

# -----------------------------------------------------------------------------
# Formulaire personnalisé pour l'upload d'image dans BibliothequeImage
# -----------------------------------------------------------------------------
class BibliothequeImageAdminForm(forms.ModelForm):
    # Champ d'upload de fichier image (non lié directement au modèle)
    image_upload = forms.FileField(label="Fichier image (sera stocké en BLOB)", required=False)
    # Menu déroulant pour la sous-catégorie, avec les choix du modèle
    sous_categorie = forms.ChoiceField(
        label="Sous-catégorie",
        choices=[('', '---------')] + list(BibliothequeImage._meta.get_field('sous_categorie').choices),
        required=False
    )

    class Meta:
        model = BibliothequeImage
        # On n'inclut PAS image_blob (jamais éditable)
        fields = ['filename', 'mime_type', 'sous_categorie', 'element', 'image_upload']

    def save(self, commit=True):
        instance = super().save(commit=False)
        # Si un fichier a été uploadé, on le stocke dans image_blob
        image_file = self.cleaned_data.get('image_upload')
        if image_file:
            instance.image_blob = image_file.read()
            if not instance.mime_type:
                instance.mime_type = image_file.content_type
            if not instance.filename:
                instance.filename = image_file.name
        if commit:
            instance.save()
        return instance

# -----------------------------------------------------------------------------
# Admin : BibliothequeImage
# Permet d'ajouter, modifier et filtrer les images BLOB de la bibliothèque
# -----------------------------------------------------------------------------
@admin.register(BibliothequeImage)
class BibliothequeImageAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour la gestion des images BLOB de la bibliothèque.
    Permet d'ajouter des images dans la bonne table, de filtrer par sous-catégorie, etc.
    """
    form = BibliothequeImageAdminForm  # Utilise le formulaire personnalisé
    list_display = ('id', 'filename', 'sous_categorie', 'date_ajout', 'element')
    list_filter = ('sous_categorie', 'date_ajout')
    search_fields = ('filename', 'sous_categorie')
    ordering = ('-date_ajout',)
    fieldsets = (
        (None, {
            'fields': ('filename', 'mime_type', 'sous_categorie', 'element', 'image_upload')  # Champ upload visible
        }),
        ('Métadonnées', {
            'fields': ('date_ajout',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('date_ajout',)
