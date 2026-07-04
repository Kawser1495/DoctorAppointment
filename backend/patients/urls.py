from django.urls import path
from .views import PatientProfileListView

urlpatterns = [
    path('profiles/', PatientProfileListView.as_view(), name='profiles'),
]