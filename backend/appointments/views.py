from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment
from .serializers import AppointmentSerializer


# -----------------------------
# Book Appointment
# -----------------------------

class AppointmentCreateView(generics.CreateAPIView):

    queryset = Appointment.objects.all()

    serializer_class = AppointmentSerializer

    permission_classes = [IsAuthenticated]


# -----------------------------
# Patient Appointment List
# -----------------------------

class PatientAppointmentListView(generics.ListAPIView):

    serializer_class = AppointmentSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Appointment.objects.filter(

            patient=self.request.user.patientprofile

        )


# -----------------------------
# Appointment Details
# -----------------------------

class AppointmentDetailView(generics.RetrieveAPIView):

    queryset = Appointment.objects.all()

    serializer_class = AppointmentSerializer

    permission_classes = [IsAuthenticated]


# -----------------------------
# Appointment Update
# -----------------------------

class AppointmentUpdateView(generics.UpdateAPIView):

    queryset = Appointment.objects.all()

    serializer_class = AppointmentSerializer

    permission_classes = [IsAuthenticated]


# -----------------------------
# Appointment Cancel
# -----------------------------

class AppointmentCancelView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        appointment = Appointment.objects.get(id=pk)

        appointment.status = "Cancelled"

        appointment.save()

        return Response({

            "message": "Appointment cancelled."

        })


# -----------------------------
# Doctor Appointments
# -----------------------------

class DoctorAppointmentView(generics.ListAPIView):

    serializer_class = AppointmentSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Appointment.objects.filter(

            doctor__user=self.request.user

        )


# -----------------------------
# Admin Appointment List
# -----------------------------

class AdminAppointmentView(generics.ListAPIView):

    queryset = Appointment.objects.all()

    serializer_class = AppointmentSerializer

    permission_classes = [IsAuthenticated]