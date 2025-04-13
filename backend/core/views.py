"""
Vues pour l'authentification et la gestion des utilisateurs
"""
from django.contrib.auth import authenticate
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Vue pour gérer la connexion des utilisateurs
    Attend email et password dans le corps de la requête
    Retourne un token JWT en cas de succès
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return JsonResponse({
            'error': 'Veuillez fournir un email et un mot de passe'
        }, status=400)

    user = authenticate(username=email, password=password)

    if user is None:
        return JsonResponse({
            'error': 'Email ou mot de passe incorrect'
        }, status=401)

    refresh = RefreshToken.for_user(user)

    return JsonResponse({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'user': {
            'email': user.email,
            'name': user.get_full_name(),
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Vue pour gérer la déconnexion des utilisateurs
    Invalide le token JWT
    """
    try:
        refresh_token = request.data["refresh_token"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return JsonResponse({'success': 'Déconnexion réussie'})
    except Exception:
        return JsonResponse({'error': 'Token invalide'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    """
    Vue pour vérifier la validité du token
    Retourne les informations de l'utilisateur si le token est valide
    """
    user = request.user
    return JsonResponse({
        'user': {
            'email': user.email,
            'name': user.get_full_name(),
        }
    }) 