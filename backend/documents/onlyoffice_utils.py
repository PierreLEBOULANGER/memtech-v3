"""
Fichier utilitaire pour la gestion du JWT OnlyOffice.

Ce fichier contient les fonctions nécessaires pour signer les payloads envoyés à OnlyOffice,
afin de garantir l'authenticité des requêtes grâce au JWT.
"""

import jwt  # Librairie PyJWT
from django.conf import settings

def sign_onlyoffice_payload(payload):
    """
    Signe le payload OnlyOffice avec la clé secrète JWT.

    Args:
        payload (dict): Le dictionnaire à signer.

    Returns:
        str: Le token JWT signé.
    """
    secret = settings.ONLYOFFICE_JWT_SECRET
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token 