"""
Vues pour l'application moas
"""

from rest_framework import viewsets
from .models import MOA, MOE
from .serializers import MOASerializer, MOESerializer

class MOAViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les MOA (Maîtres d'Ouvrage)
    """
    queryset = MOA.objects.all()
    serializer_class = MOASerializer

class MOEViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les MOE (Maîtres d'Œuvre)
    """
    queryset = MOE.objects.all()
    serializer_class = MOESerializer 