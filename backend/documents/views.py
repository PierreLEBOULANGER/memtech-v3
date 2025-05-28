"""
Ce fichier définit les vues pour l'API des documents.
Il gère toutes les opérations CRUD sur les documents.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import Document
from .serializers import DocumentSerializer
from django.core.exceptions import PermissionDenied
from django.conf import settings
import os
try:
    from docx import Document as DocxDocument
except ImportError:
    DocxDocument = None  # Pour éviter l'erreur si python-docx n'est pas installé
from projects.models import Project
import jwt  # Librairie PyJWT pour signer le payload OnlyOffice
from .onlyoffice_utils import sign_onlyoffice_payload  # Utilitaire pour signer le payload OnlyOffice
import hashlib
from rest_framework.permissions import AllowAny
from urllib.parse import urlparse
from django.urls import reverse

class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les opérations CRUD sur les documents.
    Inclut des endpoints personnalisés pour des actions spécifiques.
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Surcharge la création pour ajouter l'utilisateur actuel comme uploader.
        """
        serializer.save(uploaded_by=self.request.user)

    def get_queryset(self):
        """
        Filtre les documents en fonction du projet si spécifié.
        """
        queryset = Document.objects.all()
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """
        Endpoint personnalisé pour changer le statut d'un document.
        """
        document = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Le statut est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        document.status = new_status
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def change_category(self, request, pk=None):
        """
        Endpoint personnalisé pour changer la catégorie d'un document.
        """
        document = self.get_object()
        new_category = request.data.get('category')
        
        if not new_category:
            return Response(
                {'error': 'La catégorie est requise'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        document.category = new_category
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='word_url', permission_classes=[AllowAny])
    def get_or_create_word_file(self, request, pk=None):
        """
        Endpoint pour obtenir l'URL du fichier Word associé à ce document.
        Cette version génère automatiquement une URL HTTPS sur le port 8443 pour OnlyOffice,
        et utilise la vue serve_docx pour supprimer le header X-Frame-Options.
        """
        document = self.get_object()
        # On vérifie si le fichier existe déjà et est un .docx
        if document.file and document.file.name.endswith('.docx') and os.path.isfile(document.file.path):
            # Construction de deux URLs :
            # - onlyoffice_url : pour le conteneur OnlyOffice (host.docker.internal:8443) via la vue serve_docx
            # - browser_url : pour le navigateur (localhost:8443) via la vue serve_docx
            serve_docx_path = reverse('serve_docx', kwargs={'path': document.file.name})
            onlyoffice_url = f"https://host.docker.internal:8443{serve_docx_path}"
            browser_url = f"https://localhost:8443{serve_docx_path}"
            # Construction du payload OnlyOffice
            onlyoffice_payload = {
                "document": {
                    "url": onlyoffice_url,
                    "fileType": "docx",
                    "key": f"memoire_{document.project.id}_{document.id}",
                    "title": "Mémoire technique"
                },
                "permissions": {
                    "edit": True,
                    "download": True,
                    "print": True
                },
                "editorConfig": {
                    "mode": "edit",
                    "lang": "fr",
                    "callbackUrl": f"https://host.docker.internal:8443/api/documents/onlyoffice_callback/",
                    "user": {
                        "id": str(request.user.id) if request.user.is_authenticated else "1",
                        "name": request.user.get_full_name() if request.user.is_authenticated else "Utilisateur"
                    }
                }
            }
            token = sign_onlyoffice_payload(onlyoffice_payload)
            return Response({
                'onlyoffice_url': onlyoffice_url,
                'browser_url': browser_url,
                'onlyoffice_token': token
            })

        # Si le fichier n'existe pas ou n'est pas un .docx, on le crée
        if DocxDocument is None:
            return Response({'error': 'python-docx n\'est pas installé sur le serveur.'}, status=500)

        # Définir le chemin de stockage
        memoires_dir = os.path.join(settings.MEDIA_ROOT, 'memoires')
        os.makedirs(memoires_dir, exist_ok=True)
        filename = f"memoire_{document.project.id}_{document.id}.docx"
        file_path = os.path.join(memoires_dir, filename)

        # Créer un document Word vierge
        docx = DocxDocument()
        docx.add_paragraph("Mémoire technique - Document vierge")
        docx.save(file_path)

        # Associer le fichier au document et sauvegarder
        relative_path = os.path.join('memoires', filename)
        document.file.name = relative_path
        document.save()

        # Après création du fichier, même logique pour l'URL
        serve_docx_path = reverse('serve_docx', kwargs={'path': document.file.name})
        onlyoffice_url = f"https://host.docker.internal:8443{serve_docx_path}"
        browser_url = f"https://localhost:8443{serve_docx_path}"
        onlyoffice_payload = {
            "document": {
                "url": onlyoffice_url,
                "fileType": "docx",
                "key": f"memoire_{document.project.id}_{document.id}",
                "title": "Mémoire technique"
            },
            "permissions": {
                "edit": True,
                "download": True,
                "print": True
            },
            "editorConfig": {
                "mode": "edit",
                "lang": "fr",
                "callbackUrl": f"https://host.docker.internal:8443/api/documents/onlyoffice_callback/",
                "user": {
                    "id": str(request.user.id) if request.user.is_authenticated else "1",
                    "name": request.user.get_full_name() if request.user.is_authenticated else "Utilisateur"
                }
            }
        }
        token = sign_onlyoffice_payload(onlyoffice_payload)
        return Response({
            'onlyoffice_url': onlyoffice_url,
            'browser_url': browser_url,
            'onlyoffice_token': token
        })

    @action(detail=False, methods=['post'], url_path='create_memoire_technique')
    def create_memoire_technique(self, request):
        """
        Endpoint pour créer un document mémoire technique vierge pour un projet donné.
        Si un document technique existe déjà pour ce projet, le retourne.
        Sinon, crée un document vierge (catégorie 'technical', statut 'draft').
        """
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'error': 'project_id requis'}, status=400)
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'error': 'Projet introuvable'}, status=404)
        
        # Vérifier s'il existe déjà un document technique pour ce projet
        existing_doc = Document.objects.filter(project=project, category='technical').first()
        if existing_doc:
            serializer = self.get_serializer(existing_doc)
            return Response({
                'document': serializer.data,
                'document_id': existing_doc.id,
                'message': 'Document technique déjà existant'
            })
        
        # Créer un document vierge
        doc = Document.objects.create(
            project=project,
            category='technical',
            status='draft',
            name=f"Mémoire technique - {project.name}",
            description="Mémoire technique du projet",
            uploader=request.user
        )
        
        # Créer le fichier Word vierge
        if DocxDocument is None:
            return Response({'error': 'python-docx n\'est pas installé sur le serveur.'}, status=500)

        # Définir le chemin de stockage
        memoires_dir = os.path.join(settings.MEDIA_ROOT, 'memoires')
        os.makedirs(memoires_dir, exist_ok=True)
        filename = f"memoire_{project.id}_{doc.id}.docx"
        file_path = os.path.join(memoires_dir, filename)

        # Créer un document Word vierge
        docx = DocxDocument()
        docx.add_paragraph(f"Mémoire technique - {project.name}")
        docx.save(file_path)

        # Associer le fichier au document et sauvegarder
        relative_path = os.path.join('memoires', filename)
        doc.file.name = relative_path
        doc.save()

        serializer = self.get_serializer(doc)
        return Response({
            'document': serializer.data,
            'document_id': doc.id,
            'message': 'Document technique créé avec succès'
        })

@api_view(['GET'])
def word_url(request, pk):
    """
    Vue API qui retourne l'URL du document Word pour OnlyOffice et le token JWT.
    Utilité : Permettre au front de récupérer l'URL et le token à transmettre à OnlyOffice.
    """
    document = get_object_or_404(Document, pk=pk)
    url = f"/api/documents/media/{document.file.name}"
    # Génération du token JWT OnlyOffice (si besoin)
    onlyoffice_payload = {
        "document": {
            "fileType": "docx",
            "key": hashlib.sha1(url.encode('utf-8')).hexdigest(),
            "title": "Mémoire technique",
            "url": url,
        },
        "documentType": "word",
        "editorConfig": {
            "mode": "edit",
            "lang": "fr",
            "callbackUrl": "http://host.docker.internal:8000/api/documents/onlyoffice_callback/",
            "user": {
                "id": str(request.user.id) if request.user.is_authenticated else "1",
                "name": request.user.get_full_name() if request.user.is_authenticated else "Utilisateur"
            }
        },
        "permissions": {
            "edit": True,
            "download": True,
            "print": True,
            "review": True,
        },
        "height": "100%",
        "width": "100%",
    }
    token = sign_onlyoffice_payload(onlyoffice_payload)
    return Response({"url": url, "onlyoffice_token": token}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def onlyoffice_callback(request):
    """
    Callback OnlyOffice : reçoit les notifications de modification de document.
    Accessible sans authentification car OnlyOffice ne gère pas l'authentification.
    """
    # TODO : implémenter la logique de sauvegarde OnlyOffice ici
    return Response({'status': 'ok'})
