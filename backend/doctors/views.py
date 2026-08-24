from datetime import datetime

from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny

from .models import (
    Doctor,
    Department,
    TimeSlot,
)

from .serializers import (
    DoctorSerializer,
    DepartmentSerializer,
    TimeSlotSerializer,
)


# ==========================================================
# Get All Departments
#
# GET:
# /api/doctors/departments/
# ==========================================================

class DepartmentListView(generics.ListAPIView):

    queryset = Department.objects.all()

    serializer_class = DepartmentSerializer

    permission_classes = [AllowAny]


# ==========================================================
# Get All Available Doctors
#
# GET:
# /api/doctors/doctors/
# ==========================================================

class DoctorListView(generics.ListAPIView):

    queryset = Doctor.objects.filter(
        is_available=True
    ).select_related(
        "user",
        "department"
    )

    serializer_class = DoctorSerializer

    permission_classes = [AllowAny]


# ==========================================================
# Search Doctors
#
# GET:
# /api/doctors/search/?search=cardiology
# ==========================================================

class DoctorSearchView(generics.ListAPIView):

    queryset = Doctor.objects.filter(
        is_available=True
    ).select_related(
        "user",
        "department"
    )

    serializer_class = DoctorSerializer

    permission_classes = [AllowAny]

    filter_backends = [
        SearchFilter
    ]

    search_fields = [
        "user__first_name",
        "user__last_name",
        "user__username",
        "specialization",
        "qualification",
        "department__name",
    ]


# ==========================================================
# Get Doctors By Department
#
# GET:
# /api/doctors/departments/1/doctors/
# ==========================================================

class DoctorByDepartmentView(
    generics.ListAPIView
):

    serializer_class = DoctorSerializer

    permission_classes = [AllowAny]


    def get_queryset(self):

        department_id = self.kwargs.get(
            "department_id"
        )

        return Doctor.objects.filter(

            department_id=department_id,

            is_available=True,

        ).select_related(

            "user",

            "department",

        )


# ==========================================================
# Get Available Time Slots
#
# GET:
# /api/doctors/time-slots/?doctor=1
#
# OR
#
# /api/doctors/time-slots/?doctor=1&date=2026-08-26
#
# If date is provided:
# Only slots for that doctor's schedule on that weekday
# will be returned.
# ==========================================================

class AvailableTimeSlotAPIView(
    generics.ListAPIView
):

    serializer_class = TimeSlotSerializer

    permission_classes = [AllowAny]


    def get_queryset(self):

        doctor_id = self.request.query_params.get(
            "doctor"
        )

        appointment_date = self.request.query_params.get(
            "date"
        )


        # ----------------------------------------------
        # Doctor not selected
        # ----------------------------------------------

        if not doctor_id:

            return TimeSlot.objects.none()


        queryset = TimeSlot.objects.filter(

            schedule__doctor_id=doctor_id,

            schedule__is_active=True,

            is_active=True,

        ).select_related(

            "schedule",

            "schedule__doctor",

        )


        # ----------------------------------------------
        # Filter by selected appointment date
        # ----------------------------------------------

        if appointment_date:

            try:

                selected_date = datetime.strptime(

                    appointment_date,

                    "%Y-%m-%d"

                ).date()


                # Example:
                # Monday
                # Tuesday
                # Wednesday

                day_name = selected_date.strftime(
                    "%A"
                )


                queryset = queryset.filter(

                    schedule__day=day_name

                )


            except ValueError:

                return TimeSlot.objects.none()


        return queryset.order_by(
            "slot_time"
        )