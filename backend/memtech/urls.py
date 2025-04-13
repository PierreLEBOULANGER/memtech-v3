"""
Configuration des URLs pour le projet MemTech
Gère les routes principales de l'application et inclut les routes de l'API
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from users.views import CustomTokenObtainPairView, UserViewSet
from projects.views import ProjectViewSet, TechnicalReportViewSet

# Création du routeur pour l'API
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'reports', TechnicalReportViewSet, basename='report')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # URLs d'authentification
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # URLs de l'API
    path('api/', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 