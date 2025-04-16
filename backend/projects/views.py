"""
Vues pour l'application projects.
Gère les endpoints API pour les projets et les rapports techniques.
"""

from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Project, TechnicalReport
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer,
    TechnicalReportListSerializer, TechnicalReportDetailSerializer
)
from .permissions import (
    IsProjectManagerOrReadOnly, IsProjectTeamMember,
    CanManageReport, CanReviewReport
)
from django.contrib.auth.models import User
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les opérations CRUD sur les projets.
    
    list:
        Retourne la liste des projets accessibles par l'utilisateur.
    retrieve:
        Retourne les détails d'un projet spécifique.
    create:
        Crée un nouveau projet.
    update:
        Met à jour un projet existant.
    partial_update:
        Met à jour partiellement un projet existant.
    destroy:
        Supprime un projet.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Retourne les projets accessibles par l'utilisateur.
        """
        return Project.objects.all()

    def get_serializer_class(self):
        """
        Utilise différents sérialiseurs selon l'action :
        - Liste : version allégée
        - Détail : version complète
        """
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectDetailSerializer
    
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
