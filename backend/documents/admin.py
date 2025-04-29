"""
Ce fichier configure l'interface d'administration pour les documents.
Il définit comment les documents sont affichés et gérés dans l'interface admin de Django.
"""

from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """
    Configuration de l'interface d'administration pour les documents.
    """
    
    # Champs affichés dans la liste des documents
    list_display = [
        'name',
        'project',
        'category',
        'status',
        'uploader',
        'upload_date'
    ]
    
    # Filtres disponibles
    list_filter = ['status', 'category', 'project', 'upload_date']
    
    # Champs de recherche
    search_fields = ['name', 'description', 'project__name']
    
    # Champs en lecture seule
    readonly_fields = ['upload_date']
    
    # Organisation des champs dans le formulaire
    fieldsets = [
        (None, {
            'fields': ['name', 'file', 'description']
        }),
        ('Catégorisation', {
            'fields': ['category', 'status']
        }),
        ('Relations', {
            'fields': ['project', 'uploader']
        }),
        ('Informations système', {
            'fields': ['upload_date'],
            'classes': ['collapse']
        })
    ]
