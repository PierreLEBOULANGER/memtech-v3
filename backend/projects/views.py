"""
Vues pour l'application projects.
Gère les endpoints API pour les projets et les documents associés.
"""

from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.utils import timezone
from .models import (
    Project, TechnicalReport, DocumentType,
    ReferenceDocument, ProjectDocument, DocumentComment
)
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer,
    TechnicalReportListSerializer, TechnicalReportDetailSerializer,
    DocumentTypeSerializer, ReferenceDocumentSerializer,
    ProjectDocumentSerializer, ProjectSerializer,
    DocumentAssignmentSerializer, DocumentCommentSerializer
)
from .permissions import (
    IsProjectManagerOrReadOnly, IsProjectTeamMember,
    CanManageReport, CanReviewReport,
    IsDocumentWriter, IsDocumentReviewer, CanManageDocument
)
from django.contrib.auth.models import User
import logging
from django.contrib.auth.hashers import check_password
from django.core.exceptions import PermissionDenied
from .middleware import DocumentPermissionMiddleware

logger = logging.getLogger(__name__)

# Create your views here.

class DocumentTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les types de documents (SOGED, SOPAQ, etc.).
    Lecture seule car les types sont prédéfinis.
    """
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class ReferenceDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les documents de référence (RC, CCTP).
    """
    serializer_class = ReferenceDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return ReferenceDocument.objects.filter(project_id=self.kwargs['project_pk'])

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project)

class ProjectDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les documents techniques du projet.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectDocumentSerializer

    def get_queryset(self):
        return ProjectDocument.objects.filter(project_id=self.kwargs['project_pk'])

    def get_permissions(self):
        """
        Définit les permissions en fonction de l'action.
        """
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsDocumentWriter]
        elif self.action in ['assign_reviewers', 'change_status']:
            permission_classes = [IsDocumentReviewer]
        else:
            permission_classes = [CanManageDocument]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(
            project=project,
            writer=self.request.user
        )

    @action(detail=True, methods=['post'])
    def assign_roles(self, request, project_pk=None, pk=None):
        """
        Assigne les rôles (rédacteur et relecteur) au document
        """
        document = self.get_object()
        serializer = DocumentAssignmentSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        if 'writer_id' in serializer.validated_data:
            document.writer_id = serializer.validated_data['writer_id']
            
        if 'reviewer_id' in serializer.validated_data:
            document.reviewer_id = serializer.validated_data['reviewer_id']
            
        document.save()
        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=['post'])
    def change_status(self, request, project_pk=None, pk=None):
        """
        Change le statut du document
        """
        document = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(ProjectDocument.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Vérifier les permissions selon le nouveau statut
        if new_status == 'REVIEW_1':
            if not DocumentPermissionMiddleware.can_review_document(request.user, document):
                return Response(
                    {'error': 'Vous n\'avez pas la permission de mettre le document en relecture'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif new_status == 'APPROVED':
            if not DocumentPermissionMiddleware.can_validate_document(request.user, document):
                return Response(
                    {'error': 'Vous n\'avez pas la permission de valider le document'},
                    status=status.HTTP_403_FORBIDDEN
                )
                
        document.update_status(new_status, request.user)
        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, project_pk=None, pk=None):
        """
        Ajoute un commentaire au document
        """
        document = self.get_object()
        content = request.data.get('content')
        requires_correction = request.data.get('requires_correction', False)
        
        if not content:
            return Response(
                {'error': 'Le contenu du commentaire est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        document.add_comment(request.user, content, requires_correction)
        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=['get'])
    def history(self, request, project_pk=None, pk=None):
        """
        Retourne l'historique complet du document
        """
        document = self.get_object()
        return Response({
            'status_history': document.status_history,
            'comments': document.comments
        })

class DocumentCommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les commentaires des documents
    """
    serializer_class = DocumentCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DocumentComment.objects.filter(
            document_id=self.kwargs['document_pk']
        )

    def perform_create(self, serializer):
        document = get_object_or_404(
            ProjectDocument,
            pk=self.kwargs['document_pk'],
            project_id=self.kwargs['project_pk']
        )
        serializer.save(
            document=document,
            author=self.request.user
        )

    @action(detail=True, methods=['post'])
    def resolve(self, request, project_pk=None, document_pk=None, pk=None):
        """
        Marque un commentaire comme résolu
        """
        comment = self.get_object()
        comment.resolve()
        return Response(self.get_serializer(comment).data)

class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des projets.
    Permet les opérations CRUD sur les projets et inclut des actions personnalisées.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filtre les projets en fonction des permissions de l'utilisateur
        et exclut les projets supprimés
        """
        user = self.request.user
        base_queryset = Project.objects.filter(deleted_at__isnull=True)
        
        if user.role == 'ADMIN':
            return base_queryset
        elif user.role == 'PROJECT_MANAGER':
            return base_queryset.filter(
                Q(maitre_ouvrage__users=user) | 
                Q(maitre_oeuvre__users=user)
            )
        else:
            return base_queryset.filter(
                Q(project_documents__writer=user) |
                Q(project_documents__reviewer=user)
            ).distinct()

    def perform_destroy(self, instance):
        """
        Effectue une suppression douce du projet au lieu d'une suppression physique.
        """
        instance.soft_delete(self.request.user)

    def get_serializer_class(self):
        """
        Utilise différents sérialiseurs selon l'action.
        """
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action in ['retrieve', 'documents_status']:
            return ProjectDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProjectSerializer
        return ProjectListSerializer
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        Retourne des statistiques sur le projet.
        """
        project = self.get_object()
        stats = {
            'total_reports': project.technical_reports.count(),
            'reports_by_status': {
                status: project.technical_reports.filter(status=status_code).count()
                for status_code, status in TechnicalReport.STATUS_CHOICES
            }
        }
        return Response(stats)

    @action(detail=True, methods=['post'])
    def add_required_documents(self, request, pk=None):
        """
        Ajoute des types de documents requis au projet
        """
        project = self.get_object()
        document_type_ids = request.data.get('document_type_ids', [])
        
        # Récupérer les types de documents
        document_types = [
            get_object_or_404(DocumentType, id=doc_type_id)
            for doc_type_id in document_type_ids
        ]
        
        # Ajouter les types de documents au projet
        project.required_documents.add(*document_types)
        
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def documents_status(self, request, pk=None):
        """
        Retourne un résumé détaillé de l'état des documents du projet
        """
        project = self.get_object()
        documents = project.project_documents.all()
        
        status_summary = {
            'total_documents': documents.count(),
            'completed_documents': documents.filter(status='APPROVED').count(),
            'in_progress_documents': documents.filter(status='IN_PROGRESS').count(),
            'under_review_documents': documents.filter(status='UNDER_REVIEW').count(),
            'not_started_documents': documents.filter(status='NOT_STARTED').count(),
            'completion_percentage': project.get_completion_percentage(),
            'documents_by_type': {}
        }

        for doc in documents:
            doc_type = doc.document_type.get_type_display()
            if doc_type not in status_summary['documents_by_type']:
                status_summary['documents_by_type'][doc_type] = {
                    'status': doc.get_status_display(),
                    'last_updated': doc.updated_at
                }

        return Response(status_summary)

    def destroy(self, request, *args, **kwargs):
        """
        Supprime un projet après vérification du statut administrateur et du mot de passe
        """
        # Vérifier si l'utilisateur est un administrateur
        if not request.user.role == 'ADMIN':
            raise PermissionDenied("Seuls les administrateurs peuvent supprimer des projets.")

        # Récupérer le mot de passe fourni
        admin_password = request.data.get('admin_password')
        if not admin_password:
            return Response(
                {"message": "Le mot de passe administrateur est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier le mot de passe
        if not check_password(admin_password, request.user.password):
            return Response(
                {"message": "Mot de passe incorrect"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Récupérer l'instance du projet
        instance = self.get_object()

        # Vérifier si le projet peut être supprimé
        if instance.project_documents.filter(status='UNDER_REVIEW').exists():
            return Response(
                {"message": "Impossible de supprimer un projet avec des documents en cours de relecture"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Effectuer une suppression douce
        instance.soft_delete(request.user)

        return Response(
            {"message": "Projet supprimé avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )

    def perform_create(self, serializer):
        """
        Crée un nouveau projet et met à jour son statut initial
        """
        project = serializer.save()
        project.update_status()

class TechnicalReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les opérations CRUD sur les rapports techniques.
    
    list:
        Retourne la liste des rapports accessibles par l'utilisateur.
    retrieve:
        Retourne les détails d'un rapport spécifique.
    create:
        Crée un nouveau rapport.
    update:
        Met à jour un rapport existant.
    partial_update:
        Met à jour partiellement un rapport existant.
    destroy:
        Supprime un rapport.
    """
    queryset = TechnicalReport.objects.all()
    permission_classes = [permissions.IsAuthenticated, CanManageReport]
    
    def get_queryset(self):
        """
        Retourne les rapports accessibles par l'utilisateur :
        - Tous les rapports pour les administrateurs
        - Rapports des projets gérés ou membre d'équipe pour les autres
        """
        user = self.request.user
        if user.is_staff:
            return TechnicalReport.objects.all()
            
        return TechnicalReport.objects.filter(
            Q(author=user) |
            Q(project__manager=user) |
            Q(project__team_members=user) |
            Q(reviewers=user)
        ).distinct()
    
    def get_serializer_class(self):
        """
        Utilise différents sérialiseurs selon l'action :
        - Liste : version allégée
        - Détail : version complète
        """
        if self.action == 'list':
            return TechnicalReportListSerializer
        return TechnicalReportDetailSerializer
    
    def perform_create(self, serializer):
        """
        Crée un nouveau rapport en définissant automatiquement
        l'utilisateur courant comme auteur.
        """
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[CanReviewReport])
    def approve(self, request, pk=None):
        """
        Approuve un rapport technique.
        Seuls les relecteurs assignés peuvent approuver.
        """
        report = self.get_object()
        
        if report.status == 'APPROVED':
            return Response(
                {'error': 'Ce rapport est déjà approuvé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        report.status = 'APPROVED'
        report.save()
        
        return Response({'status': 'Rapport approuvé avec succès.'})
    
    @action(detail=True, methods=['post'], permission_classes=[CanReviewReport])
    def reject(self, request, pk=None):
        """
        Rejette un rapport technique.
        Seuls les relecteurs assignés peuvent rejeter.
        """
        report = self.get_object()
        
        if report.status == 'APPROVED':
            return Response(
                {'error': 'Impossible de rejeter un rapport déjà approuvé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        report.status = 'REJECTED'
        report.save()
        
        return Response({'status': 'Rapport rejeté.'})
    
    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        """
        Soumet un rapport pour relecture.
        Seul l'auteur ou le chef de projet peut soumettre.
        """
        report = self.get_object()
        
        if not report.reviewers.exists():
            return Response(
                {'error': 'Veuillez assigner au moins un relecteur avant de soumettre.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if report.status != 'DRAFT':
            return Response(
                {'error': 'Seuls les rapports en brouillon peuvent être soumis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        report.status = 'REVIEW'
        report.save()
        
        # TODO: Envoyer des notifications aux relecteurs
        
        return Response({'status': 'Rapport soumis pour relecture.'})
    
    @action(detail=False, methods=['get'])
    def my_reports(self, request):
        """
        Retourne les rapports de l'utilisateur connecté.
        """
        reports = TechnicalReport.objects.filter(author=request.user)
        page = self.paginate_queryset(reports)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def to_review(self, request):
        """
        Retourne les rapports à relire pour l'utilisateur connecté.
        """
        reports = TechnicalReport.objects.filter(
            reviewers=request.user,
            status='REVIEW'
        )
        page = self.paginate_queryset(reports)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
