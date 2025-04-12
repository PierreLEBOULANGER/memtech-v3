"""
Ce fichier contient les signaux Django pour l'application core.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

# Ici nous ajouterons les signaux nécessaires pour notre application 