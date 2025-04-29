"""
Script pour tester l'API des utilisateurs
"""

import requests
import json

def test_users_api():
    # URL de l'API
    url = "http://localhost:8000/api/users/"
    
    # Obtenir le token d'authentification
    auth_url = "http://localhost:8000/api/auth/login/"
    auth_data = {
        "email": "pleboulanger49@gmail.com",
        "password": "Plb17092011!"
    }
    
    try:
        auth_response = requests.post(auth_url, json=auth_data)
        auth_response.raise_for_status()
        token = auth_response.json().get('access')
        
        # Headers avec le token
        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        # Test avec le rôle ADMIN
        print("\nTest avec role=ADMIN:")
        response = requests.get(url, params={'role': 'ADMIN'}, headers=headers)
        print(f"Status: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
        
        # Test avec les rôles WRITER,ADMIN
        print("\nTest avec role=WRITER,ADMIN:")
        response = requests.get(url, params={'role': 'WRITER,ADMIN'}, headers=headers)
        print(f"Status: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
        
        # Test avec les rôles REVIEWER,ADMIN
        print("\nTest avec role=REVIEWER,ADMIN:")
        response = requests.get(url, params={'role': 'REVIEWER,ADMIN'}, headers=headers)
        print(f"Status: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la requête : {e}")

if __name__ == "__main__":
    test_users_api() 