"""
Configuration de l'interface d'administration pour l'application moas
"""

from django.contrib import admin
from .models import MOA

@admin.register(MOA)
class MOAAdmin(admin.ModelAdmin):
    """
    Configuration de l'interface d'administration pour les MOA
    """
    list_display = ('name', 'address')
    search_fields = ('name', 'address') 