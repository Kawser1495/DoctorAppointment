from datetime import datetime

from django.db import models
from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny

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
)


# ==========================================================
# Departments
# ==========================================================

class DepartmentListView(
    generics.ListAPIView
):

    queryset = (
        Department.objects
        .all()
        .order_by("name")
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
# ==========================================================

class DoctorListView(
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
# ==========================================================

class DoctorDetailView(
    generics.RetrieveAPIView
):

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

        )


# ==========================================================
# Search Doctors
# ==========================================================

class DoctorSearchView(
    generics.ListAPIView
):

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

            )

            .select_related(

                "user",

                "department",

            )

            .order_by(
                "user__first_name",
                "user__username",
            )

        )


# ==========================================================
# Doctors By Department
# ==========================================================

class DoctorByDepartmentView(
    generics.ListAPIView
):

    serializer_class = DoctorSerializer

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

                department_id=
                    department_id,

                is_available=True,

                user__is_active=True,

                user__role="doctor",

            )

            .select_related(
                "user",
                "department",
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

            return (
                TimeSlot.objects.none()
            )


        # --------------------------------------------------
        # Active Doctor + Schedule + Slot
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
        # Date Required for booking
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

                return (
                    TimeSlot.objects.none()
                )


            day_name = (
                selected_date.strftime(
                    "%A"
                )
            )


            queryset = (
                queryset.filter(
                    schedule__day=
                        day_name
                )
            )


        return queryset.order_by(
            "slot_time"
        )