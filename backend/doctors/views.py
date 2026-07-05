from rest_framework import generics
from rest_framework.filters import SearchFilter

from .models import Doctor, Department
from .serializers import DoctorSerializer, DepartmentSerializer


class DoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer


class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class DoctorSearchView(generics.ListAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    filter_backends = [SearchFilter]
    search_fields = ['specialization']
    
    
class DoctorByDepartmentView(generics.ListAPIView):
    serializer_class = DoctorSerializer

    def get_queryset(self):
        department_id = self.kwargs['department_id']
        return Doctor.objects.filter(department_id=department_id)
