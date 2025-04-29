"""
Ce fichier définit les vues pour l'API des documents.
Il gère toutes les opérations CRUD sur les documents.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Document
from .serializers import DocumentSerializer
from django.core.exceptions import PermissionDenied

class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les opérations CRUD sur les documents.
    Inclut des endpoints personnalisés pour des actions spécifiques.
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Surcharge la création pour ajouter l'utilisateur actuel comme uploader.
        """
        serializer.save(uploaded_by=self.request.user)

    def get_queryset(self):
        """
        Filtre les documents en fonction du projet si spécifié.
        """
        queryset = Document.objects.all()
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """
        Endpoint personnalisé pour changer le statut d'un document.
        """
        document = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Le statut est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        document.status = new_status
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def change_category(self, request, pk=None):
        """
        Endpoint personnalisé pour changer la catégorie d'un document.
        """
        document = self.get_object()
        new_category = request.data.get('category')
        
        if not new_category:
            return Response(
                {'error': 'La catégorie est requise'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        document.category = new_category
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)
