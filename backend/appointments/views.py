from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentCreateView(generics.CreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer


class AppointmentListView(generics.ListAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer


class AppointmentCancelView(APIView):
    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.get(id=pk)
            appointment.status = "cancelled"
            appointment.save()

            return Response({
                "message": "Appointment cancelled successfully"
            })

        except Appointment.DoesNotExist:
            return Response({
                "error": "Appointment not found"
            })
