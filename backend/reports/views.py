from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import MedicalReport
from .serializers import MedicalReportSerializer


# ==========================================================
# Patient Medical Report List
#
# GET:
# /api/reports/patient/
# ==========================================================

class PatientMedicalReportListView(generics.ListAPIView):

    serializer_class = MedicalReportSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not hasattr(user, "patient_profile"):
            return MedicalReport.objects.none()

        return (
            MedicalReport.objects
            .select_related(
                "patient",
                "patient__user",
                "doctor",
                "doctor__user",
                "appointment",
            )
            .filter(
                patient=user.patient_profile
            )
            .order_by(
                "-uploaded_at"
            )
        )


# ==========================================================
# Patient Medical Report Details
#
# GET:
# /api/reports/<id>/
# ==========================================================

class MedicalReportDetailView(
    generics.RetrieveAPIView
):

    serializer_class = MedicalReportSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not hasattr(user, "patient_profile"):
            return MedicalReport.objects.none()

        return MedicalReport.objects.filter(
            patient=user.patient_profile
        )


# ==========================================================
# Doctor Medical Report List
#
# GET:
# /api/reports/doctor/
# ==========================================================

class DoctorMedicalReportListView(
    generics.ListAPIView
):

    serializer_class = MedicalReportSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not hasattr(user, "doctor_profile"):
            return MedicalReport.objects.none()

        return (
            MedicalReport.objects
            .select_related(
                "patient",
                "patient__user",
                "doctor",
                "doctor__user",
                "appointment",
            )
            .filter(
                doctor=user.doctor_profile
            )
            .order_by(
                "-uploaded_at"
            )
        )