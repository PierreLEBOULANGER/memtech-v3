"""
Configuration des URLs pour l'application core
Définit toutes les routes de l'API
"""
from django.urls import path
from . import views

urlpatterns = [
    # Route d'authentification
    path('auth/login/', views.login_view, name='api-login'),
    path('auth/logout/', views.logout_view, name='api-logout'),
    path('auth/verify/', views.verify_token, name='api-verify-token'),
] 