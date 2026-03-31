from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse


def home(request):
    return HttpResponse("Health Risk Prediction API is running")


urlpatterns = [
    path("", home),                      # http://127.0.0.1:8000/
    path("admin/", admin.site.urls),     # http://127.0.0.1:8000/admin/
    path("api/", include("health.urls")) # http://127.0.0.1:8000/api/
]
