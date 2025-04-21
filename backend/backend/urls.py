"""
Configuration des URLs pour le projet MemTech
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
    TokenBlacklistView
)
from users.views import CustomTokenObtainPairView, UserViewSet
from moas.views import MOAViewSet, MOEViewSet

# Création du routeur pour l'API
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'moas', MOAViewSet, basename='moa')
router.register(r'moes', MOEViewSet, basename='moe')

# URLs pour les projets
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # URLs d'authentification
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    
    # URLs de l'API
    path('api/', include(router.urls)),
    path('api/', include('projects.urls')),  # Inclut toutes les routes de projets
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 