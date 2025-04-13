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