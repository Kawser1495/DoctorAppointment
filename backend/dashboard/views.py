from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from doctors.models import Doctor
from patients.models import PatientProfile
from appointments.models import Appointment
from reports.models import MedicalReport
from payments.models import Payment


class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = {

            "total_doctors":
            Doctor.objects.count(),

            "total_patients":
            PatientProfile.objects.count(),

            "total_appointments":
            Appointment.objects.count(),

            "pending_appointments":
            Appointment.objects.filter(status="Pending").count(),

            "completed_appointments":
            Appointment.objects.filter(status="Completed").count(),

            "cancelled_appointments":
            Appointment.objects.filter(status="Cancelled").count(),

            "total_reports":
            MedicalReport.objects.count(),

            "total_payments":
            sum(
                payment.amount
                for payment in Payment.objects.all()
            ),

        }

        return Response(data)
