"""
api.py
API pour l'analyse des documents
Expose les endpoints pour l'analyse et la génération de sommaire
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.shortcuts import get_object_or_404
import os
import logging
from projects.models import ReferenceDocument

from .ai_service import AIService

# Configuration du logging
logger = logging.getLogger(__name__)

class DocumentAnalysisViewSet(viewsets.ViewSet):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ai_service = AIService()

    def _get_rc_file(self, project_id: str) -> str:
        """
        Récupère le fichier RC du projet depuis la base de données
        """
        try:
            # Récupérer le document RC du projet
            rc_doc = get_object_or_404(
                ReferenceDocument,
                project_id=project_id,
                type='RC'
            )
            
            # Vérifier si le fichier existe
            if not os.path.exists(rc_doc.file.path):
                raise FileNotFoundError(f"Le fichier RC n'existe pas : {rc_doc.file.path}")
            
            return rc_doc.file.path
            
        except ReferenceDocument.DoesNotExist:
            raise FileNotFoundError(f"Aucun document RC trouvé pour le projet {project_id}")

    @action(detail=True, methods=['post'])
    def analyze_rc(self, request, pk=None):
        """
        Analyse le RC d'un projet
        """
        try:
            # Récupérer le chemin du fichier RC
            project_id = pk
            rc_path = self._get_rc_file(project_id)
            
            logger.info(f"Analyse du fichier RC : {rc_path}")
            
            # Extraire le texte du PDF
            text = self.ai_service._extract_text_from_pdf(rc_path)
            
            # Analyser le contenu
            analysis = self.ai_service.analyze_text(text)
            
            # Générer le sommaire
            summary = self.ai_service.generate_summary(
                analysis['structure'],
                analysis
            )
            
            # Structurer la réponse
            response_data = {
                'analysis': {
                    'token_count': len(text.split()),
                    'structure': analysis['structure'],
                    'keywords': [],
                },
                'summary': summary
            }
            
            return Response(response_data)
            
        except FileNotFoundError as e:
            logger.error(f"Erreur FileNotFoundError : {str(e)}")
            return Response(
                {'error': f'Le fichier RC n\'a pas été trouvé : {str(e)}'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse du RC : {str(e)}")
            return Response(
                {'error': f'Erreur lors de l\'analyse du RC : {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def get_summary(self, request, pk=None):
        """
        Récupère le sommaire généré
        """
        try:
            # Récupérer le chemin du fichier RC
            project_id = pk
            rc_path = self._get_rc_file(project_id)
            
            # Extraire le texte du PDF
            text = self.ai_service._extract_text_from_pdf(rc_path)
            
            # Analyser le contenu
            analysis = self.ai_service.analyze_text(text)
            
            # Générer le sommaire
            summary = self.ai_service.generate_summary(
                analysis['sections'],
                analysis
            )
            
            return Response({
                'summary': summary
            })
        except FileNotFoundError:
            return Response(
                {'error': 'Le fichier RC n\'a pas été trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 