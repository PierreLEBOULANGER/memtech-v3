"""
Sérialiseurs pour l'application projects.
Gère la sérialisation et la désérialisation des modèles Project et TechnicalReport.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, TechnicalReport
from users.serializers import UserSerializer

User = get_user_model()

class UserMinimalSerializer(serializers.ModelSerializer):
    """
    Sérialiseur minimal pour les utilisateurs, utilisé dans les projets.
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']

class ProjectListSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la liste des projets.
    Version allégée avec les informations essentielles.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'status', 'status_display',
            'offer_delivery_date', 'maitre_ouvrage', 'maitre_oeuvre',
            'created_at'
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
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProjectDetailSerializer(serializers.ModelSerializer):
    """
    Sérialiseur détaillé pour un projet individuel.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'offer_delivery_date',
            'maitre_ouvrage', 'maitre_oeuvre',
            'status', 'status_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class TechnicalReportSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle TechnicalReport.
    Inclut les informations sur l'auteur, les relecteurs et le projet associé.
    """
    author = UserSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        source='author',
        queryset=User.objects.all(),
        write_only=True
    )
    reviewers = UserSerializer(many=True, read_only=True)
    reviewer_ids = serializers.PrimaryKeyRelatedField(
        source='reviewers',
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    project = ProjectSerializer(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(
        source='project',
        queryset=Project.objects.all(),
        write_only=True
    )

    class Meta:
        model = TechnicalReport
        fields = (
            'id', 'title', 'content', 'status', 'project', 'project_id',
            'author', 'author_id', 'reviewers', 'reviewer_ids',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

class TechnicalReportListSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la liste des rapports techniques.
    Version allégée avec les informations essentielles.
    """
    author = UserMinimalSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = TechnicalReport
        fields = [
            'id', 'title', 'project', 'project_name',
            'author', 'status', 'status_display',
            'created_at'
        ]

class TechnicalReportDetailSerializer(serializers.ModelSerializer):
    """
    Sérialiseur détaillé pour un rapport technique individuel.
    Inclut toutes les informations et les relations.
    """
    author = UserMinimalSerializer(read_only=True)
    reviewers = UserMinimalSerializer(many=True, read_only=True)
    reviewer_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='reviewers',
        many=True,
        required=False
    )
    project = ProjectListSerializer(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        write_only=True,
        source='project'
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = TechnicalReport
        fields = [
            'id', 'title', 'content',
            'project', 'project_id',
            'author', 'reviewers', 'reviewer_ids',
            'status', 'status_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'author']

    def validate_project(self, value):
        """
        Vérifie que l'utilisateur a accès au projet.
        """
        user = self.context['request'].user
        if not (user.is_staff or 
                value.manager == user or 
                user in value.team_members.all()):
            raise serializers.ValidationError(
                "Vous n'avez pas accès à ce projet."
            )
        return value

    def validate(self, data):
        """
        Validation personnalisée pour le statut et les relecteurs.
        """
        if self.instance and self.instance.status == 'APPROVED':
            if data.get('status', 'APPROVED') != 'APPROVED':
                raise serializers.ValidationError(
                    "Impossible de modifier un rapport déjà validé."
                )

        if data.get('status') == 'APPROVED' and not data.get('reviewers', []):
            raise serializers.ValidationError(
                "Un rapport ne peut pas être validé sans relecteurs."
            )

        return data

    def create(self, validated_data):
        """
        Création d'un rapport avec l'auteur automatiquement défini.
        """
        reviewers = validated_data.pop('reviewers', [])
        report = TechnicalReport.objects.create(
            author=self.context['request'].user,
            **validated_data
        )
        if reviewers:
            report.reviewers.set(reviewers)
        return report

    def update(self, instance, validated_data):
        """
        Mise à jour d'un rapport avec gestion des relecteurs.
        """
        reviewers = validated_data.pop('reviewers', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if reviewers is not None:
            instance.reviewers.set(reviewers)

        return instance 