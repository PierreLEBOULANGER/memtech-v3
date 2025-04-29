"""
Sérialiseurs pour l'application projects.
Gère la sérialisation et la désérialisation des modèles Project et documents associés.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Project, TechnicalReport, DocumentType,
    ReferenceDocument, ProjectDocument, DocumentComment
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
    document_type = DocumentTypeSerializer(read_only=True)
    writer = UserMinimalSerializer(read_only=True)
    reviewer = UserMinimalSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    comments = serializers.SerializerMethodField()
    status_history = serializers.SerializerMethodField()

    class Meta:
        model = ProjectDocument
        fields = [
            'id', 'project', 'document_type', 'status',
            'status_display', 'content', 'writer', 'reviewer',
            'comments', 'status_history', 'completion_percentage',
            'review_cycle', 'needs_correction', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completion_percentage']

    def get_comments(self, obj):
        """
        Retourne les commentaires formatés
        """
        return [{
            'id': i,
            'user': obj.comments[i]['user'],
            'content': obj.comments[i]['content'],
            'requires_correction': obj.comments[i]['requires_correction'],
            'timestamp': obj.comments[i]['timestamp'],
            'resolved': obj.comments[i]['resolved']
        } for i in range(len(obj.comments))]

    def get_status_history(self, obj):
        """
        Retourne l'historique des statuts formaté
        """
        return [{
            'from_status': entry['from_status'],
            'to_status': entry['to_status'],
            'user': entry['user'],
            'timestamp': entry['timestamp']
        } for entry in obj.status_history]

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
    required_documents = DocumentTypeSerializer(many=True, read_only=True)
    
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
    maitre_ouvrage = MOASerializer(read_only=True)
    maitre_oeuvre = MOESerializer(read_only=True)
    required_documents = DocumentTypeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'status', 'status_display',
            'maitre_ouvrage', 'maitre_oeuvre', 'offer_delivery_date',
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

class DocumentCommentSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les commentaires de documents
    """
    author = UserMinimalSerializer(read_only=True)
    document = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = DocumentComment
        fields = [
            'id', 'document', 'author', 'content',
            'created_at', 'review_cycle', 'requires_correction',
            'resolved'
        ]
        read_only_fields = ['id', 'created_at']

class DocumentAssignmentSerializer(serializers.Serializer):
    """
    Sérialiseur pour l'assignation des rôles sur un document
    """
    writer_id = serializers.IntegerField(required=False, allow_null=True)
    reviewer_id = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, data):
        """
        Vérifie que les IDs correspondent à des utilisateurs avec les bons rôles
        """
        if 'writer_id' in data and data['writer_id']:
            try:
                writer = User.objects.get(id=data['writer_id'])
                if writer.role not in ['WRITER', 'ADMIN']:
                    raise serializers.ValidationError({
                        'writer_id': "L'utilisateur sélectionné n'est pas un rédacteur ou un administrateur"
                    })
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'writer_id': "Rédacteur non trouvé"
                })

        if 'reviewer_id' in data and data['reviewer_id']:
            try:
                reviewer = User.objects.get(id=data['reviewer_id'])
                if reviewer.role not in ['REVIEWER', 'ADMIN']:
                    raise serializers.ValidationError({
                        'reviewer_id': "L'utilisateur sélectionné n'est pas un relecteur ou un administrateur"
                    })
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'reviewer_id': "Relecteur non trouvé"
                })

        return data