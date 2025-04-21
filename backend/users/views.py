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
    ViewSet pour gérer les opérations CRUD sur les utilisateurs.
    
    Ce ViewSet fournit les fonctionnalités suivantes :
    - Liste des utilisateurs
    - Création d'un utilisateur
    - Détails d'un utilisateur
    - Mise à jour d'un utilisateur
    - Suppression d'un utilisateur
    - Réinitialisation de mot de passe
    - Changement de mot de passe
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        Définit les permissions en fonction de l'action.
        
        Returns:
            list: Liste des permissions à appliquer
            
        Notes:
            - Les routes de réinitialisation de mot de passe sont publiques
            - La création d'utilisateur est publique
            - Les autres actions nécessitent une authentification
        """
        if self.action in ['request_password_reset', 'reset_password_confirm', 'create']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """
        Retourne le serializer approprié en fonction de l'action.
        
        Returns:
            class: La classe du serializer à utiliser
            
        Notes:
            - UserCreateSerializer pour la création
            - PasswordResetRequestSerializer pour la demande de réinitialisation
            - PasswordResetConfirmSerializer pour la confirmation de réinitialisation
            - UserSerializer pour les autres actions
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
        """Endpoint pour obtenir les informations de l'utilisateur connecté.
        
        Returns:
            Response: Les données de l'utilisateur sérialisées
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Endpoint pour changer le mot de passe de l'utilisateur connecté.
        
        Args:
            request: La requête HTTP contenant l'ancien et le nouveau mot de passe
            
        Returns:
            Response: Message de succès ou d'erreur
            
        Notes:
            Requiert l'ancien mot de passe pour validation
        """
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
        """Endpoint pour demander une réinitialisation de mot de passe.
        
        Args:
            request: La requête HTTP contenant l'email de l'utilisateur
            
        Returns:
            Response: Message de confirmation d'envoi
            
        Notes:
            - Génère un token unique
            - Envoie un email avec le lien de réinitialisation
            - Ne confirme pas l'existence de l'email pour des raisons de sécurité
        """
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
        """Endpoint pour confirmer la réinitialisation du mot de passe.
        
        Args:
            request: La requête HTTP contenant le token et le nouveau mot de passe
            
        Returns:
            Response: Message de succès ou d'erreur
            
        Notes:
            - Vérifie la validité du token
            - Met à jour le mot de passe
            - Invalide le token après utilisation
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
