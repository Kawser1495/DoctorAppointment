from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment
from .serializers import AppointmentSerializer


# ==========================================
# Book Appointment
# ==========================================

class AppointmentCreateView(generics.CreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]


# ==========================================
# Patient Appointment List
# ==========================================

class PatientAppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, "patientprofile"):
            return Appointment.objects.select_related(
                "doctor",
                "slot",
                "patient"
            ).filter(
                patient=self.request.user.patientprofile
            )

        return Appointment.objects.none()


# ==========================================
# Appointment Details
# ==========================================

class AppointmentDetailView(generics.RetrieveAPIView):
    queryset = Appointment.objects.select_related(
        "doctor",
        "patient",
        "slot"
    )
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]


# ==========================================
# Update Appointment
# ==========================================

class AppointmentUpdateView(generics.UpdateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]


# ==========================================
# Cancel Appointment
# ==========================================

class AppointmentCancelView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        appointment = get_object_or_404(
            Appointment,
            id=pk
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
            slot.save()

        appointment.status = "Cancelled"
        appointment.save()

        return Response(
            {
                "success": True,
                "message": "Appointment cancelled successfully."
            },
            status=status.HTTP_200_OK
        )


# ==========================================
# Doctor Appointment List
# ==========================================

class DoctorAppointmentView(generics.ListAPIView):

    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Appointment.objects.select_related(
            "patient",
            "slot",
            "doctor"
        ).filter(
            doctor__user=self.request.user
        )


# ==========================================
# Admin Appointment List
# ==========================================

class AdminAppointmentView(generics.ListAPIView):

    queryset = Appointment.objects.select_related(
        "doctor",
        "patient",
        "slot"
    ).all()

    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]