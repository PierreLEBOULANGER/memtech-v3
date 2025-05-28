"""
Ce fichier définit les routes URL pour l'API des documents.
Il utilise le routeur DRF pour générer automatiquement les URLs du ViewSet.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, word_url
from .serve_docx import serve_docx  # Vue personnalisée pour servir les .docx sans X-Frame-Options

# Création du routeur
router = DefaultRouter()

# Enregistrement des routes pour les documents
router.register(r'documents', DocumentViewSet, basename='document')

# Liste des URLs de l'application
urlpatterns = [
    # Route pour servir tous les fichiers du dossier media (dont memoires)
    path('media/<path:path>', serve_docx, name='serve_docx'),
    path('<int:pk>/word_url/', word_url, name='word_url'),
    # Route API REST
    path('', include(router.urls)),
] 