"""
Ce fichier définit les routes (endpoints) de l'API pour la bibliothèque des Mémoires Techniques.
Il permet d'accéder aux différentes ressources (éléments, tags, commentaires, notes)
via des URLs RESTful, grâce au routeur de Django REST Framework.
Chaque section est commentée pour faciliter la compréhension par toute l'équipe.
"""

from rest_framework.routers import DefaultRouter
from .views import (
    TagViewSet,
    CommentaireViewSet,
    NoteViewSet,
    BibliothequeMemoireTechniqueViewSet,
    BibliothequeImageViewSet
)

# -----------------------------------------------------------------------------
# Création du routeur principal pour l'app
# -----------------------------------------------------------------------------
router = DefaultRouter()

# -----------------------------------------------------------------------------
# Enregistrement des ViewSets auprès du routeur
# Chaque ressource est accessible via une URL dédiée
# -----------------------------------------------------------------------------
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'commentaires', CommentaireViewSet, basename='commentaire')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'elements', BibliothequeMemoireTechniqueViewSet, basename='element-bibliotheque-mt')
router.register(r'images', BibliothequeImageViewSet, basename='bibliotheque-image')

# -----------------------------------------------------------------------------
# Les URLs générées par le routeur seront incluses dans le routeur principal du projet
# -----------------------------------------------------------------------------
urlpatterns = router.urls 