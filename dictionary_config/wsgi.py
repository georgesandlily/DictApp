"""
WSGI config for locallibrary project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/howto/deployment/wsgi/
"""

import os
import sys

from django.core.wsgi import get_wsgi_application
DJANGO_PATH =  os.path.join(os.path.abspath(os.path.dirname(__file__)), '..')
sys.path.append(DJANGO_PATH)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dictionary_config.settings")

application = get_wsgi_application()
