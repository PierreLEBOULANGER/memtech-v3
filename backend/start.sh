#!/bin/bash

# Créer les tables MOA et MOE si elles n'existent pas
python manage.py shell -c "
from django.db import connection
cursor = connection.cursor()

# Créer la table MOA si elle n'existe pas
cursor.execute('''
    CREATE TABLE IF NOT EXISTS moa (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        logo BYTEA
    );
''')

# Créer la table MOE si elle n'existe pas
cursor.execute('''
    CREATE TABLE IF NOT EXISTS moe (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        logo BYTEA
    );
''')
"

# Exécuter les migrations
python manage.py migrate

# Créer un superuser s'il n'existe pas
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email=\"$DJANGO_SUPERUSER_EMAIL\").exists() or User.objects.create_superuser(\"$DJANGO_SUPERUSER_EMAIL\", \"$DJANGO_SUPERUSER_PASSWORD\", first_name=\"Admin\", last_name=\"System\", role=\"ADMIN\")"

# Lancer le serveur Django
python manage.py runserver 0.0.0.0:8000 