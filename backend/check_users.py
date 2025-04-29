"""
Script pour vérifier les utilisateurs dans la base de données
"""

import os
import django
import sys

# Configuration de Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User

def check_users():
    try:
        # Vérifier les rédacteurs
        writers = User.objects.filter(role='WRITER')
        print("\nRédacteurs :")
        if writers.exists():
            for writer in writers:
                print(f"- {writer.first_name} {writer.last_name} ({writer.email})")
        else:
            print("Aucun rédacteur trouvé")

        # Vérifier les relecteurs
        reviewers = User.objects.filter(role='REVIEWER')
        print("\nRelecteurs :")
        if reviewers.exists():
            for reviewer in reviewers:
                print(f"- {reviewer.first_name} {reviewer.last_name} ({reviewer.email})")
        else:
            print("Aucun relecteur trouvé")

    except Exception as e:
        print(f"Erreur lors de la vérification : {e}")

if __name__ == "__main__":
    check_users() 