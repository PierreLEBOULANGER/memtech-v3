"""
Configuration des URLs pour l'application projects.
Définit les routes pour les endpoints API des projets et rapports techniques.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TechnicalReportViewSet

# Création du router
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'reports', TechnicalReportViewSet, basename='report')

# Configuration des URLs
urlpatterns = [
    path('', include(router.urls)),
] 