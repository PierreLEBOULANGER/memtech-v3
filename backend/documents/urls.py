"""
Ce fichier définit les routes URL pour l'API des documents.
Il utilise le routeur DRF pour générer automatiquement les URLs du ViewSet.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, onlyoffice_callback
from .serve_docx import serve_docx  # Vue personnalisée pour servir les .docx sans X-Frame-Options
from django.conf import settings
from django.conf.urls.static import static

# Création du routeur
router = DefaultRouter()

# Enregistrement des routes pour les documents
router.register(r'documents', DocumentViewSet, basename='document')

# Liste des URLs de l'application
urlpatterns = [
    # Route pour servir tous les fichiers du dossier media (dont memoires)
    path('media/<path:path>', serve_docx, name='serve_docx'),
    # path('<int:pk>/word_url/', word_url, name='word_url'),
    path('documents/onlyoffice_callback/', onlyoffice_callback, name='onlyoffice_callback'),
    # Route API REST
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 