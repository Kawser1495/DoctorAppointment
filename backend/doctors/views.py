from datetime import datetime, date

from django.db import models
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
    JSONParser,
)
from rest_framework.response import Response

from accounts.models import CustomUser
from accounts.permissions import IsAdmin, IsDoctor

from appointments.models import Appointment

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

class DepartmentListView(generics.ListAPIView):

    queryset = (
        Department.objects
        .all()
        .order_by("name")
    )

    serializer_class = DepartmentSerializer

    permission_classes = [
        AllowAny
    ]

    pagination_class = None


# ==========================================================
# All Available Approved Doctors
#
# GET:
# /api/doctors/doctors/
# ==========================================================

class DoctorListView(generics.ListAPIView):

    serializer_class = DoctorSerializer

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
                approval_status="approved",
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

class DoctorDetailView(generics.RetrieveAPIView):

    serializer_class = DoctorSerializer

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

            id=self.kwargs.get("pk"),

            is_available=True,

            user__is_active=True,

            user__role="doctor",

            approval_status="approved",
        )


# ==========================================================
# Search Approved Doctors
#
# GET:
# /api/doctors/search/?search=cardiology
# ==========================================================

class DoctorSearchView(generics.ListAPIView):

    serializer_class = DoctorSerializer

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
                approval_status="approved",
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

class DoctorByDepartmentView(generics.ListAPIView):

    serializer_class = DoctorSerializer

    permission_classes = [
        AllowAny
    ]

    pagination_class = None

    def get_queryset(self):

        department_id = self.kwargs.get(
            "department_id"
        )

        return (
            Doctor.objects
            .filter(
                department_id=department_id,
                is_available=True,
                user__is_active=True,
                user__role="doctor",
                approval_status="approved",
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

class DoctorScheduleListView(generics.ListAPIView):

    serializer_class = DoctorScheduleSerializer

    permission_classes = [
        AllowAny
    ]

    pagination_class = None

    def get_queryset(self):

        doctor_id = self.kwargs.get(
            "doctor_id"
        )

        return (
            DoctorSchedule.objects
            .filter(
                doctor_id=doctor_id,
                doctor__is_available=True,
                doctor__user__is_active=True,
                doctor__user__role="doctor",
                doctor__approval_status="approved",
                is_active=True,
            )
            .select_related(
                "doctor",
                "doctor__user",
            )
            .prefetch_related(
                "slots"
            )
            .order_by(
                "day",
                "start_time",
            )
        )


# ==========================================================
# Doctor Schedule Management
#
# GET:
# /api/doctors/me/schedules/
#
# POST:
# /api/doctors/me/schedules/
#
# PUT/PATCH:
# /api/doctors/me/schedules/<id>/
#
# DELETE:
# /api/doctors/me/schedules/<id>/
# ==========================================================

class DoctorScheduleManageView(
    generics.ListCreateAPIView,
    generics.RetrieveUpdateDestroyAPIView,
):

    serializer_class = DoctorScheduleSerializer

    permission_classes = [
        IsAuthenticated,
        IsDoctor,
    ]

    pagination_class = None

    def get_queryset(self):

        return (
            DoctorSchedule.objects
            .filter(
                doctor__user=self.request.user,
            )
            .select_related(
                "doctor",
                "doctor__user",
            )
            .prefetch_related(
                "slots"
            )
            .order_by(
                "day",
                "start_time",
            )
        )

    def perform_create(self, serializer):

        doctor = get_object_or_404(
            Doctor,
            user=self.request.user,
            user__role="doctor",
        )

        if doctor.approval_status != "approved":

            raise ValidationError({
                "detail":
                "Your doctor account must be approved "
                "before creating a schedule."
            })

        serializer.save(
            doctor=doctor
        )


# ==========================================================
# Available Time Slots
#
# GET:
# /api/doctors/time-slots/?doctor=1&date=2026-08-31
# ==========================================================

class AvailableTimeSlotAPIView(generics.ListAPIView):

    serializer_class = TimeSlotSerializer

    permission_classes = [
        AllowAny
    ]

    pagination_class = None

    def get_queryset(self):

        doctor_id = (
            self.request
            .query_params
            .get("doctor")
        )

        appointment_date = (
            self.request
            .query_params
            .get("date")
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
                schedule__doctor_id=doctor_id,

                schedule__doctor__is_available=True,

                schedule__doctor__user__is_active=True,

                schedule__doctor__user__role="doctor",

                schedule__doctor__approval_status="approved",

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

                selected_date = datetime.strptime(
                    appointment_date,
                    "%Y-%m-%d",
                ).date()

            except ValueError:

                raise ValidationError({
                    "date":
                    "Invalid date format. Use YYYY-MM-DD."
                })

            day_name = selected_date.strftime(
                "%A"
            )

            queryset = queryset.filter(
                schedule__day=day_name
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
            user=self.request.user,
        )

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:

            return DoctorProfileUpdateSerializer

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

    def get(self, request):

        # ==================================================
        # Current Doctor
        # ==================================================

        doctor = get_object_or_404(
            Doctor.objects
            .select_related(
                "user",
                "department",
            ),
            user=request.user,
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

        total_appointments = appointments.count()

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

        today_pending_count = (
            appointments
            .filter(
                appointment_date=today,
                status="Pending",
            )
            .count()
        )

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
                    ],
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

        def appointment_data(appointment):

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
                    "",
                ),

                "symptoms":
                getattr(
                    appointment,
                    "symptoms",
                    "",
                ),
            }

        # ==================================================
        # Response
        # ==================================================

        return Response({

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

                "doctor_status":
                doctor.approval_status,

                "doctor_rejection_reason":
                doctor.rejection_reason,

            },

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

            "today_appointments": [
                appointment_data(appointment)
                for appointment in today_appointments
            ],

            "upcoming_appointments": [
                appointment_data(appointment)
                for appointment in upcoming_appointments
            ],

        })


# ==========================================================
# Admin Pending Doctor List
#
# GET:
# /api/doctors/admin/pending/
# ==========================================================

class AdminPendingDoctorListView(
    generics.ListAPIView
):

    serializer_class = DoctorSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    pagination_class = None

    def get_queryset(self):

        return (
            Doctor.objects
            .filter(
                user__role="doctor",
                approval_status="pending",
            )
            .select_related(
                "user",
                "department",
            )
            .order_by(
                "-created_at"
            )
        )


# ==========================================================
# Admin All Doctors
#
# GET:
# /api/doctors/admin/all/
# ==========================================================

class AdminDoctorListView(
    generics.ListAPIView
):

    serializer_class = DoctorSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    pagination_class = None

    def get_queryset(self):

        return (
            Doctor.objects
            .filter(
                user__role="doctor",
            )
            .select_related(
                "user",
                "department",
            )
            .order_by(
                "-created_at"
            )
        )


# ==========================================================
# Public Approved Doctor List
#
# GET:
# /api/doctors/public/
# ==========================================================

class PublicDoctorListView(
    generics.ListAPIView
):

    serializer_class = DoctorSerializer

    permission_classes = [
        AllowAny
    ]

    pagination_class = None

    def get_queryset(self):

        return (
            Doctor.objects
            .filter(
                user__role="doctor",
                approval_status="approved",
                user__is_active=True,
                is_available=True,
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
                "user__last_name",
            )
        )


# ==========================================================
# Admin Approve Doctor
#
# POST:
# /api/doctors/admin/<doctor_id>/approve/
# ==========================================================

class AdminApproveDoctorView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def post(self, request, doctor_id):

        try:

            doctor = (
                Doctor.objects
                .select_related("user")
                .get(
                    id=doctor_id,
                    user__role="doctor",
                )
            )

        except Doctor.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Doctor not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        doctor.user.doctor_status = "approved"

        doctor.user.is_active = True

        doctor.user.is_verified = True

        doctor.user.doctor_rejection_reason = ""

        doctor.approval_status = "approved"
        doctor.rejection_reason = ""
        doctor.approved_at = timezone.now()

        doctor.save(
            update_fields=[
                "approval_status",
                "rejection_reason",
                "approved_at",
                "updated_at",
            ]
        )

        doctor.user.save(
            update_fields=[
                "doctor_status",
                "is_active",
                "is_verified",
                "doctor_rejection_reason",
                "updated_at",
            ]
        )

        return Response(
            {
                "message":
                "Doctor approved successfully.",

                "doctor_id":
                doctor.id,

                "doctor_status":
                doctor.user.doctor_status,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# Admin Reject Doctor
#
# POST:
# /api/doctors/admin/<doctor_id>/reject/
# ==========================================================

class AdminRejectDoctorView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def post(self, request, doctor_id):

        try:

            doctor = (
                Doctor.objects
                .select_related("user")
                .get(
                    id=doctor_id,
                    user__role="doctor",
                )
            )

        except Doctor.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Doctor not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        rejection_reason = request.data.get(
            "rejection_reason"
        )

        if not rejection_reason:

            rejection_reason = (
                "Please provide a valid medical "
                "registration number."
            )

        doctor.user.doctor_status = "rejected"

        doctor.user.is_active = False

        doctor.user.is_verified = False

        doctor.user.doctor_rejection_reason = (
            rejection_reason
        )

        doctor.approval_status = "rejected"
        doctor.rejection_reason = rejection_reason
        doctor.approved_at = None

        doctor.save(
            update_fields=[
                "approval_status",
                "rejection_reason",
                "approved_at",
                "updated_at",
            ]
        )

        doctor.user.save(
            update_fields=[
                "doctor_status",
                "is_active",
                "is_verified",
                "doctor_rejection_reason",
                "updated_at",
            ]
        )

        return Response(
            {
                "message":
                "Doctor rejected successfully.",

                "doctor_id":
                doctor.id,

                "doctor_status":
                doctor.user.doctor_status,

                "rejection_reason":
                doctor.user.doctor_rejection_reason,
            },
            status=status.HTTP_200_OK,
        )