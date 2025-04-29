"""
Script pour créer des utilisateurs de test
"""

import os
import django
import sys

# Configuration de Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User

def create_test_users():
    try:
        # Créer des rédacteurs
        writers = [
            {
                'email': 'redacteur1@test.com',
                'first_name': 'Jean',
                'last_name': 'Dupont',
                'role': 'WRITER',
                'is_active': True
            },
            {
                'email': 'redacteur2@test.com',
                'first_name': 'Marie',
                'last_name': 'Martin',
                'role': 'WRITER',
                'is_active': True
            }
        ]

        # Créer des relecteurs
        reviewers = [
            {
                'email': 'relecteur1@test.com',
                'first_name': 'Pierre',
                'last_name': 'Durand',
                'role': 'REVIEWER',
                'is_active': True
            },
            {
                'email': 'relecteur2@test.com',
                'first_name': 'Sophie',
                'last_name': 'Leroy',
                'role': 'REVIEWER',
                'is_active': True
            }
        ]

        # Créer les utilisateurs
        for user_data in writers + reviewers:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'role': user_data['role'],
                    'is_active': user_data['is_active']
                }
            )
            if created:
                print(f"Utilisateur créé : {user.first_name} {user.last_name} ({user.role})")
            else:
                print(f"Utilisateur déjà existant : {user.first_name} {user.last_name} ({user.role})")

    except Exception as e:
        print(f"Erreur lors de la création des utilisateurs : {e}")

if __name__ == "__main__":
    create_test_users() 