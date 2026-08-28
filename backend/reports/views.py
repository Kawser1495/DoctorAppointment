from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import MedicalReport
from .serializers import MedicalReportSerializer


# ==========================================================
# Patient Medical Reports
# GET:
# /api/reports/patient/
# ==========================================================

class PatientMedicalReportListView(
    generics.ListAPIView
):

    serializer_class = MedicalReportSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        # --------------------------------------------------
        # Only Patient
        # --------------------------------------------------

        if not hasattr(
            user,
            "patient_profile"
        ):
            return MedicalReport.objects.none()

        patient = user.patient_profile

        # --------------------------------------------------
        # Patient's Reports
        # --------------------------------------------------

        return (
            MedicalReport.objects
            .select_related(
                "patient",
                "patient__user",

                "doctor",
                "doctor__user",

                "appointment",
                "appointment__family_member",

                "test_booking",
                "test_booking__diagnostic_test",
            )
            .filter(
                patient=patient
            )
            .order_by(
                "-uploaded_at"
            )
        )


# ==========================================================
# Patient Report Details
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

        if not hasattr(
            user,
            "patient_profile"
        ):
            return MedicalReport.objects.none()

        return (
            MedicalReport.objects
            .select_related(
                "patient",
                "patient__user",

                "doctor",
                "doctor__user",

                "appointment",
                "appointment__family_member",

                "test_booking",
                "test_booking__diagnostic_test",
            )
            .filter(
                patient=user.patient_profile
            )
        )


# ==========================================================
# Doctor Medical Reports
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

        if not hasattr(
            user,
            "doctor_profile"
        ):
            return MedicalReport.objects.none()

        doctor = user.doctor_profile

        return (
            MedicalReport.objects
            .select_related(
                "patient",
                "patient__user",

                "doctor",
                "doctor__user",

                "appointment",
                "appointment__family_member",

                "test_booking",
                "test_booking__diagnostic_test",
            )
            .filter(
                doctor=doctor
            )
            .order_by(
                "-uploaded_at"
            )
        )