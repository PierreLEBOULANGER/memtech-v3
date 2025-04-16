# Memtech V3

Application de rédaction de mémoires techniques avec Django et React.

## Description

Memtech V3 est une application web moderne permettant la rédaction collaborative de mémoires techniques. Elle offre une interface intuitive pour la création, l'édition et la gestion de projets et de leurs documents associés.

## Fonctionnalités principales

- Gestion des projets
- Rédaction de rapports techniques
- Gestion des MOA (Maîtrise d'Ouvrage) et MOE (Maîtrise d'Œuvre)
- Système d'authentification sécurisé
- Interface utilisateur moderne et responsive

## Technologies utilisées

### Backend
- Django 5.0.3
- Django REST Framework
- JWT Authentication
- SQLite (en développement)

### Frontend
- React 18
- TypeScript
- Material-UI
- Vite

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

# Appliquer les migrations
python manage.py migrate

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
├── backend/           # API Django
│   ├── api/          # Configuration API
│   ├── core/         # Fonctionnalités principales
│   ├── projects/     # Gestion des projets
│   ├── users/        # Gestion des utilisateurs
│   └── moas/         # Gestion MOA/MOE
├── frontend/         # Application React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
└── docs/            # Documentation
```

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## API

L'API est accessible à l'adresse `http://localhost:8000/api/`.

### Authentification

- `POST /api/token/` : Obtenir un token JWT
- `POST /api/token/refresh/` : Rafraîchir un token JWT
- `POST /api/token/verify/` : Vérifier un token JWT

### Utilisateurs

- `GET /api/users/` : Liste des utilisateurs
- `POST /api/users/` : Créer un utilisateur
- `GET /api/users/{id}/` : Détails d'un utilisateur
- `PUT /api/users/{id}/` : Mettre à jour un utilisateur
- `DELETE /api/users/{id}/` : Supprimer un utilisateur

### Projets

- `GET /api/projects/` : Liste des projets
- `POST /api/projects/` : Créer un projet
- `GET /api/projects/{id}/` : Détails d'un projet
- `PUT /api/projects/{id}/` : Mettre à jour un projet
- `DELETE /api/projects/{id}/` : Supprimer un projet

### Maîtres d'ouvrage

- `GET /api/moas/` : Liste des maîtres d'ouvrage
- `POST /api/moas/` : Créer un maître d'ouvrage
- `GET /api/moas/{id}/` : Détails d'un maître d'ouvrage
- `PUT /api/moas/{id}/` : Mettre à jour un maître d'ouvrage
- `DELETE /api/moas/{id}/` : Supprimer un maître d'ouvrage 