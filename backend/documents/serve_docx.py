"""
serve_docx.py

Ce fichier contient une vue Django permettant de servir les fichiers .docx (ou autres fichiers OnlyOffice)
sans le header X-Frame-Options, afin de permettre l'affichage dans une iframe par OnlyOffice.
"""

import os
from django.http import FileResponse, Http404
from django.conf import settings

def serve_docx(request, path):
    """
    Vue qui sert un fichier .docx depuis MEDIA_ROOT sans le header X-Frame-Options.
    Utilité : Permettre à OnlyOffice d'afficher le document dans une iframe.
    """
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    print(f"[OnlyOffice][serve_docx] Chemin recherché : {file_path}")  # Log pour debug
    if not os.path.exists(file_path):
        print(f"[OnlyOffice][serve_docx] Fichier NON TROUVÉ : {file_path}")  # Log pour debug
        raise Http404("Fichier non trouvé")
    response = FileResponse(open(file_path, 'rb'), content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
    # Suppression du header X-Frame-Options si présent
    if 'X-Frame-Options' in response:
        del response['X-Frame-Options']
    # Ajout des en-têtes CORS pour OnlyOffice
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
    return response 