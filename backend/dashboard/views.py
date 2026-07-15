from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from doctors.models import Doctor
from patients.models import PatientProfile
from patients.models import FamilyMember
from appointments.models import Appointment
from reports.models import MedicalReport
from payments.models import Payment


class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_payment = (
            Payment.objects.aggregate(total=Sum("amount"))["total"] or 0
        )

        data = {

            "total_doctors":
            Doctor.objects.count(),

            "total_patients":
            PatientProfile.objects.count(),

            "total_appointments":
            Appointment.objects.count(),

            "pending_appointments":
            Appointment.objects.filter(status="pending").count(),

            "completed_appointments":
            Appointment.objects.filter(status="completed").count(),

            "cancelled_appointments":
            Appointment.objects.filter(status="cancelled").count(),

            "total_reports":
            MedicalReport.objects.count(),

            "family_members":
            FamilyMember.objects.count(),

            "total_payments":
            total_payment,

            "notifications":
            5,

        }

        return Response(data)
