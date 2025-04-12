"""
Ce fichier contient les modèles de données principaux de l'application Memtech.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé étendant AbstractUser de Django.
    Ajoute des champs supplémentaires spécifiques à notre application.
    """
    email = models.EmailField(_('email address'), unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users') 