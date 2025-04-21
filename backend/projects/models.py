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
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_documents')
    document_type = models.ForeignKey(DocumentType, on_delete=models.PROTECT)
    status = models.CharField(
        _('Statut'),
        max_length=20,
        choices=[
            ('NOT_STARTED', _('Non commencé')),
            ('IN_PROGRESS', _('En cours de rédaction')),
            ('UNDER_REVIEW', _('En relecture')),
            ('IN_CORRECTION', _('En correction')),
            ('APPROVED', _('Validé')),
        ],
        default='NOT_STARTED'
    )
    content = models.TextField(_('Contenu'), blank=True)
    author = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='authored_documents',
        null=True
    )
    reviewers = models.ManyToManyField(
        User,
        related_name='documents_to_review',
        blank=True
    )
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('document du projet')
        verbose_name_plural = _('documents du projet')
        unique_together = ['project', 'document_type']

    def __str__(self):
        return f"{self.document_type.get_type_display()} - {self.project.name}"

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
