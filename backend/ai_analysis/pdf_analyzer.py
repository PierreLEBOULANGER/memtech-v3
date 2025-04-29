"""
pdf_analyzer.py
Service d'analyse des documents PDF
Extrait le texte et identifie les sections du document
"""

import os
import PyPDF2
import re
from typing import Dict, List, Tuple

class PDFAnalyzer:
    def __init__(self):
        self.section_patterns = [
            r'^(\d+\.\d+\.\d+)\s+(.+)$',  # 1.1.1 Titre
            r'^(\d+\.\d+)\s+(.+)$',       # 1.1 Titre
            r'^(\d+)\s+(.+)$',            # 1 Titre
        ]

    def extract_text(self, pdf_path: str) -> str:
        """
        Extrait le texte d'un fichier PDF
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"Le fichier {pdf_path} n'existe pas")

        text = ""
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text

    def identify_sections(self, text: str) -> List[Dict[str, str]]:
        """
        Identifie les sections et sous-sections dans le texte
        """
        sections = []
        lines = text.split('\n')

        for line in lines:
            for pattern in self.section_patterns:
                match = re.match(pattern, line.strip())
                if match:
                    number = match.group(1)
                    title = match.group(2)
                    level = len(number.split('.'))
                    sections.append({
                        'number': number,
                        'title': title,
                        'level': level
                    })
                    break

        return sections

    def analyze_document(self, pdf_path: str) -> Dict:
        """
        Analyse complète du document PDF
        """
        try:
            # Extraction du texte
            text = self.extract_text(pdf_path)
            
            # Identification des sections
            sections = self.identify_sections(text)
            
            # Analyse du contenu
            content_analysis = self.analyze_content(text)
            
            return {
                'sections': sections,
                'content_analysis': content_analysis,
                'raw_text': text
            }
        except Exception as e:
            raise Exception(f"Erreur lors de l'analyse du document: {str(e)}")

    def analyze_content(self, text: str) -> Dict:
        """
        Analyse le contenu du document pour identifier les exigences
        """
        # TODO: Implémenter l'analyse du contenu avec IA
        return {
            'exigences': [],
            'mots_cles': [],
            'themes': []
        } 