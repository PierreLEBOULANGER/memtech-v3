"""
Ce fichier contient les modèles de données principaux de l'application Memtech.
Les modèles sont organisés par fonctionnalité métier.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User

class TechnicalMemo(models.Model):
    """
    Modèle représentant un mémo technique dans l'application.
    Permet de documenter les notes et observations techniques rapides.
    """
    title = models.CharField(_('Titre'), max_length=200)
    content = models.TextField(_('Contenu'))
    author = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='authored_memos',
        verbose_name=_('Auteur')
    )
    status = models.CharField(
        _('Statut'),
        max_length=20,
        choices=[
            ('DRAFT', _('Brouillon')),
            ('PUBLISHED', _('Publié')),
            ('ARCHIVED', _('Archivé')),
        ],
        default='DRAFT'
    )
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('mémo technique')
        verbose_name_plural = _('mémos techniques')
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class Template(models.Model):
    """
    Modèle représentant un template de mise en page
    """
    nom = models.CharField(_('Nom'), max_length=200)
    description = models.TextField(_('Description'))
    contenu = models.TextField(_('Contenu'))
    date_creation = models.DateTimeField(_('Date de création'), auto_now_add=True)
    date_modification = models.DateTimeField(_('Date de modification'), auto_now=True)

    class Meta:
        verbose_name = _('template')
        verbose_name_plural = _('templates')
        ordering = ['-date_modification']

    def __str__(self):
        return self.nom

class Projet(models.Model):
    """
    Modèle représentant un projet (mémoire technique)
    """
    titre = models.CharField(_('Titre'), max_length=200)
    description = models.TextField(_('Description'))
    auteur = models.ForeignKey(User, on_delete=models.PROTECT, related_name='projets', verbose_name=_('Auteur'))
    statut = models.CharField(
        _('Statut'),
        max_length=20,
        choices=[
            ('DRAFT', _('Brouillon')),
            ('PUBLISHED', _('Publié')),
            ('ARCHIVED', _('Archivé')),
        ],
        default='DRAFT'
    )
    version = models.CharField(_('Version'), max_length=50)
    date_creation = models.DateTimeField(_('Date de création'), auto_now_add=True)
    date_modification = models.DateTimeField(_('Date de modification'), auto_now=True)

    class Meta:
        verbose_name = _('projet')
        verbose_name_plural = _('projets')
        ordering = ['-date_modification']

    def __str__(self):
        return self.titre

class Section(models.Model):
    """
    Modèle représentant une section de mémoire
    """
    titre = models.CharField(_('Titre'), max_length=200)
    contenu = models.TextField(_('Contenu'))
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='sections', verbose_name=_('Projet'))
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='sous_sections', verbose_name=_('Section parente'))
    ordre = models.IntegerField(_('Ordre'))
    date_creation = models.DateTimeField(_('Date de création'), auto_now_add=True)
    date_modification = models.DateTimeField(_('Date de modification'), auto_now=True)

    class Meta:
        verbose_name = _('section')
        verbose_name_plural = _('sections')
        ordering = ['projet', 'ordre']

    def __str__(self):
        return f"{self.projet.titre} - {self.titre}"

class ContenuReutilisable(models.Model):
    """
    Modèle représentant un contenu réutilisable
    """
    titre = models.CharField(_('Titre'), max_length=200)
    contenu = models.TextField(_('Contenu'))
    type = models.CharField(_('Type'), max_length=50)
    theme = models.CharField(_('Thème'), max_length=50)
    auteur = models.ForeignKey(User, on_delete=models.PROTECT, related_name='contenus', verbose_name=_('Auteur'))
    date_creation = models.DateTimeField(_('Date de création'), auto_now_add=True)
    date_modification = models.DateTimeField(_('Date de modification'), auto_now=True)

    class Meta:
        verbose_name = _('contenu réutilisable')
        verbose_name_plural = _('contenus réutilisables')
        ordering = ['-date_modification']

    def __str__(self):
        return self.titre

class GenerationIA(models.Model):
    """
    Modèle représentant une génération IA
    """
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='generations', verbose_name=_('Projet'))
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='generations', verbose_name=_('Section'))
    auteur = models.ForeignKey(User, on_delete=models.PROTECT, related_name='generations', verbose_name=_('Auteur'))
    prompt = models.TextField(_('Prompt'))
    contenu_genere = models.TextField(_('Contenu généré'))
    date_generation = models.DateTimeField(_('Date de génération'), auto_now_add=True)

    class Meta:
        verbose_name = _('génération IA')
        verbose_name_plural = _('générations IA')
        ordering = ['-date_generation']

    def __str__(self):
        return f"Génération pour {self.projet.titre} - {self.section.titre}" 