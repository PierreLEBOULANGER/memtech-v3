"""
Ce fichier contient les modèles de données pour la gestion des projets et des rapports techniques.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from users.models import User

class Project(models.Model):
    """
    Modèle représentant un projet dans l'application.
    Permet de gérer les informations principales d'un projet et son équipe.
    """
    name = models.CharField(_('Nom'), max_length=200)
    client = models.CharField(_('Client'), max_length=200)
    description = models.TextField(_('Description'))
    start_date = models.DateField(_('Date de début'))
    end_date = models.DateField(_('Date de fin'), null=True, blank=True)
    manager = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='managed_projects',
        verbose_name=_('Chef de projet')
    )
    team_members = models.ManyToManyField(
        User,
        related_name='project_memberships',
        verbose_name=_('Membres de l\'équipe')
    )
    status = models.CharField(
        _('Statut'),
        max_length=20,
        choices=[
            ('DRAFT', _('Brouillon')),
            ('ACTIVE', _('Actif')),
            ('ON_HOLD', _('En pause')),
            ('COMPLETED', _('Terminé')),
            ('CANCELLED', _('Annulé')),
        ],
        default='DRAFT'
    )
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('projet')
        verbose_name_plural = _('projets')
        ordering = ['-created_at']

    def __str__(self):
        return self.name

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
