"""
ai_service.py
Service d'analyse IA du contenu des documents
Utilise GPT-4 pour analyser le texte et générer des insights
"""

from typing import Dict, List
import os
import PyPDF2
import openai
from django.conf import settings

class AIService:
    def __init__(self):
        # Configuration OpenAI
        openai.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL

    def analyze_text(self, text: str) -> Dict:
        """
        Analyse le texte avec GPT-4
        """
        try:
            # Préparation du prompt
            prompt = f"""En tant qu'expert en marchés publics, analyse le règlement de consultation suivant et propose une structure détaillée pour le mémoire technique.

Document RC :
{text}

Format de réponse attendu (avec numérotation claire) :
1. [Titre du chapitre] ([Nombre de points] points)
   1.1. [Sous-titre] ([Nombre de points] points)
      1.1.1. [Sous-sous-titre] ([Nombre de points] points)
      1.1.2. [Sous-sous-titre] ([Nombre de points] points)
   1.2. [Sous-titre] ([Nombre de points] points)
      1.2.1. [Sous-sous-titre] ([Nombre de points] points)
      1.2.2. [Sous-sous-titre] ([Nombre de points] points)

2. [Titre du chapitre] ([Nombre de points] points)
   2.1. [Sous-titre] ([Nombre de points] points)
      2.1.1. [Sous-sous-titre] ([Nombre de points] points)
      2.1.2. [Sous-sous-titre] ([Nombre de points] points)
   2.2. [Sous-titre] ([Nombre de points] points)
      2.2.1. [Sous-sous-titre] ([Nombre de points] points)
      2.2.2. [Sous-sous-titre] ([Nombre de points] points)

Important :
- Reproduire exactement les intitulés des critères de jugement du mémoire technique exigés dans le rc
- Inclure les points pour chaque critère
- Ne pas reformuler les intitulés
- Ne pas inventer de sections non mentionnées dans le RC
- Utiliser une numérotation claire et hiérarchique (1, 1.1, 1.1.1, etc.)
"""

            print("Envoi de la requête à GPT-4...")
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Tu es un expert en rédaction de mémoires techniques. Ta tâche est de proposer une structure claire et logique pour le mémoire technique basée sur le RC fourni."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )

            print("Réponse reçue de GPT-4")
            analysis = response.choices[0].message.content
            print(f"Contenu de l'analyse : {analysis[:200]}...")

            # Structuration de l'analyse
            structure = self._extract_structure(analysis)
            result = {
                'structure': structure,
                'exigences': [],
                'contraintes': [],
                'points_critiques': [],
                'recommendations': []
            }
            print(f"Résultat structuré : {result}")
            return result

        except Exception as e:
            print(f"Erreur détaillée lors de l'analyse avec GPT-4: {str(e)}")
            return {
                'structure': [],
                'exigences': [],
                'contraintes': [],
                'points_critiques': [],
                'recommendations': []
            }

    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extrait le texte d'un fichier PDF
        """
        text = ""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise Exception(f"Erreur lors de l'extraction du texte du PDF: {str(e)}")

    def _extract_structure(self, analysis: str) -> List[Dict]:
        """
        Extrait la structure proposée de l'analyse GPT-4
        """
        structure = []
        current_chapter = None
        current_subchapter = None
        chapter_number = 0
        subchapter_number = 0
        
        for line in analysis.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # Détecter les chapitres principaux (commencent par un chiffre)
            if line[0].isdigit() and '. ' in line and not line[2:].startswith('.'):
                chapter_number += 1
                subchapter_number = 0
                # Extraire le titre sans les points
                title = line.split('. ', 1)[1]
                title = title.split(' (')[0]  # Supprimer les points
                current_chapter = {
                    'title': f"{chapter_number}. {title}",
                    'subsections': []
                }
                structure.append(current_chapter)
                current_subchapter = None
                
            # Détecter les sous-chapitres (commencent par un chiffre suivi d'un point)
            elif line[0].isdigit() and '. ' in line and line[2:].startswith('.'):
                subchapter_number += 1
                # Extraire le titre sans les points
                title = line.split('. ', 1)[1]
                title = title.split(' (')[0]  # Supprimer les points
                if current_chapter:
                    current_subchapter = {
                        'title': f"{chapter_number}.{subchapter_number}. {title}",
                        'subsections': []
                    }
                    current_chapter['subsections'].append(current_subchapter)
                
            # Détecter les sous-sous-chapitres (commencent par des espaces)
            elif line.startswith('      ') and current_subchapter:
                # Extraire le titre sans les points
                title = line.strip()
                title = title.split(' (')[0]  # Supprimer les points
                current_subchapter['subsections'].append(title)
                
        return structure

    def generate_summary(self, structure: List[Dict], analysis: Dict) -> Dict:
        """
        Génère un sommaire basé sur l'analyse
        """
        return {
            'title': 'Sommaire du Mémoire Technique',
            'structure': structure,
            'sections': structure,  # Utiliser la structure comme sections
            'sections_by_level': {},
            'exigences': analysis.get('exigences', []),
            'contraintes': analysis.get('contraintes', []),
            'points_critiques': analysis.get('points_critiques', []),
            'recommendations': analysis.get('recommendations', [])
        } 