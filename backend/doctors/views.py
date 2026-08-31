from datetime import datetime, date

from django.db import models
from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
    JSONParser,
)
from rest_framework.response import Response

from appointments.models import Appointment

from accounts.permissions import IsDoctor

from .models import (
    Doctor,
    Department,
    DoctorSchedule,
    TimeSlot,
)

from .serializers import (
    DoctorSerializer,
    DepartmentSerializer,
    DoctorScheduleSerializer,
    TimeSlotSerializer,
    DoctorProfileUpdateSerializer,
)


# ==========================================================
# Departments
#
# GET:
# /api/doctors/departments/
# ==========================================================

class DepartmentListView(
    generics.ListAPIView
):

    queryset = (

        Department.objects

        .all()

        .order_by(
            "name"
        )

    )

    serializer_class = (
        DepartmentSerializer
    )

    permission_classes = [
        AllowAny
    ]

    pagination_class = None


# ==========================================================
# All Available Doctors
#
# GET:
# /api/doctors/doctors/
# ==========================================================

class DoctorListView(
    generics.ListAPIView
):

    serializer_class = (
        DoctorSerializer
    )

    permission_classes = [
        AllowAny
    ]

    pagination_class = None


    def get_queryset(self):

        return (

            Doctor.objects

            .filter(

                is_available=True,

                user__is_active=True,

                user__role="doctor",

            )

            .select_related(

                "user",

                "department",

            )

            .prefetch_related(
                "schedules"
            )

            .order_by(

                "user__first_name",

                "user__username",

            )

        )


# ==========================================================
# Doctor Details
#
# GET:
# /api/doctors/doctors/<id>/
# ==========================================================

class DoctorDetailView(
    generics.RetrieveAPIView
):

    serializer_class = (
        DoctorSerializer
    )

    permission_classes = [
        AllowAny
    ]


    def get_object(self):

        return get_object_or_404(

            Doctor.objects

            .select_related(

                "user",

                "department",

            )

            .prefetch_related(
                "schedules"
            ),

            id=self.kwargs.get(
                "pk"
            ),

            is_available=True,

            user__is_active=True,

            user__role="doctor",

        )


# ==========================================================
# Search Doctors
#
# GET:
# /api/doctors/search/?search=cardiology
# ==========================================================

class DoctorSearchView(
    generics.ListAPIView
):

    serializer_class = (
        DoctorSerializer
    )

    permission_classes = [
        AllowAny
    ]

    pagination_class = None

    filter_backends = [
        SearchFilter
    ]

    search_fields = [

        "user__first_name",

        "user__last_name",

        "user__username",

        "specialization",

        "qualification",

        "biography",

        "department__name",

    ]


    def get_queryset(self):

        return (

            Doctor.objects

            .filter(

                is_available=True,

                user__is_active=True,

                user__role="doctor",

            )

            .select_related(

                "user",

                "department",

            )

            .prefetch_related(
                "schedules"
            )

            .order_by(

                "user__first_name",

                "user__username",

            )

        )


# ==========================================================
# Doctors By Department
#
# GET:
# /api/doctors/departments/<department_id>/doctors/
# ==========================================================

class DoctorByDepartmentView(
    generics.ListAPIView
):

    serializer_class = (
        DoctorSerializer
    )

    permission_classes = [
        AllowAny
    ]

    pagination_class = None


    def get_queryset(self):

        department_id = (
            self.kwargs.get(
                "department_id"
            )
        )

        return (

            Doctor.objects

            .filter(

                department_id=department_id,

                is_available=True,

                user__is_active=True,

                user__role="doctor",

            )

            .select_related(

                "user",

                "department",

            )

            .prefetch_related(
                "schedules"
            )

            .order_by(

                "user__first_name",

                "user__username",

            )

        )


# ==========================================================
# Doctor Schedules
#
# GET:
# /api/doctors/doctors/<id>/schedules/
# ==========================================================

class DoctorScheduleListView(
    generics.ListAPIView
):

    serializer_class = (
        DoctorScheduleSerializer
    )

    permission_classes = [
        AllowAny
    ]

    pagination_class = None


    def get_queryset(self):

        doctor_id = (
            self.kwargs.get(
                "doctor_id"
            )
        )

        return (

            DoctorSchedule.objects

            .filter(

                doctor_id=doctor_id,

                doctor__is_available=True,

                doctor__user__is_active=True,

                doctor__user__role="doctor",

                is_active=True,

            )

            .select_related(

                "doctor",

                "doctor__user",

            )

            .prefetch_related(
                "slots"
            )

        )


# ==========================================================
# Available Time Slots
#
# GET:
# /api/doctors/time-slots/?doctor=1&date=2026-08-31
# ==========================================================

class AvailableTimeSlotAPIView(
    generics.ListAPIView
):

    serializer_class = (
        TimeSlotSerializer
    )

    permission_classes = [
        AllowAny
    ]

    pagination_class = None


    def get_queryset(self):

        doctor_id = (
            self.request
            .query_params
            .get(
                "doctor"
            )
        )

        appointment_date = (
            self.request
            .query_params
            .get(
                "date"
            )
        )


        # --------------------------------------------------
        # Doctor Required
        # --------------------------------------------------

        if not doctor_id:

            raise ValidationError({

                "doctor":
                    "Doctor ID is required."

            })


        # --------------------------------------------------
        # Base Query
        # --------------------------------------------------

        queryset = (

            TimeSlot.objects

            .filter(

                schedule__doctor_id=
                    doctor_id,

                schedule__doctor__is_available=
                    True,

                schedule__doctor__user__is_active=
                    True,

                schedule__doctor__user__role=
                    "doctor",

                schedule__is_active=True,

                is_active=True,

                booked_count__lt=models.F(
                    "max_patient"
                ),

            )

            .select_related(

                "schedule",

                "schedule__doctor",

                "schedule__doctor__user",

            )

        )


        # --------------------------------------------------
        # Filter By Date
        # --------------------------------------------------

        if appointment_date:

            try:

                selected_date = (

                    datetime.strptime(

                        appointment_date,

                        "%Y-%m-%d",

                    ).date()

                )

            except ValueError:

                raise ValidationError({

                    "date":
                        "Invalid date format. Use YYYY-MM-DD."

                })


            day_name = (
                selected_date.strftime(
                    "%A"
                )
            )


            queryset = (

                queryset.filter(
                    schedule__day=day_name
                )

            )


        return queryset.order_by(
            "slot_time"
        )


# ==========================================================
# Doctor My Profile
#
# GET:
# /api/doctors/me/profile/
#
# PATCH:
# /api/doctors/me/profile/
#
# PUT:
# /api/doctors/me/profile/
# ==========================================================

class DoctorMyProfileView(
    generics.RetrieveUpdateAPIView
):

    permission_classes = [

        IsAuthenticated,

        IsDoctor,

    ]

    parser_classes = [

        MultiPartParser,

        FormParser,

        JSONParser,

    ]


    def get_object(self):

        return get_object_or_404(

            Doctor.objects

            .select_related(

                "user",

                "department",

            ),

            user=self.request.user

        )


    def get_serializer_class(self):

        if self.request.method in [

            "PUT",

            "PATCH",

        ]:

            return (
                DoctorProfileUpdateSerializer
            )

        return DoctorSerializer


# ==========================================================
# Doctor Dashboard
#
# GET:
# /api/doctors/dashboard/
# ==========================================================

class DoctorDashboardView(
    generics.GenericAPIView
):

    permission_classes = [

        IsAuthenticated,

        IsDoctor,

    ]


    def get(
        self,
        request
    ):

        # ==================================================
        # Current Doctor
        # ==================================================

        doctor = get_object_or_404(

            Doctor.objects

            .select_related(

                "user",

                "department",

            ),

            user=request.user

        )


        today = date.today()


        # ==================================================
        # All Doctor Appointments
        # ==================================================

        appointments = (

            Appointment.objects

            .filter(
                doctor=doctor
            )

            .select_related(

                "patient",

                "patient__user",

                "slot",

            )

        )


        # ==================================================
        # Statistics
        # ==================================================

        total_appointments = (
            appointments.count()
        )


        today_appointments_count = (

            appointments

            .filter(
                appointment_date=today
            )

            .count()

        )


        pending_count = (

            appointments

            .filter(
                status="Pending"
            )

            .count()

        )


        confirmed_count = (

            appointments

            .filter(
                status="Confirmed"
            )

            .count()

        )


        completed_count = (

            appointments

            .filter(
                status="Completed"
            )

            .count()

        )


        cancelled_count = (

            appointments

            .filter(
                status="Cancelled"
            )

            .count()

        )


        # ==================================================
        # Today's Pending
        # ==================================================

        today_pending_count = (

            appointments

            .filter(

                appointment_date=today,

                status="Pending",

            )

            .count()

        )


        # ==================================================
        # Today's Confirmed
        # ==================================================

        today_confirmed_count = (

            appointments

            .filter(

                appointment_date=today,

                status="Confirmed",

            )

            .count()

        )


        # ==================================================
        # Today's Appointments
        # ==================================================

        today_appointments = (

            appointments

            .filter(
                appointment_date=today
            )

            .exclude(
                status="Cancelled"
            )

            .order_by(
                "slot__slot_time"
            )[:5]

        )


        # ==================================================
        # Upcoming Appointments
        #
        # Includes:
        # - Future appointments
        # - Today's Pending/Confirmed appointments
        # ==================================================

        upcoming_appointments = (

            appointments

            .filter(

                Q(
                    appointment_date__gt=today
                )

                |

                Q(
                    appointment_date=today,

                    status__in=[
                        "Pending",
                        "Confirmed",
                    ]
                ),

                status__in=[
                    "Pending",
                    "Confirmed",
                ],

            )

            .order_by(

                "appointment_date",

                "slot__slot_time",

            )[:5]

        )


        # ==================================================
        # Appointment Data Helper
        # ==================================================

        def appointment_data(
            appointment
        ):

            patient_name = (

                appointment.patient.user

                .get_full_name()

                .strip()

            )


            if not patient_name:

                patient_name = (
                    appointment.patient.user.username
                )


            return {

                "id":
                    appointment.id,

                "booking_number":
                    appointment.booking_number,

                "patient_name":
                    patient_name,

                "appointment_date":
                    appointment.appointment_date,

                "appointment_time":
                    appointment.slot.slot_time,

                "status":
                    appointment.status,

                "reason":
                    getattr(
                        appointment,
                        "reason",
                        ""
                    ),

                "symptoms":
                    getattr(
                        appointment,
                        "symptoms",
                        ""
                    ),

            }


        # ==================================================
        # Response
        # ==================================================

        return Response({

            # ----------------------------------------------
            # Doctor Information
            # ----------------------------------------------

            "doctor": {

                "id":
                    doctor.id,

                "name":
                    str(doctor),

                "department":
                    doctor.department.name,

                "specialization":
                    doctor.specialization,

                "consultation_fee":
                    doctor.consultation_fee,

                "is_available":
                    doctor.is_available,

            },


            # ----------------------------------------------
            # Statistics
            # ----------------------------------------------

            "statistics": {

                "total_appointments":
                    total_appointments,

                "today_appointments":
                    today_appointments_count,

                "pending":
                    pending_count,

                "confirmed":
                    confirmed_count,

                "completed":
                    completed_count,

                "cancelled":
                    cancelled_count,

                "today_pending":
                    today_pending_count,

                "today_confirmed":
                    today_confirmed_count,

            },


            # ----------------------------------------------
            # Today's Appointments
            # ----------------------------------------------

            "today_appointments": [

                appointment_data(
                    appointment
                )

                for appointment
                in today_appointments

            ],


            # ----------------------------------------------
            # Upcoming Appointments
            # ----------------------------------------------

            "upcoming_appointments": [

                appointment_data(
                    appointment
                )

                for appointment
                in upcoming_appointments

            ],

        })