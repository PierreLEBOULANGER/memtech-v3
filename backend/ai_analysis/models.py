"""
models.py
Modèles pour l'application d'analyse IA
"""

from django.db import models
from django.utils.translation import gettext_lazy as _

class RCAnalysis(models.Model):
    """
    Modèle pour stocker les analyses de RC
    """
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='rc_analyses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    analysis_data = models.JSONField()
    summary_data = models.JSONField()

    class Meta:
        verbose_name = _('analyse de RC')
        verbose_name_plural = _('analyses de RC')
        ordering = ['-created_at']

    def __str__(self):
        return f"Analyse RC - {self.project.name} ({self.created_at})" 