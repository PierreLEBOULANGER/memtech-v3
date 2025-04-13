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
    permission_classes = [permissions.IsAuthenticated, IsProjectManagerOrReadOnly]
    
    def get_queryset(self):
        """
        Retourne les projets accessibles par l'utilisateur.
        """
        user = self.request.user
        logger.debug(f"Récupération des projets pour l'utilisateur {user.username}")
        
        if user.is_staff:
            logger.debug("Utilisateur admin : retourne tous les projets")
            return Project.objects.all()
            
        projects = Project.objects.filter(
            Q(manager=user) | Q(team_members=user)
        ).distinct()
        logger.debug(f"Nombre de projets trouvés : {projects.count()}")
        return projects

    def list(self, request, *args, **kwargs):
        """
        Liste les projets avec des logs détaillés.
        """
        logger.debug("Appel de la méthode list des projets")
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        logger.debug(f"Nombre de projets sérialisés : {len(serializer.data)}")
        return Response(serializer.data)
    
    def get_serializer_class(self):
        """
        Utilise différents sérialiseurs selon l'action :
        - Liste : version allégée
        - Détail : version complète
        """
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectDetailSerializer
    
    def perform_create(self, serializer):
        """
        Crée un nouveau projet en définissant automatiquement
        l'utilisateur courant comme manager si non spécifié.
        """
        if not serializer.validated_data.get('manager'):
            serializer.save(manager=self.request.user)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def add_team_member(self, request, pk=None):
        """
        Ajoute un membre à l'équipe du projet.
        """
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'L\'ID de l\'utilisateur est requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(id=user_id)
            project.team_members.add(user)
            return Response({'status': 'Membre ajouté avec succès.'})
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilisateur non trouvé.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_team_member(self, request, pk=None):
        """
        Retire un membre de l'équipe du projet.
        """
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'L\'ID de l\'utilisateur est requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(id=user_id)
            if user == project.manager:
                return Response(
                    {'error': 'Impossible de retirer le chef de projet.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            project.team_members.remove(user)
            return Response({'status': 'Membre retiré avec succès.'})
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilisateur non trouvé.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
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
            },
            'team_size': project.team_members.count(),
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
