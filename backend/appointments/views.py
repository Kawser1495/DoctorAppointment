from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment
from .serializers import AppointmentSerializer
from .permissions import (
    IsAdminUser,
    IsDoctorUser,
)


# ==========================================================
# Book Appointment
# POST: /api/appointments/create/
# ==========================================================

class AppointmentCreateView(generics.CreateAPIView):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def perform_create(self, serializer):

        serializer.save()

    def create(self, request, *args, **kwargs):

        response = super().create(
            request,
            *args,
            **kwargs
        )

        return Response(
            {
                "success": True,
                "message":
                    "Appointment booked successfully.",
                "data":
                    response.data,
            },
            status=status.HTTP_201_CREATED
        )


# ==========================================================
# Patient Appointment History
# GET: /api/appointments/
# ==========================================================

class PatientAppointmentListView(
    generics.ListAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not hasattr(
            user,
            "patient_profile"
        ):

            return Appointment.objects.none()

        return (
            Appointment.objects
            .select_related(
                "doctor",
                "doctor__user",
                "doctor__department",
                "patient",
                "patient__user",
                "family_member",
                "slot",
                "slot__schedule",
            )
            .filter(
                patient=user.patient_profile
            )
            .order_by(
                "-appointment_date",
                "-created_at"
            )
        )


# ==========================================================
# Appointment Details
# GET: /api/appointments/<id>/
# ==========================================================

class AppointmentDetailView(
    generics.RetrieveAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        # --------------------------------------------------
        # Patient
        # --------------------------------------------------

        if hasattr(
            user,
            "patient_profile"
        ):

            return (
                Appointment.objects
                .select_related(
                    "doctor",
                    "doctor__user",
                    "doctor__department",
                    "patient",
                    "patient__user",
                    "family_member",
                    "slot",
                    "slot__schedule",
                )
                .filter(
                    patient=user.patient_profile
                )
            )

        # --------------------------------------------------
        # Doctor
        # --------------------------------------------------

        if (
            user.role == "doctor"
            and hasattr(
                user,
                "doctor_profile"
            )
        ):

            return (
                Appointment.objects
                .select_related(
                    "doctor",
                    "doctor__user",
                    "doctor__department",
                    "patient",
                    "patient__user",
                    "family_member",
                    "slot",
                    "slot__schedule",
                )
                .filter(
                    doctor=user.doctor_profile
                )
            )

        # --------------------------------------------------
        # Admin
        # --------------------------------------------------

        if user.is_staff:

            return (
                Appointment.objects
                .select_related(
                    "doctor",
                    "doctor__user",
                    "doctor__department",
                    "patient",
                    "patient__user",
                    "family_member",
                    "slot",
                    "slot__schedule",
                )
            )

        return Appointment.objects.none()


# ==========================================================
# Update Appointment
# PUT/PATCH: /api/appointments/<id>/update/
# ==========================================================

class AppointmentUpdateView(
    generics.UpdateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not hasattr(
            user,
            "patient_profile"
        ):

            return Appointment.objects.none()

        return Appointment.objects.filter(
            patient=user.patient_profile
        )

    @transaction.atomic
    def perform_update(self, serializer):

        appointment = self.get_object()

        # --------------------------------------------------
        # Don't allow modification of finished appointments
        # --------------------------------------------------

        if appointment.status in [
            "Completed",
            "Cancelled",
            "Rejected",
            "No Show",
        ]:

            from rest_framework.exceptions import ValidationError

            raise ValidationError({
                "detail":
                    "This appointment can no longer be updated."
            })

        serializer.save()

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        response = super().update(
            request,
            *args,
            **kwargs
        )

        return Response(
            {
                "success": True,
                "message":
                    "Appointment updated successfully.",
                "data":
                    response.data,
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# Cancel Appointment
# PATCH: /api/appointments/<id>/cancel/
# ==========================================================

class AppointmentCancelView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def patch(
        self,
        request,
        pk
    ):

        # --------------------------------------------------
        # Patient Profile
        # --------------------------------------------------

        if not hasattr(
            request.user,
            "patient_profile"
        ):

            return Response(
                {
                    "success": False,
                    "message":
                        "Patient profile not found."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------
        # Get Own Appointment
        # --------------------------------------------------

        appointment = get_object_or_404(
            Appointment.objects.select_related(
                "slot"
            ),
            pk=pk,
            patient=request.user.patient_profile
        )

        # --------------------------------------------------
        # Already Cancelled
        # --------------------------------------------------

        if appointment.status == "Cancelled":

            return Response(
                {
                    "success": False,
                    "message":
                        "Appointment already cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Cannot Cancel Completed
        # --------------------------------------------------

        if appointment.status in [
            "Completed",
            "No Show",
            "Rejected",
        ]:

            return Response(
                {
                    "success": False,
                    "message":
                        "This appointment cannot be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Reduce Slot Count
        # --------------------------------------------------

        slot = appointment.slot

        if slot.booked_count > 0:

            slot.booked_count -= 1

            slot.save(
                update_fields=[
                    "booked_count"
                ]
            )

        # --------------------------------------------------
        # Cancel Appointment
        # --------------------------------------------------

        appointment.status = "Cancelled"

        appointment.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "success": True,
                "message":
                    "Appointment cancelled successfully.",
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# Doctor Appointment List
# GET: /api/appointments/doctor/
# ==========================================================

class DoctorAppointmentView(
    generics.ListAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsDoctorUser
    ]

    def get_queryset(self):

        return (
            Appointment.objects
            .select_related(
                "doctor",
                "doctor__user",
                "doctor__department",
                "patient",
                "patient__user",
                "family_member",
                "slot",
                "slot__schedule",
            )
            .filter(
                doctor=self.request.user.doctor_profile
            )
            .order_by(
                "-appointment_date",
                "-created_at"
            )
        )


# ==========================================================
# Admin Appointment List
# GET: /api/appointments/admin/
# ==========================================================

class AdminAppointmentView(
    generics.ListAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAdminUser
    ]

    queryset = (
        Appointment.objects
        .select_related(
            "doctor",
            "doctor__user",
            "doctor__department",
            "patient",
            "patient__user",
            "family_member",
            "slot",
            "slot__schedule",
        )
        .order_by(
            "-appointment_date",
            "-created_at"
        )
    )


# ==========================================================
# Appointment Status Update
# PATCH: /api/appointments/<id>/status/
# ==========================================================

class AppointmentStatusUpdateView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    VALID_STATUS = [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled",
        "Rejected",
        "No Show",
    ]

    @transaction.atomic
    def patch(
        self,
        request,
        pk
    ):

        appointment = get_object_or_404(
            Appointment,
            pk=pk
        )

        # ==================================================
        # Permission
        # ==================================================

        user = request.user

        is_admin = (
            user.is_staff
        )

        is_doctor = (
            user.role == "doctor"
            and hasattr(
                user,
                "doctor_profile"
            )
            and appointment.doctor
            == user.doctor_profile
        )

        if not (
            is_admin
            or is_doctor
        ):

            return Response(
                {
                    "success": False,
                    "message":
                        "Only the assigned doctor or admin can update appointment status."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ==================================================
        # New Status
        # ==================================================

        new_status = request.data.get(
            "status"
        )

        if new_status not in self.VALID_STATUS:

            return Response(
                {
                    "success": False,
                    "message":
                        "Invalid appointment status."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ==================================================
        # Prevent unnecessary update
        # ==================================================

        if appointment.status == new_status:

            return Response(
                {
                    "success": False,
                    "message":
                        f"Appointment is already {new_status}."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ==================================================
        # Cancellation / Rejection
        # ==================================================

        if new_status in [
            "Cancelled",
            "Rejected",
        ]:

            slot = appointment.slot

            if slot.booked_count > 0:

                slot.booked_count -= 1

                slot.save(
                    update_fields=[
                        "booked_count"
                    ]
                )

        # ==================================================
        # Update Status
        # ==================================================

        appointment.status = new_status

        appointment.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "success": True,
                "message":
                    "Appointment status updated successfully.",
                "appointment_id":
                    appointment.id,
                "status":
                    appointment.status,
            },
            status=status.HTTP_200_OK
        )