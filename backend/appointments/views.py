from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment
from .serializers import AppointmentSerializer


# ==========================================================
# Book Appointment
# ==========================================================

class AppointmentCreateView(generics.CreateAPIView):

    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save()

    def create(self, request, *args, **kwargs):

        response = super().create(request, *args, **kwargs)

        return Response(
            {
                "success": True,
                "message": "Appointment booked successfully.",
                "data": response.data
            },
            status=status.HTTP_201_CREATED
        )


# ==========================================================
# Patient Appointment History
# ==========================================================

class PatientAppointmentListView(generics.ListAPIView):

    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if not hasattr(user, "patient_profile"):
            return Appointment.objects.none()

        return (
            Appointment.objects
            .select_related(
                "doctor",
                "doctor__user",
                "patient",
                "family_member",
                "slot",
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
# ==========================================================

class AppointmentDetailView(generics.RetrieveAPIView):

    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    queryset = (
        Appointment.objects
        .select_related(
            "doctor",
            "doctor__user",
            "patient",
            "family_member",
            "slot",
        )
    )
# ==========================================================
# Update Appointment
# ==========================================================

class AppointmentUpdateView(generics.UpdateAPIView):

    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_update(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):

        response = super().update(request, *args, **kwargs)

        return Response(
            {
                "success": True,
                "message": "Appointment updated successfully.",
                "data": response.data
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# Cancel Appointment
# ==========================================================

class AppointmentCancelView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, pk):

        appointment = get_object_or_404(
            Appointment,
            pk=pk
        )

        # Only patient can cancel own appointment
        if (
            hasattr(request.user, "patient_profile")
            and appointment.patient != request.user.patientprofile
        ):
            return Response(
                {
                    "success": False,
                    "message": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if appointment.status == "Cancelled":

            return Response(
                {
                    "success": False,
                    "message": "Appointment already cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        slot = appointment.slot

        if slot.booked_count > 0:

            slot.booked_count -= 1
            slot.save(update_fields=["booked_count"])

        appointment.status = "Cancelled"
        appointment.save(update_fields=["status"])

        return Response(
            {
                "success": True,
                "message": "Appointment cancelled successfully."
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# Doctor Appointment List
# ==========================================================

class DoctorAppointmentView(generics.ListAPIView):

    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return (
            Appointment.objects
            .select_related(
                "doctor",
                "doctor__user",
                "patient",
                "family_member",
                "slot",
            )
            .filter(
                doctor__user=self.request.user
            )
            .order_by(
                "-appointment_date",
                "-created_at"
            )
        )


# ==========================================================
# Admin Appointment List
# ==========================================================

class AdminAppointmentView(generics.ListAPIView):

    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    queryset = (
        Appointment.objects
        .select_related(
            "doctor",
            "doctor__user",
            "patient",
            "family_member",
            "slot",
        )
        .order_by(
            "-appointment_date",
            "-created_at"
        )
    )


# ==========================================================
# Appointment Status Update
# ==========================================================

class AppointmentStatusUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    VALID_STATUS = [

        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled",
        "Rejected",
        "No Show"

    ]

    @transaction.atomic
    def patch(self, request, pk):

        appointment = get_object_or_404(
            Appointment,
            pk=pk
        )

        new_status = request.data.get("status")

        if new_status not in self.VALID_STATUS:

            return Response(
                {
                    "success": False,
                    "message": "Invalid appointment status."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment.status = new_status

        appointment.save(update_fields=["status"])

        return Response(
            {
                "success": True,
                "message": "Appointment status updated successfully.",
                "status": appointment.status
            },
            status=status.HTTP_200_OK
        )