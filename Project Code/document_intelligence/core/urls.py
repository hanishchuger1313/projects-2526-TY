


# from django.urls import path
# from .views import upload_zip, dashboard

# urlpatterns = [
#     path("", upload_zip, name="upload"),
#     path("dashboard/", dashboard, name="dashboard"),
# ]



# from django.urls import path
# from . import views

# urlpatterns = [
#     path("", views.dashboard, name="dashboard"),
#     path("upload/", views.upload_zip, name="upload"),
#     path("category/<str:category_name>/", views.category_view, name="category_view"),
# ]


from django.urls import path
from . import views

# urlpatterns = [
#     path("", views.landing, name="landing"),   # Landing Page
#     path("upload/", views.upload_zip, name="upload"),
#     path("dashboard/", views.dashboard, name="dashboard"),
#     path("category/<str:category_name>/", views.category_view, name="category_view"),
# ]

urlpatterns = [
    path("", views.landing, name="landing"),
    path("upload/", views.upload_zip, name="upload"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("metrics/", views.metrics_page, name="metrics_page"),
    path("category/<str:category_name>/", views.category_view, name="category_view"),
]