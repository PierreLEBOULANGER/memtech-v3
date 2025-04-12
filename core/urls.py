from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .auth import CustomTokenObtainPairView

# Création du routeur pour l'API
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'templates', views.TemplateViewSet)
router.register(r'projets', views.ProjetViewSet)
router.register(r'sections', views.SectionViewSet)
router.register(r'contenus', views.ContenuReutilisableViewSet)
router.register(r'generations-ia', views.GenerationIAViewSet)

# Configuration des URLs de l'API
urlpatterns = [
    path('api/', include(router.urls)),
    # URLs d'authentification
    path('api/auth/register/', views.RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/profile/', views.ProfileView.as_view(), name='user_profile'),
    path('api/auth/change-password/', views.change_password, name='change_password'),
] 