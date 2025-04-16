"""
Modèles pour l'application moas
"""

from django.db import models

class MOA(models.Model):
    """
    Modèle pour les Maîtres d'Ouvrage (MOA)
    """
    name = models.CharField(max_length=255, verbose_name="Nom")
    address = models.TextField(verbose_name="Adresse")
    logo = models.BinaryField(null=True, blank=True, verbose_name="Logo")

    class Meta:
        verbose_name = "Maître d'ouvrage"
        verbose_name_plural = "Maîtres d'ouvrage"
        db_table = 'moa'
        managed = False

    def __str__(self):
        return self.name

class MOE(models.Model):
    """
    Modèle pour les Maîtres d'Œuvre (MOE)
    """
    name = models.CharField(max_length=255, verbose_name="Nom")
    address = models.TextField(verbose_name="Adresse")
    logo = models.BinaryField(null=True, blank=True, verbose_name="Logo")

    class Meta:
        verbose_name = "Maître d'œuvre"
        verbose_name_plural = "Maîtres d'œuvre"
        db_table = 'moe'
        managed = False

    def __str__(self):
        return self.name 