from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserCreateSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer, CustomTokenObtainPairSerializer
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.crypto import get_random_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vue personnalisée pour l'obtention des tokens JWT.
    Utilise le sérialiseur personnalisé pour inclure les informations de l'utilisateur.
    """
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les opérations liées aux utilisateurs.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        Définit les permissions en fonction de l'action.
        Les routes de réinitialisation de mot de passe sont publiques.
        """
        if self.action in ['request_password_reset', 'reset_password_confirm', 'create']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """
        Retourne le serializer approprié en fonction de l'action.
        """
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action == 'request_password_reset':
            return PasswordResetRequestSerializer
        elif self.action == 'reset_password_confirm':
            return PasswordResetConfirmSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Endpoint pour obtenir les informations de l'utilisateur connecté"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Endpoint pour changer le mot de passe"""
        user = request.user
        if not user.check_password(request.data.get('old_password')):
            return Response(
                {'error': 'Ancien mot de passe incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(request.data.get('new_password'))
        user.save()
        return Response({'status': 'Mot de passe modifié avec succès'})

    @action(detail=False, methods=['post'], url_path='reset-password')
    def request_password_reset(self, request):
        logger.info("Début de la demande de réinitialisation de mot de passe")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            logger.info(f"Email reçu : {email}")
            try:
                user = User.objects.get(email=email)
                token = get_random_string(64)
                user.password_reset_token = token
                user.save()

                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
                reset_url = f"{frontend_url}/reset-password?token={token}"
                logger.info(f"URL de réinitialisation : {reset_url}")

                context = {
                    'user': user,
                    'reset_url': reset_url
                }

                html_message = render_to_string('users/password_reset_email.html', context)
                plain_message = strip_tags(html_message)

                logger.info("Tentative d'envoi de l'email")
                send_mail(
                    'Réinitialisation de votre mot de passe MemTech',
                    plain_message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    html_message=html_message,
                )
                logger.info("Email envoyé avec succès")
                return Response({
                    'message': 'Les instructions de réinitialisation ont été envoyées à votre adresse email.'
                })
            except User.DoesNotExist:
                logger.warning(f"Utilisateur non trouvé pour l'email : {email}")
                return Response({
                    'message': 'Si cette adresse email est associée à un compte, vous recevrez les instructions de réinitialisation.'
                })
            except Exception as e:
                logger.error(f"Erreur lors de l'envoi de l'email : {str(e)}")
                return Response({
                    'error': 'Une erreur est survenue lors de l\'envoi de l\'email.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        logger.error(f"Erreurs de validation : {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='reset-password-confirm')
    def reset_password_confirm(self, request):
        """
        Gère la confirmation de réinitialisation de mot de passe.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            try:
                user = User.objects.get(password_reset_token=token)
                user.set_password(new_password)
                user.password_reset_token = None
                user.save()
                return Response({
                    'message': 'Votre mot de passe a été réinitialisé avec succès.'
                })
            except User.DoesNotExist:
                return Response({
                    'error': 'Token invalide ou expiré.'
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
