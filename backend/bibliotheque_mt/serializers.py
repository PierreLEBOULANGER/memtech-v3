"""
Ce fichier définit les sérialiseurs pour l'API de la bibliothèque des Mémoires Techniques.
Les sérialiseurs permettent de convertir les objets Django en JSON (et inversement),
pour l'échange de données entre le backend et le frontend.
Chaque classe est commentée pour faciliter la compréhension par toute l'équipe.
"""

from rest_framework import serializers
from .models import Tag, Commentaire, Note, BibliothequeMemoireTechnique, BibliothequeImage
from users.models import User
import base64

# -----------------------------------------------------------------------------
# Sérialiseur : Tag
# Permet de sérialiser les tags associés aux éléments de la bibliothèque
# -----------------------------------------------------------------------------
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'nom']

# -----------------------------------------------------------------------------
# Sérialiseur : Commentaire
# Permet de sérialiser les commentaires associés aux éléments de la bibliothèque
# -----------------------------------------------------------------------------
class CommentaireSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.CharField(source='auteur.username', read_only=True)

    class Meta:
        model = Commentaire
        fields = ['id', 'auteur', 'auteur_nom', 'texte', 'date']

# -----------------------------------------------------------------------------
# Sérialiseur : Note
# Permet de sérialiser les notes attribuées aux éléments de la bibliothèque
# -----------------------------------------------------------------------------
class NoteSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.CharField(source='auteur.username', read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'auteur', 'auteur_nom', 'valeur', 'date']

# -----------------------------------------------------------------------------
# Sérialiseur principal : BibliothequeMemoireTechnique
# Permet de sérialiser les éléments de la bibliothèque des Mémoires Techniques
# avec toutes leurs relations (tags, commentaires, notes, favoris, etc.)
# -----------------------------------------------------------------------------
class BibliothequeMemoireTechniqueSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.CharField(source='auteur.username', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    commentaires = CommentaireSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    favoris = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = BibliothequeMemoireTechnique
        fields = [
            'id', 'type_document', 'categorie', 'titre', 'contenu',
            'auteur', 'auteur_nom', 'date_creation', 'date_modification',
            'tags', 'version', 'droits_acces', 'favoris', 'recent',
            'commentaires', 'notes'
        ]

    def to_representation(self, instance):
        # Pour les photos, le champ 'contenu' est toujours vide (utiliser BibliothequeImage pour l'image)
        rep = super().to_representation(instance)
        if instance.categorie == 'photo':
            rep['contenu'] = ''
        return rep

# -----------------------------------------------------------------------------
# Serializer : BibliothequeImageSerializer
# Permet de convertir le champ image_blob en base64 pour l'API (lecture uniquement via image_base64),
# et de décoder le base64 reçu en binaire pour la base de données (écriture via image_blob).
# Le champ image_blob est strictement write_only : il n'est jamais exposé en lecture.
# -----------------------------------------------------------------------------
class BibliothequeImageSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()
    image_blob = serializers.CharField(write_only=True, required=False)  # Écriture uniquement
    sous_categorie = serializers.CharField(required=False, allow_blank=True, allow_null=True)  # Lecture/écriture
    
    class Meta:
        model = BibliothequeImage
        fields = [
            'id',
            'element',
            'filename',
            'mime_type',
            'date_ajout',
            'sous_categorie',  # Ajouté pour lecture/écriture
            'image_base64',
            'image_blob',
        ]

    def get_image_base64(self, obj):
        """
        Retourne l'image encodée en base64 pour l'API (lecture).
        """
        if obj.image_blob:
            return base64.b64encode(obj.image_blob).decode('utf-8')
        return None

    def to_internal_value(self, data):
        """
        Permet de décoder le base64 reçu en binaire pour le champ image_blob (écriture).
        """
        if 'image_blob' in data and isinstance(data['image_blob'], str):
            try:
                data['image_blob'] = base64.b64decode(data['image_blob'])
            except Exception:
                raise serializers.ValidationError({'image_blob': 'Format base64 invalide.'})
        return super().to_internal_value(data) 