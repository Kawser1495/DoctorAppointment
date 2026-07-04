from rest_framework.response import Response
from rest_framework.views import APIView
from appointments.models import Appointment
from payments.models import Payment
from diagnostics.models import TestBooking

class DashboardSummaryView(APIView):
    def get(self, request):
        data = {
            "total_appointments": Appointment.objects.count(),
            "total_payments": Payment.objects.count(),
            "total_test_bookings": TestBooking.objects.count(),
        }
        return Response(data)
