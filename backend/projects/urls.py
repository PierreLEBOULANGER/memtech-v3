"""
Configuration des URLs pour l'application projects.
Définit les routes API pour accéder aux différentes ressources.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, TechnicalReportViewSet,
    DocumentTypeViewSet, ReferenceDocumentViewSet,
    ProjectDocumentViewSet, DocumentCommentViewSet
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'technical-reports', TechnicalReportViewSet)
router.register(r'document-types', DocumentTypeViewSet)

# URLs imbriquées pour les projets
project_router = DefaultRouter()
project_router.register(r'documents', ProjectDocumentViewSet, basename='project-document')
project_router.register(r'reference-documents', ReferenceDocumentViewSet, basename='reference-document')

# URLs imbriquées pour les documents
document_router = DefaultRouter()
document_router.register(r'comments', DocumentCommentViewSet, basename='document-comment')

urlpatterns = [
    path('', include(router.urls)),
    path('projects/<int:project_pk>/', include(project_router.urls)),
    path('projects/<int:project_pk>/documents/<int:document_pk>/', include(document_router.urls)),
] 