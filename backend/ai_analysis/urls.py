"""
urls.py
Configuration des URLs pour l'API d'analyse
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import DocumentAnalysisViewSet

# Création du routeur
router = DefaultRouter()

# Enregistrement des routes pour l'analyse
router.register(r'analysis', DocumentAnalysisViewSet, basename='document-analysis')

# Liste des URLs de l'application
urlpatterns = [
    path('', include(router.urls)),
] 