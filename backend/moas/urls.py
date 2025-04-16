"""
Configuration des URLs pour l'application moas
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MOAViewSet, MOEViewSet

router = DefaultRouter()
router.register(r'moas', MOAViewSet)
router.register(r'moes', MOEViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 