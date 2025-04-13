import os
import django
from datetime import date

# Configuration de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'memtech.settings')
django.setup()

# Import des modèles après la configuration de Django
from django.contrib.auth import get_user_model
from projects.models import Project

User = get_user_model()

def create_test_project():
    # Récupérer le premier utilisateur admin
    try:
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            print("Aucun utilisateur admin trouvé")
            return
        
        # Créer un projet de test
        project = Project.objects.create(
            name="Projet Test",
            client="Client Test",
            description="Un projet de test pour démonstration",
            start_date=date.today(),
            manager=admin_user,
            status='ACTIVE'
        )
        
        # Ajouter le manager comme membre de l'équipe
        project.team_members.add(admin_user)
        
        print(f"Projet créé avec succès : {project.name}")
        
    except Exception as e:
        print(f"Erreur lors de la création du projet : {str(e)}")

if __name__ == '__main__':
    create_test_project() 