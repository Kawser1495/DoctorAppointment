from rest_framework import generics
from .models import PatientProfile
from .serializers import PatientProfileSerializer

class PatientProfileListView(generics.ListAPIView):
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
