"""
Configuration des URLs pour l'application projects.
Définit les routes API pour accéder aux différentes ressources.
"""

from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    ProjectViewSet, TechnicalReportViewSet,
    DocumentTypeViewSet, ReferenceDocumentViewSet,
    ProjectDocumentViewSet
)

# Router principal pour les projets
router = routers.DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'document-types', DocumentTypeViewSet, basename='document-type')

# Router imbriqué pour les ressources liées aux projets
projects_router = routers.NestedDefaultRouter(router, r'projects', lookup='project')
projects_router.register(r'technical-reports', TechnicalReportViewSet, basename='project-technical-reports')
projects_router.register(r'reference-documents', ReferenceDocumentViewSet, basename='project-reference-documents')
projects_router.register(r'documents', ProjectDocumentViewSet, basename='project-documents')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(projects_router.urls)),
] 