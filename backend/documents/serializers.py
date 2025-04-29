"""
Ce fichier définit les sérialiseurs pour les documents.
Les sérialiseurs permettent de convertir les objets Document en JSON et vice-versa.
"""

from rest_framework import serializers
from .models import Document
from users.serializers import UserSerializer

class DocumentSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Document.
    Inclut tous les champs du modèle et ajoute des champs calculés.
    """
    
    # Champs en lecture seule
    uploader = UserSerializer(read_only=True)
    upload_date = serializers.DateTimeField(read_only=True)
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'name', 'file', 'description', 'category', 
            'status', 'project', 'uploader', 'upload_date',
            'file_size'
        ]
        
    def get_file_size(self, obj):
        """
        Calcule la taille du fichier en octets.
        """
        try:
            return obj.file.size
        except:
            return 0

    def to_representation(self, instance):
        """
        Personnalise la représentation du document en ajoutant l'URL du fichier.
        """
        representation = super().to_representation(instance)
        if instance.file:
            representation['file_url'] = instance.file.url
        return representation

    def validate_status(self, value):
        """
        Valide que le statut est l'une des valeurs autorisées.
        """
        valid_statuses = [choice[0] for choice in Document.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Statut invalide. Les statuts valides sont : {', '.join(valid_statuses)}")
        return value 