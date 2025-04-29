"""
Script pour supprimer tous les projets de la base de données
"""

import os
import django
import sys

# Configuration de Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from projects.models import Project

def delete_all_projects():
    try:
        # Afficher le nombre de projets avant suppression
        count_before = Project.objects.count()
        print(f"Nombre de projets avant suppression : {count_before}")
        
        # Supprimer tous les projets
        Project.objects.all().delete()
        
        # Vérifier le nombre de projets après suppression
        count_after = Project.objects.count()
        print(f"Nombre de projets après suppression : {count_after}")
        
        print("Suppression terminée avec succès !")
        
    except Exception as e:
        print(f"Erreur lors de la suppression : {e}")

if __name__ == "__main__":
    delete_all_projects() 