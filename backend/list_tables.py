"""
Script pour lister les tables de la base de données
"""

import sqlite3
import os

def list_tables():
    # Chemin vers la base de données
    db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'memos.db')
    
    # Connexion à la base de données
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Lister toutes les tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("Tables dans la base de données :")
        for table in tables:
            print(f"- {table[0]}")
            
    except sqlite3.Error as e:
        print(f"Erreur SQLite : {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    list_tables() 