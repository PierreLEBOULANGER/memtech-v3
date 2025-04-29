"""
Ce fichier contient les modèles de données pour la gestion des projets et des rapports techniques.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from users.models import User
from django.contrib.auth import get_user_model
from django.utils import timezone
import os
import shutil
import logging
from moas.models import MOA, MOE

logger = logging.getLogger(__name__)

User = get_user_model()

def reference_document_path(instance, filename):
    """
    Génère le chemin de stockage pour un document de référence.
    Le fichier sera stocké dans : media/projects/<project_id>/reference_documents/<filename>
    """
    return f'projects/{instance.project.id}/reference_documents/{filename}'

def get_project_media_path(project_id):
    """
    Retourne le chemin complet du dossier média d'un projet
    """
    return os.path.join(settings.MEDIA_ROOT, 'projects', str(project_id))

class ReferenceDocument(models.Model):
    """
    Modèle représentant un document de référence (RC ou CCTP)
    """
    DOCUMENT_TYPES = [
        ('RC', _('Règlement de Consultation')),
        ('CCTP', _('Cahier des Clauses Techniques Particulières')),
    ]

    type = models.CharField(_('Type'), max_length=10, choices=DOCUMENT_TYPES)
    file = models.FileField(_('Fichier'), upload_to=reference_document_path)
    uploaded_at = models.DateTimeField(_('Date d\'upload'), auto_now_add=True)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='reference_documents')

    class Meta:
        verbose_name = _('document de référence')
        verbose_name_plural = _('documents de référence')
        unique_together = ['project', 'type']

    def __str__(self):
        return f"{self.get_type_display()} - {self.project.name}"

    def delete_file(self):
        """
        Supprime le fichier physique associé au document
        """
        if self.file:
            if os.path.isfile(self.file.path):
                try:
                    os.remove(self.file.path)
                    logger.info(f"Fichier supprimé : {self.file.path}")
                except Exception as e:
                    logger.error(f"Erreur lors de la suppression du fichier {self.file.path}: {str(e)}")

class DocumentType(models.Model):
    """
    Modèle représentant un type de document technique
    """
    DOCUMENT_TYPES = [
        ('MEMO_TECHNIQUE', _('Mémoire technique')),
        ('SOGED', _('SOGED')),
        ('SOPAQ', _('SOPAQ')),
        ('SOPRE', _('SOPRE')),
        ('PPSPS', _('PPSPS')),
        ('PAQ', _('PAQ')),
    ]

    type = models.CharField(_('Type'), max_length=20, choices=DOCUMENT_TYPES, unique=True)
    description = models.TextField(_('Description'))
    is_mandatory = models.BooleanField(_('Obligatoire'), default=False)

    class Meta:
        verbose_name = _('type de document')
        verbose_name_plural = _('types de documents')

    def __str__(self):
        return self.get_type_display()

class Project(models.Model):
    """
    Modèle représentant un projet dans l'application.
    """
    name = models.CharField(_('Nom'), max_length=200)
    offer_delivery_date = models.DateField(_('Date de remise de l\'offre'), null=True)
    maitre_ouvrage = models.ForeignKey(
        MOA,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Maître d\'ouvrage'),
        related_name='projects_as_moa'
    )
    maitre_oeuvre = models.ForeignKey(
        MOE,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Maître d\'œuvre'),
        related_name='projects_as_moe'
    )
    required_documents = models.ManyToManyField(
        DocumentType,
        through='ProjectDocument',
        verbose_name=_('Documents requis')
    )
    status = models.CharField(
        _('Statut'),
        max_length=20,
        choices=[
            ('PENDING', _('En attente')),
            ('IN_PROGRESS', _('En cours')),
            ('COMPLETED', _('Terminé')),
            ('CANCELLED', _('Annulé')),
        ],
        default='PENDING'
    )
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    # Champs pour le suivi des suppressions
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_projects'
    )

    class Meta:
        verbose_name = _('projet')
        verbose_name_plural = _('projets')
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def get_completion_percentage(self):
        """
        Calcule le pourcentage de complétion du projet basé sur l'état des documents
        """
        total_docs = self.project_documents.count()
        if total_docs == 0:
            return 0
        completed_docs = self.project_documents.filter(status='APPROVED').count()
        return (completed_docs / total_docs) * 100

    def update_status(self):
        """
        Met à jour le statut du projet en fonction de l'état des documents
        """
        total_docs = self.project_documents.count()
        
        if total_docs == 0:
            # Si aucun document n'est requis, le projet est considéré comme terminé
            self.status = 'COMPLETED'
        else:
            completed_docs = self.project_documents.filter(status='APPROVED').count()
            in_progress_docs = self.project_documents.filter(status__in=['DRAFT', 'REVIEW_1', 'CORRECTION', 'REVIEW_2', 'VALIDATION']).count()
            
            if completed_docs == total_docs:
                self.status = 'COMPLETED'
            elif in_progress_docs > 0:
                self.status = 'IN_PROGRESS'
            else:
                self.status = 'PENDING'
        
        self.save()

    def soft_delete(self, user):
        """
        Effectue une suppression douce du projet et nettoie les fichiers associés
        """
        try:
            # 1. Supprimer les fichiers des documents de référence
            for doc in self.reference_documents.all():
                doc.delete_file()

            # 2. Supprimer le dossier du projet s'il existe
            project_dir = get_project_media_path(self.id)
            if os.path.exists(project_dir):
                try:
                    shutil.rmtree(project_dir)
                    logger.info(f"Dossier du projet supprimé : {project_dir}")
                except Exception as e:
                    logger.error(f"Erreur lors de la suppression du dossier {project_dir}: {str(e)}")

            # 3. Marquer le projet comme supprimé
            self.deleted_at = timezone.now()
            self.deleted_by = user
            self.save()
            
            logger.info(f"Projet {self.id} supprimé avec succès par {user}")

        except Exception as e:
            logger.error(f"Erreur lors de la suppression du projet {self.id}: {str(e)}")
            raise

    @property
    def is_deleted(self):
        """
        Vérifie si le projet a été supprimé
        """
        return self.deleted_at is not None

class ProjectDocument(models.Model):
    """
    Table de liaison entre Project et DocumentType avec statut et métadonnées
    """
    # Choix pour le statut du document
    STATUS_CHOICES = [
        ('DRAFT', _('En rédaction')),
        ('REVIEW_1', _('Première relecture')),
        ('CORRECTION', _('En correction')),
        ('REVIEW_2', _('Deuxième relecture')),
        ('VALIDATION', _('En validation finale')),
        ('APPROVED', _('Validé'))
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_documents')
    document_type = models.ForeignKey(DocumentType, on_delete=models.PROTECT)
    status = models.CharField(
        _('Statut'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    content = models.TextField(_('Contenu'), blank=True)
    
    # Champs pour les rôles
    writer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='documents_to_write',
        null=True,
        verbose_name=_('Rédacteur')
    )
    reviewer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='documents_to_review',
        null=True,
        verbose_name=_('Relecteur')
    )
    
    # Champs pour le suivi
    comments = models.JSONField(_('Commentaires'), default=list, blank=True)
    status_history = models.JSONField(_('Historique des statuts'), default=list, blank=True)
    completion_percentage = models.FloatField(_('Pourcentage de complétion'), default=0)
    review_cycle = models.IntegerField(_('Cycle de relecture'), default=1)
    needs_correction = models.BooleanField(_('Nécessite des corrections'), default=False)
    last_notification_sent = models.DateTimeField(_('Dernière notification'), null=True, blank=True)
    
    # Champs de dates
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('document du projet')
        verbose_name_plural = _('documents du projet')
        unique_together = ['project', 'document_type']

    def __str__(self):
        return f"{self.document_type.get_type_display()} - {self.project.name}"

    def update_status(self, new_status, user):
        """
        Met à jour le statut du document et enregistre l'historique
        """
        old_status = self.status
        self.status = new_status
        
        # Ajouter à l'historique
        self.status_history.append({
            'from_status': old_status,
            'to_status': new_status,
            'user': user.id,
            'timestamp': timezone.now().isoformat()
        })
        
        # Mettre à jour le pourcentage de complétion
        self.update_completion_percentage()
        
        # Mettre à jour le statut du projet
        self.project.update_status()
        
        self.save()

    def update_completion_percentage(self):
        """
        Calcule et met à jour le pourcentage de complétion du document
        """
        status_weights = {
            'DRAFT': 0.45,
            'REVIEW_1': 0.30,
            'CORRECTION': 0.20,
            'REVIEW_2': 0,
            'VALIDATION': 0.05,
            'APPROVED': 1.0
        }
        
        self.completion_percentage = status_weights.get(self.status, 0) * 100
        self.save()

    def add_comment(self, user, content, requires_correction=False):
        """
        Ajoute un commentaire au document
        """
        comment = {
            'user': user.id,
            'content': content,
            'requires_correction': requires_correction,
            'timestamp': timezone.now().isoformat(),
            'resolved': False
        }
        
        self.comments.append(comment)
        if requires_correction:
            self.needs_correction = True
        
        self.save()

class DocumentComment(models.Model):
    """
    Modèle pour les commentaires sur les documents
    """
    document = models.ForeignKey(
        ProjectDocument,
        on_delete=models.CASCADE,
        related_name='document_comments',
        verbose_name=_('Document')
    )
    author = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='document_comments',
        verbose_name=_('Auteur')
    )
    content = models.TextField(_('Contenu'))
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    review_cycle = models.IntegerField(_('Cycle de relecture'), default=1)
    requires_correction = models.BooleanField(_('Nécessite des corrections'), default=False)
    resolved = models.BooleanField(_('Résolu'), default=False)

    class Meta:
        verbose_name = _('commentaire de document')
        verbose_name_plural = _('commentaires de document')
        ordering = ['-created_at']

    def __str__(self):
        return f"Commentaire de {self.author.get_full_name()} sur {self.document}"

    def resolve(self):
        """
        Marque le commentaire comme résolu
        """
        self.resolved = True
        self.save()

class TechnicalReport(models.Model):
    """
    Modèle représentant un rapport technique lié à un projet.
    Permet de documenter les aspects techniques et les décisions importantes.
    """
    title = models.CharField(_('Titre'), max_length=200)
    content = models.TextField(_('Contenu'))
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='technical_reports',
        verbose_name=_('Projet')
    )
    author = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='authored_reports',
        verbose_name=_('Auteur')
    )
    reviewers = models.ManyToManyField(
        User,
        related_name='reports_to_review',
        verbose_name=_('Réviseurs')
    )
    status = models.CharField(
        _('Statut'),
        max_length=20,
        choices=[
            ('DRAFT', _('Brouillon')),
            ('UNDER_REVIEW', _('En révision')),
            ('APPROVED', _('Approuvé')),
            ('REJECTED', _('Rejeté')),
        ],
        default='DRAFT'
    )
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('rapport technique')
        verbose_name_plural = _('rapports techniques')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.project.name}"
