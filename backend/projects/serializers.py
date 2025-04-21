"""
Sérialiseurs pour l'application projects.
Gère la sérialisation et la désérialisation des modèles Project et documents associés.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Project, TechnicalReport, DocumentType,
    ReferenceDocument, ProjectDocument
)
from users.serializers import UserSerializer
from moas.serializers import MOASerializer, MOESerializer

User = get_user_model()

class UserMinimalSerializer(serializers.ModelSerializer):
    """
    Sérialiseur minimal pour les utilisateurs, utilisé dans les projets.
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']

class DocumentTypeSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les types de documents.
    """
    class Meta:
        model = DocumentType
        fields = ['id', 'type', 'description', 'is_mandatory']

class ReferenceDocumentSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les documents de référence (RC, CCTP, etc.).
    """
    project = serializers.PrimaryKeyRelatedField(read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = ReferenceDocument
        fields = [
            'id', 'project', 'type', 'type_display',
            'file', 'uploaded_at'
        ]

class ProjectDocumentSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les documents du projet.
    """
    project = serializers.PrimaryKeyRelatedField(read_only=True)
    uploaded_by = UserSerializer(read_only=True)
    reviewers = UserSerializer(many=True, read_only=True)

    class Meta:
        model = ProjectDocument
        fields = [
            'id', 'project', 'document_type', 'file',
            'uploaded_by', 'uploaded_at', 'version',
            'status', 'reviewers', 'review_deadline'
        ]

class ProjectDocumentDetailSerializer(ProjectDocumentSerializer):
    """
    Sérialiseur détaillé pour les documents du projet.
    Inclut l'historique des versions et les commentaires.
    """
    class Meta(ProjectDocumentSerializer.Meta):
        fields = ProjectDocumentSerializer.Meta.fields + [
            'review_comments', 'review_history'
        ]

class ProjectListSerializer(serializers.ModelSerializer):
    """
    Sérialiseur léger pour la liste des projets.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    completion_percentage = serializers.FloatField(source='get_completion_percentage', read_only=True)
    maitre_ouvrage = MOASerializer(read_only=True)
    maitre_oeuvre = MOESerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'status', 'status_display',
            'maitre_ouvrage', 'maitre_oeuvre',
            'completion_percentage', 'offer_delivery_date',
            'created_at', 'updated_at'
        ]

class ProjectSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Project.
    """
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'offer_delivery_date',
            'maitre_ouvrage', 'maitre_oeuvre',
            'required_documents', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProjectDetailSerializer(serializers.ModelSerializer):
    """
    Sérialiseur détaillé pour un projet spécifique.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    technical_reports = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    reference_documents = ReferenceDocumentSerializer(many=True, read_only=True)
    project_documents = ProjectDocumentSerializer(many=True, read_only=True)
    required_documents = DocumentTypeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'status',
            'status_display', 'maitre_ouvrage', 'maitre_oeuvre',
            'created_at', 'updated_at', 'technical_reports',
            'reference_documents', 'project_documents',
            'required_documents'
        ]

class TechnicalReportListSerializer(serializers.ModelSerializer):
    """
    Sérialiseur léger pour la liste des rapports techniques.
    """
    class Meta:
        model = TechnicalReport
        fields = ['id', 'title', 'created_at', 'updated_at']

class TechnicalReportDetailSerializer(serializers.ModelSerializer):
    """
    Sérialiseur détaillé pour un rapport technique spécifique.
    """
    author = UserSerializer(read_only=True)
    project = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = TechnicalReport
        fields = [
            'id', 'title', 'content', 'author',
            'project', 'created_at', 'updated_at'
        ]