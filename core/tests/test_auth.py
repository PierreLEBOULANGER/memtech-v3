from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

class AuthenticationTests(APITestCase):
    """
    Tests pour le système d'authentification.
    Vérifie l'inscription, la connexion et la gestion du profil.
    """
    def setUp(self):
        """Création d'un utilisateur de test"""
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        self.register_url = reverse('auth_register')
        self.login_url = reverse('token_obtain_pair')
        self.profile_url = reverse('user_profile')
        self.change_password_url = reverse('change_password')

    def test_user_registration(self):
        """Test de l'inscription d'un nouvel utilisateur"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'NewPass123!',
            'password2': 'NewPass123!',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_registration_invalid_password(self):
        """Test de l'inscription avec des mots de passe différents"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'Pass123!',
            'password2': 'DifferentPass123!',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        """Test de la connexion utilisateur"""
        data = {
            'username': 'testuser',
            'password': 'TestPass123!'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_user_login_invalid_credentials(self):
        """Test de la connexion avec des identifiants invalides"""
        data = {
            'username': 'testuser',
            'password': 'WrongPass123!'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_access(self):
        """Test d'accès au profil utilisateur"""
        # Connexion de l'utilisateur
        self.client.force_authenticate(user=self.test_user)
        
        # Accès au profil
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_profile_update(self):
        """Test de mise à jour du profil"""
        self.client.force_authenticate(user=self.test_user)
        
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        response = self.client.patch(self.profile_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')
        self.assertEqual(response.data['last_name'], 'Name')

    def test_change_password(self):
        """Test de changement de mot de passe"""
        self.client.force_authenticate(user=self.test_user)
        
        data = {
            'old_password': 'TestPass123!',
            'new_password': 'NewTestPass123!'
        }
        response = self.client.post(self.change_password_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérification que le nouveau mot de passe fonctionne
        self.test_user.refresh_from_db()
        self.assertTrue(self.test_user.check_password('NewTestPass123!')) 