from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny

from .models import Doctor, Department, TimeSlot
from .serializers import (
    DoctorSerializer,
    DepartmentSerializer,
    TimeSlotSerializer,
)


# ==========================================
# Doctor List
# ==========================================

class DoctorListView(generics.ListAPIView):

    queryset = Doctor.objects.filter(
        is_available=True
    )

    serializer_class = DoctorSerializer


# ==========================================
# Department List
# ==========================================

class DepartmentListView(generics.ListAPIView):

    queryset = Department.objects.all()

    serializer_class = DepartmentSerializer

    permission_classes = [AllowAny]


# ==========================================
# Doctor Search
# ==========================================

class DoctorSearchView(generics.ListAPIView):

    queryset = Doctor.objects.filter(
        is_available=True
    )

    serializer_class = DoctorSerializer

    filter_backends = [SearchFilter]

    search_fields = [
        "specialization",
        "qualification",
        "department__name",
        "user__first_name",
        "user__last_name",
    ]


# ==========================================
# Doctor By Department
# ==========================================

class DoctorByDepartmentView(generics.ListAPIView):

    serializer_class = DoctorSerializer

    permission_classes = [AllowAny]

    def get_queryset(self):

        department_id = self.kwargs["department_id"]

        return Doctor.objects.filter(

            department_id=department_id,

            is_available=True

        )


# ==========================================
# Available Time Slot API
# ==========================================

class AvailableTimeSlotAPIView(generics.ListAPIView):

    serializer_class = TimeSlotSerializer

    permission_classes = [AllowAny]

    def get_queryset(self):

        doctor_id = self.request.GET.get("doctor")

        if not doctor_id:

            return TimeSlot.objects.none()

        return TimeSlot.objects.filter(

            schedule__doctor_id=doctor_id,

            schedule__is_active=True,

            is_active=True

        ).select_related(

            "schedule"

        ).order_by(

            "schedule__day",

            "slot_time"

        )