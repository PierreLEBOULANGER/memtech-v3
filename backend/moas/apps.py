"""
Configuration de l'application moas
"""

from django.apps import AppConfig

class MoasConfig(AppConfig):
    """
    Configuration pour l'application MOA (Maîtres d'Ouvrage)
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'moas'
    verbose_name = 'Maîtres d\'Ouvrage' 