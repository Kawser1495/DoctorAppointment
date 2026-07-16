from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Doctor, Department
from .serializers import DoctorSerializer, DepartmentSerializer


class DoctorListView(generics.ListAPIView):

    queryset = Doctor.objects.filter(is_available=True)

    serializer_class = DoctorSerializer


class DepartmentListView(generics.ListAPIView):

    queryset = Department.objects.all()

    serializer_class = DepartmentSerializer


class DoctorSearchView(generics.ListAPIView):

    queryset = Doctor.objects.filter(is_available=True)

    serializer_class = DoctorSerializer

    filter_backends = [SearchFilter]

    search_fields = [
        "specialization",
        "qualification",
        "department__name"
    ]


class DoctorByDepartmentView(generics.ListAPIView):

    serializer_class = DoctorSerializer

    def get_queryset(self):

        department_id = self.kwargs["department_id"]

        return Doctor.objects.filter(

            department_id=department_id,

            is_available=True

        )


class DepartmentAPIView(APIView):

    def get(self, request):

        departments = Department.objects.all()

        serializer = DepartmentSerializer(

            departments,

            many=True

        )

        return Response(serializer.data)


class DoctorByDepartmentAPIView(APIView):

    def get(self, request, department_id):

        doctors = Doctor.objects.filter(

            department_id=department_id,

            is_available=True

        )

        serializer = DoctorSerializer(

            doctors,

            many=True

        )

        return Response(serializer.data)
