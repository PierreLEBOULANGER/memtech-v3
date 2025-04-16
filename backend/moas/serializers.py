"""
Sérialiseurs pour l'application moas
"""

from rest_framework import serializers
from .models import MOA, MOE

class MOASerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les MOA (Maîtres d'Ouvrage)
    """
    class Meta:
        model = MOA
        fields = ['id', 'name', 'address', 'logo']
        read_only_fields = ['id']

class MOESerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les MOE (Maîtres d'Œuvre)
    """
    class Meta:
        model = MOE
        fields = ['id', 'name', 'address', 'logo']
        read_only_fields = ['id'] 