from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    """
    Manager personnalisé pour le modèle User.
    Gère la création d'utilisateurs et de superutilisateurs.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('L\'adresse email est obligatoire')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('first_name', 'Admin')
        extra_fields.setdefault('last_name', 'System')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superutilisateur doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superutilisateur doit avoir is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    """
    Modèle utilisateur personnalisé pour MemTech.
    Étend le modèle User de base de Django pour ajouter des champs spécifiques à l'application.
    """
    
    # Choix possibles pour le rôle de l'utilisateur
    ROLE_CHOICES = [
        ('ADMIN', 'Administrateur'),
        ('WRITER', 'Rédacteur'),
        ('REVIEWER', 'Relecteur'),
    ]
    
    # Champs personnalisés
    username = None  # Désactive le champ username
    email = models.EmailField('Email', unique=True)  # Email sera utilisé comme identifiant
    role = models.CharField('Rôle', max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField('Téléphone', max_length=15, blank=True)
    department = models.CharField('Service', max_length=100, blank=True)
    password_reset_token = models.CharField(max_length=100, null=True, blank=True)
    
    # Configuration
    USERNAME_FIELD = 'email'  # Utilise l'email comme identifiant au lieu du username
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']
    
    # Utilisation du manager personnalisé
    objects = UserManager()
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        
    def __str__(self):
        """Représentation textuelle de l'utilisateur"""
        return f"{self.get_full_name()} ({self.email})"
        
    @property
    def full_name(self):
        """Retourne le nom complet de l'utilisateur"""
        return f"{self.first_name} {self.last_name}"

    @property
    def name(self):
        """Retourne le nom complet de l'utilisateur pour l'admin Django"""
        return self.full_name
