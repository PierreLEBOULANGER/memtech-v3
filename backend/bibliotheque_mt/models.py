"""
Ce fichier définit les modèles de données pour la bibliothèque des Mémoires Techniques.
Il permet de centraliser, organiser et réutiliser des éléments (textes, tableaux, images, etc.)
propres à chaque mémoire technique, avec gestion des catégories, tags, droits, versions, favoris, commentaires et notes.
Chaque classe est commentée pour faciliter la compréhension par toute l'équipe.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User

# -----------------------------------------------------------------------------
# Modèle : Tag
# Permet d'associer des mots-clés personnalisés à chaque élément de la bibliothèque
# -----------------------------------------------------------------------------
class Tag(models.Model):
    nom = models.CharField(_('Nom du tag'), max_length=50, unique=True)

    def __str__(self):
        return self.nom

# -----------------------------------------------------------------------------
# Modèle : Commentaire
# Permet d'ajouter des commentaires sur chaque élément de la bibliothèque
# -----------------------------------------------------------------------------
class Commentaire(models.Model):
    auteur = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('Auteur'))
    texte = models.TextField(_('Texte du commentaire'))
    date = models.DateTimeField(_('Date'), auto_now_add=True)

    def __str__(self):
        return f"{self.auteur} - {self.date}"

# -----------------------------------------------------------------------------
# Modèle : Note
# Permet de gérer le système de notation des éléments de la bibliothèque
# -----------------------------------------------------------------------------
class Note(models.Model):
    auteur = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('Auteur'))
    valeur = models.PositiveSmallIntegerField(_('Valeur de la note'))  # 1 à 5 par exemple
    date = models.DateTimeField(_('Date'), auto_now_add=True)

    def __str__(self):
        return f"{self.auteur} - {self.valeur}"

# -----------------------------------------------------------------------------
# Modèle principal : BibliothequeMemoireTechnique
# Représente un élément réutilisable de la bibliothèque des Mémoires Techniques
# -----------------------------------------------------------------------------
class BibliothequeMemoireTechnique(models.Model):
    """
    Modèle principal pour la bibliothèque des Mémoires Techniques.
    Permet de stocker, organiser et réutiliser des contenus (textes, tableaux, images, etc.)
    avec gestion des catégories, tags, droits, versions, favoris, commentaires et notes.
    """
    TYPE_CATEGORIES = [
        ('texte', _('Texte')),
        ('tableau', _('Tableau')),
        ('photo', _('Photo')),
        ('document_technique', _('Document technique')),
        ('signalisation', _('Signalisation')),
        ('procedure', _('Procédure')),
        ('fiche_technique', _('Fiche technique')),
    ]

    SOUS_CATEGORIES = [
        ('chantier', _('Photos de chantier')),
        ('equipement', _('Équipements')),
        ('installation', _('Installations')),
        ('documentation', _('Documentation')),
    ]

    type_document = models.CharField(_('Type de document'), max_length=50, default='Mémoire Technique')
    categorie = models.CharField(_('Catégorie'), max_length=50, choices=TYPE_CATEGORIES)
    sous_categorie = models.CharField(_('Sous-catégorie'), max_length=50, choices=SOUS_CATEGORIES, null=True, blank=True)
    titre = models.CharField(_('Titre'), max_length=200)
    # Champ 'contenu' utilisé uniquement pour les textes, tableaux, etc. (jamais pour les images)
    contenu = models.TextField(_('Contenu'), blank=True, null=True)
    auteur = models.ForeignKey(User, on_delete=models.PROTECT, related_name='elements_bibliotheque_mt', verbose_name=_('Auteur'))
    date_creation = models.DateTimeField(_('Date de création'), auto_now_add=True)
    date_modification = models.DateTimeField(_('Date de modification'), auto_now=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name='elements_bibliotheque_mt', verbose_name=_('Tags'))
    version = models.PositiveIntegerField(_('Version'), default=1)
    droits_acces = models.CharField(_('Droits d\'accès'), max_length=200, default='admin,editeur')  # À adapter selon la gestion des droits
    favoris = models.ManyToManyField(User, blank=True, related_name='favoris_bibliotheque_mt', verbose_name=_('Favoris'))
    recent = models.DateTimeField(_('Dernier accès'), null=True, blank=True)
    commentaires = models.ManyToManyField(Commentaire, blank=True, related_name='element_bibliotheque_mt', verbose_name=_('Commentaires'))
    notes = models.ManyToManyField(Note, blank=True, related_name='element_bibliotheque_mt', verbose_name=_('Notes'))

    class Meta:
        verbose_name = _('élément de bibliothèque Mémoire Technique')
        verbose_name_plural = _('éléments de bibliothèque Mémoire Technique')
        ordering = ['-date_modification']

    def __str__(self):
        return f"{self.titre} ({self.categorie})"

# -----------------------------------------------------------------------------
# Modèle : BibliothequeImage
# Table dédiée au stockage des images en BLOB pour la bibliothèque
# Chaque image est liée à un élément de la bibliothèque (optionnel)
# -----------------------------------------------------------------------------
class BibliothequeImage(models.Model):
    """
    Ce modèle permet de stocker une image en BLOB (binaire) dans la base de données.
    Il contient également des métadonnées utiles et un lien optionnel vers un élément de la bibliothèque.
    Le champ 'sous_categorie' permet de classer les images (ex : chantier, équipement, etc.).
    """
    SOUS_CATEGORIES = [
        ('chantier', _('Photos de chantier')),
        ('equipement', _('Équipements')),
        ('installation', _('Installations')),
        ('documentation', _('Documentation')),
    ]
    element = models.ForeignKey(
        'BibliothequeMemoireTechnique',
        on_delete=models.CASCADE,
        related_name='images',
        null=True, blank=True,
        verbose_name=_('Élément de bibliothèque associé')
    )
    filename = models.CharField(_('Nom du fichier'), max_length=255)
    mime_type = models.CharField(_('Type MIME'), max_length=50)
    image_blob = models.BinaryField(_('Image (BLOB)'), blank=False, null=False)
    date_ajout = models.DateTimeField(_('Date d\'ajout'), auto_now_add=True)
    # Champ sous-catégorie avec choix fixes
    sous_categorie = models.CharField(_('Sous-catégorie'), max_length=50, choices=SOUS_CATEGORIES, null=True, blank=True)

    def __str__(self):
        return f"Image {self.filename} (élément: {self.element_id})"
