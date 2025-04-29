"""
Ce fichier définit les routes URL pour l'API des documents.
Il utilise le routeur DRF pour générer automatiquement les URLs du ViewSet.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet

# Création du routeur
router = DefaultRouter()

# Enregistrement des routes pour les documents
router.register(r'documents', DocumentViewSet, basename='document')

# Liste des URLs de l'application
urlpatterns = [
    path('', include(router.urls)),
] 