from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from doctors.models import Doctor
from patients.models import PatientProfile, FamilyMember
from appointments.models import Appointment
from reports.models import MedicalReport
from payments.models import Payment


class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ==========================================
        # DEBUG INFORMATION
        # ==========================================

        print("\n========== DASHBOARD DEBUG ==========")
        print("Authenticated :", request.user.is_authenticated)
        print("User          :", request.user)
        print("User ID       :", request.user.id)
        print("Username      :", request.user.username)
        print("Role          :", getattr(request.user, "role", None))
        print("Is Active     :", request.user.is_active)
        print("=====================================\n")

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

            # Use the same status values as your Appointment model
            "pending_appointments":
            Appointment.objects.filter(status="Pending").count(),

            "completed_appointments":
            Appointment.objects.filter(status="Completed").count(),

            "cancelled_appointments":
            Appointment.objects.filter(status="Cancelled").count(),

            "total_reports":
            MedicalReport.objects.count(),

            "family_members":
            FamilyMember.objects.count(),

            "total_payments":
            total_payment,

            # Temporary hardcoded value
            "notifications":
            5,

        }

        return Response(data)
