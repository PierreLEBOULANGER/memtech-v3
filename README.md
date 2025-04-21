# Memtech V3

Application de rédaction de mémoires techniques avec Django et React.

## Description

Memtech V3 est une application web moderne permettant la rédaction collaborative de mémoires techniques. Elle offre une interface intuitive pour la création, l'édition et la gestion de projets et de leurs documents associés.

## Fonctionnalités principales

- Gestion complète des projets (CRUD)
- Système de documents requis configurable
- Gestion des MOA (Maîtrise d'Ouvrage) et MOE (Maîtrise d'Œuvre)
- Upload et gestion des documents de référence (RC, CCTP)
- Interface utilisateur moderne et responsive avec mode liste/grille
- Système d'authentification sécurisé avec rôles (ADMIN/USER)
- Filtrage et recherche avancée des projets

## Technologies utilisées

### Backend
- Django 5.0.3
- Django REST Framework 3.14.0
- JWT Authentication avec SimpleJWT
- SQLite (base de données par défaut)
- Pillow pour la gestion des images
- WeasyPrint pour la génération PDF

### Frontend
- React 18
- TypeScript
- Vite 5.4
- Shadcn/UI + TailwindCSS
- React Query pour la gestion des requêtes
- React Router pour la navigation

## Installation

### Prérequis
- Python 3.11+
- Node.js 18+
- npm ou yarn

### Backend

```bash
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Créer le dossier data pour la base SQLite
mkdir data

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### Frontend

```bash
# Se placer dans le dossier frontend
cd frontend

# Installer les dépendances
npm install
# ou
yarn install

# Lancer le serveur de développement
npm run dev
# ou
yarn dev
```

## Structure du projet

```
memtech-v3/
├── backend/              # API Django
│   ├── core/            # Fonctionnalités principales
│   ├── projects/        # Gestion des projets
│   │   ├── models.py    # Modèles de données
│   │   ├── views.py     # Vues API
│   │   └── urls.py      # Configuration des URLs
│   ├── users/           # Gestion des utilisateurs
│   └── moas/            # Gestion MOA/MOE
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   │   ├── ui/     # Composants UI génériques
│   │   │   └── projects/ # Composants spécifiques aux projets
│   │   ├── pages/      # Pages de l'application
│   │   ├── services/   # Services API
│   │   └── types/      # Types TypeScript
│   └── public/
├── data/               # Base de données SQLite
└── docs/              # Documentation
```

## API

L'API est accessible à l'adresse `http://localhost:8000/api/`.

### Authentification

- `POST /api/token/` : Obtenir un token JWT
- `POST /api/token/refresh/` : Rafraîchir un token JWT
- `POST /api/token/verify/` : Vérifier un token JWT

### Projets

- `GET /api/projects/` : Liste des projets
- `POST /api/projects/` : Créer un projet
- `GET /api/projects/{id}/` : Détails d'un projet
- `PUT /api/projects/{id}/` : Mettre à jour un projet
- `DELETE /api/projects/{id}/` : Supprimer un projet (requiert mot de passe admin)
- `POST /api/projects/{id}/add_required_documents/` : Ajouter des documents requis
- `GET /api/projects/{id}/statistics/` : Statistiques du projet
- `GET /api/projects/{id}/documents_status/` : État des documents

### Documents

- `GET /api/document-types/` : Liste des types de documents
- `POST /api/projects/{id}/reference-documents/` : Upload document de référence
- `GET /api/projects/{id}/documents/` : Liste des documents du projet

### MOA/MOE

- `GET /api/moas/` : Liste des maîtres d'ouvrage
- `POST /api/moas/` : Créer un maître d'ouvrage
- `GET /api/moes/` : Liste des maîtres d'œuvre
- `POST /api/moes/` : Créer un maître d'œuvre

## Problèmes connus

1. Erreur 431 sur les requêtes HMR de Vite
   - Solution temporaire : Redémarrer le serveur de développement
   - Issue en cours d'investigation

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 