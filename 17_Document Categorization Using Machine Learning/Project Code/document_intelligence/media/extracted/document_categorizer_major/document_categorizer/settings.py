
# from pathlib import Path
# BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY = 'major-secret'
# DEBUG = True
# ALLOWED_HOSTS = []

# INSTALLED_APPS = [
# 'django.contrib.admin',
# 'django.contrib.auth',
# 'django.contrib.contenttypes',
# 'django.contrib.sessions',
# 'django.contrib.messages',
# 'django.contrib.staticfiles',
# 'classifier',
# ]

# MIDDLEWARE = [
# 'django.middleware.security.SecurityMiddleware',
# 'django.contrib.sessions.middleware.SessionMiddleware',
# 'django.middleware.common.CommonMiddleware',
# 'django.middleware.csrf.CsrfViewMiddleware',
# 'django.contrib.auth.middleware.AuthenticationMiddleware',
# 'django.contrib.messages.middleware.MessageMiddleware',
# ]

# ROOT_URLCONF = 'document_categorizer.urls'

# TEMPLATES = [{
# 'BACKEND': 'django.template.backends.django.DjangoTemplates',
# 'DIRS': [BASE_DIR / 'templates'],
# 'APP_DIRS': True,
# }]

# WSGI_APPLICATION = 'document_categorizer.wsgi.application'

# DATABASES = {
# 'default': {
# 'ENGINE': 'django.db.backends.sqlite3',
# 'NAME': BASE_DIR / 'db.sqlite3',
# }
# }

# STATIC_URL = '/static/'
# STATICFILES_DIRS = [BASE_DIR / 'static']

# MEDIA_ROOT = BASE_DIR / 'media'
# MEDIA_URL = '/media/'

# LOGIN_URL = '/login/'
# LOGIN_REDIRECT_URL = '/'
# LOGOUT_REDIRECT_URL = '/login/'


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'major-secret'

DEBUG = True

ALLOWED_HOSTS = []


# ======================
# INSTALLED APPS
# ======================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'classifier',
]


# ======================
# MIDDLEWARE
# ======================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]


# ======================
# URLS
# ======================
ROOT_URLCONF = 'document_categorizer.urls'


# ======================
# TEMPLATES (FIXED ✅)
# ======================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# ======================
# WSGI
# ======================
WSGI_APPLICATION = 'document_categorizer.wsgi.application'


# ======================
# DATABASE
# ======================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# ======================
# STATIC FILES
# ======================
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']


# ======================
# MEDIA FILES
# ======================
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# ======================
# AUTH REDIRECTS
# ======================
LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/login/'


# ======================
# DEFAULT FIELD TYPE
# ======================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'