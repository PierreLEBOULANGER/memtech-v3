"""
Ce fichier définit le modèle de données pour les documents.
Il spécifie la structure de la table documents dans la base de données.
"""

from django.db import models
from django.conf import settings
from projects.models import Project

class Document(models.Model):
    """
    Modèle représentant un document dans le système.
    Stocke les informations relatives aux documents uploadés.
    """
    
    # Choix pour le statut du document
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('pending', 'En attente de validation'),
        ('validated', 'Validé'),
        ('rejected', 'Rejeté')
    ]
    
    # Choix pour la catégorie du document
    CATEGORY_CHOICES = [
        ('administrative', 'Document administratif'),
        ('technical', 'Document technique'),
        ('financial', 'Document financier'),
        ('other', 'Autre')
    ]
    
    # Champs du modèle
    name = models.CharField(max_length=255, verbose_name="Nom du document")
    file = models.FileField(upload_to='documents/', verbose_name="Fichier")
    description = models.TextField(blank=True, verbose_name="Description")
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='other',
        verbose_name="Catégorie"
    )
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name="Statut"
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="Projet associé"
    )
    uploader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents',
        verbose_name="Utilisateur ayant uploadé"
    )
    upload_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'upload"
    )
    
    class Meta:
        ordering = ['-upload_date']
        verbose_name = "Document"
        verbose_name_plural = "Documents"
    
    def __str__(self):
        return f"{self.name} ({self.project.name})"
