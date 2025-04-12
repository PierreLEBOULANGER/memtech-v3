"""
Configuration de l'application core.
"""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    """
    Configuration de l'application core qui contient les modèles principaux.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    verbose_name = 'Core'

    def ready(self):
        """
        Méthode appelée lors du démarrage de l'application.
        """
        import core.signals  # noqa 