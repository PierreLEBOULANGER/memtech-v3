"""
Script pour nettoyer la table projects_project de la base de données
"""

import sqlite3
import os

def clean_projects():
    # Chemin vers la base de données
    db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'memos.db')
    
    # Connexion à la base de données
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Afficher les projets actuels
        print("Projets actuels :")
        cursor.execute("SELECT id, name, status FROM projects_project;")
        projects = cursor.fetchall()
        for project in projects:
            print(f"ID: {project[0]}, Nom: {project[1]}, Statut: {project[2]}")
        
        # Demander confirmation
        confirm = input("\nVoulez-vous supprimer tous les projets ? (oui/non) : ")
        
        if confirm.lower() == 'oui':
            # Supprimer tous les projets
            cursor.execute("DELETE FROM projects_project;")
            conn.commit()
            print("\nTous les projets ont été supprimés avec succès.")
        else:
            print("\nOpération annulée.")
            
    except sqlite3.Error as e:
        print(f"Erreur SQLite : {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    clean_projects() 