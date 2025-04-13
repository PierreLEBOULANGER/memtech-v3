"""
Configuration WSGI pour le projet MemTech.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'memtech.settings')

application = get_wsgi_application() 