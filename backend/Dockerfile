FROM python:3.11-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances et .env
COPY requirements.txt ./
COPY .env ./

# Installer les dépendances Python de base (sans spaCy)
RUN pip install --no-cache-dir -r requirements.txt

# Installer spaCy séparément
RUN pip install --no-cache-dir spacy

# Télécharger le modèle spaCy
RUN python -m spacy download fr_core_news_md

# Copier le reste du code du backend
COPY . .

# Créer le dossier pour les fichiers statiques et médias
RUN mkdir -p /app/staticfiles /app/media

# S'assurer que le script est exécutable
RUN chmod +x /app/start.sh && \
    ls -l /app/start.sh

# Exposer le port par défaut de Django
EXPOSE 8000

# Commande de lancement
CMD ["/bin/bash", "/app/start.sh"] 