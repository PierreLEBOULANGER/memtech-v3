from django.contrib import admin
from .models import Template, Projet, Section, ContenuReutilisable, GenerationIA

@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les templates de mise en page
    """
    list_display = ('nom', 'description', 'date_creation', 'date_modification')
    search_fields = ('nom', 'description')
    list_filter = ('date_creation', 'date_modification')
    ordering = ('-date_modification',)

@admin.register(Projet)
class ProjetAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les projets (mémoires techniques)
    """
    list_display = ('titre', 'auteur', 'statut', 'version', 'date_modification')
    search_fields = ('titre', 'description', 'auteur__username')
    list_filter = ('statut', 'date_creation', 'date_modification')
    ordering = ('-date_modification',)

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les sections de mémoire
    """
    list_display = ('titre', 'projet', 'ordre', 'parent', 'date_modification')
    search_fields = ('titre', 'contenu', 'projet__titre')
    list_filter = ('projet', 'date_creation', 'date_modification')
    ordering = ('projet', 'ordre')

@admin.register(ContenuReutilisable)
class ContenuReutilisableAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les contenus réutilisables
    """
    list_display = ('titre', 'type', 'theme', 'auteur', 'date_modification')
    search_fields = ('titre', 'contenu', 'auteur__username')
    list_filter = ('type', 'theme', 'date_creation', 'date_modification')
    ordering = ('-date_modification',)

@admin.register(GenerationIA)
class GenerationIAAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les générations IA
    """
    list_display = ('projet', 'auteur', 'date_generation', 'section')
    search_fields = ('prompt', 'contenu_genere', 'projet__titre')
    list_filter = ('date_generation', 'auteur')
    ordering = ('-date_generation',)
