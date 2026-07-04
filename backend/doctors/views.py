from rest_framework import generics
from .models import Doctor, Department
from .serializers import DoctorSerializer, DepartmentSerializer

class DoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
