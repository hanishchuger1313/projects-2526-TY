
# from django.urls import path
# from . import views

# urlpatterns=[
# path('',views.index),
# path('upload/',views.upload),
# ]

# from django.urls import path
# from . import views

# urlpatterns = [
#     path('', views.index, name='home'),
#     path('upload/', views.upload, name='upload'),
# ]

from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('upload/', views.upload, name='upload'),
    path('delete/<int:doc_id>/', views.delete_document, name='delete_document'),
]