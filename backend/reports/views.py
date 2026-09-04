from rest_framework import generics

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.exceptions import (
    ValidationError,
    PermissionDenied,
)

from .models import (
    MedicalReport,
)

from .serializers import (
    MedicalReportSerializer,
)


# ==========================================================
# Base Queryset
# ==========================================================

def get_report_queryset():

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

        .order_by(

            "-uploaded_at"

        )

    )


# ==========================================================
# Patient Medical Reports
#
# GET:
# /api/reports/patient/
# ==========================================================

class PatientMedicalReportListView(
    generics.ListAPIView
):

    serializer_class = (
        MedicalReportSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]


    def get_queryset(self):

        user = (
            self.request.user
        )


        # --------------------------------------------------
        # Verify Patient
        # --------------------------------------------------

        if not hasattr(
            user,
            "patient_profile"
        ):

            return (
                MedicalReport.objects.none()
            )


        patient = (
            user.patient_profile
        )


        # --------------------------------------------------
        # Return ALL Reports
        #
        # Medical
        # Diagnostic
        # Prescription
        # --------------------------------------------------

        return (

            get_report_queryset()

            .filter(

                patient=patient

            )

        )


# ==========================================================
# Patient Single Report
#
# GET:
# /api/reports/<id>/
# ==========================================================

class MedicalReportDetailView(
    generics.RetrieveAPIView
):

    serializer_class = (
        MedicalReportSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]


    def get_queryset(self):

        user = (
            self.request.user
        )


        if not hasattr(
            user,
            "patient_profile"
        ):

            return (
                MedicalReport.objects.none()
            )


        return (

            get_report_queryset()

            .filter(

                patient=
                user.patient_profile

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

    serializer_class = (
        MedicalReportSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]


    def get_queryset(self):

        user = (
            self.request.user
        )


        # --------------------------------------------------
        # Verify Doctor
        # --------------------------------------------------

        if not hasattr(
            user,
            "doctor_profile"
        ):

            return (
                MedicalReport.objects.none()
            )


        doctor = (
            user.doctor_profile
        )


        return (

            get_report_queryset()

            .filter(

                doctor=doctor

            )

        )


# ==========================================================
# Doctor Create Medical Report
#
# POST:
# /api/reports/doctor/create/
# ==========================================================

class DoctorMedicalReportCreateView(
    generics.CreateAPIView
):

    serializer_class = (
        MedicalReportSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]


    def perform_create(
        self,
        serializer
    ):

        user = (
            self.request.user
        )


        # --------------------------------------------------
        # Verify Doctor
        # --------------------------------------------------

        if not hasattr(
            user,
            "doctor_profile"
        ):

            raise PermissionDenied(

                "Only doctors can create medical reports."

            )


        doctor = (
            user.doctor_profile
        )


        # --------------------------------------------------
        # Get Appointment
        # --------------------------------------------------

        appointment = (

            serializer.validated_data.get(

                "appointment"

            )

        )


        if not appointment:

            raise ValidationError({

                "appointment":

                "Appointment is required."

            })


        # --------------------------------------------------
        # Verify Appointment Doctor
        # --------------------------------------------------

        if (

            appointment.doctor_id
            !=
            doctor.id

        ):

            raise PermissionDenied(

                "You can only create reports for your own appointments."

            )


        # --------------------------------------------------
        # Appointment Status
        # --------------------------------------------------

        allowed_statuses = [

            "Confirmed",

            "Completed",

        ]


        if (

            appointment.status
            not in
            allowed_statuses

        ):

            raise ValidationError({

                "appointment":

                (
                    "Medical reports can only be created "
                    "for confirmed or completed appointments."
                ),

            })


        # --------------------------------------------------
        # Verify Patient Exists
        # --------------------------------------------------

        if not appointment.patient:

            raise ValidationError({

                "appointment":

                "This appointment does not have a valid patient."

            })


        # --------------------------------------------------
        # Automatically Assign
        #
        # Never trust frontend for:
        # - patient
        # - doctor
        # --------------------------------------------------

        serializer.save(

            patient=
            appointment.patient,

            doctor=
            doctor,

            appointment=
            appointment,

        )


# ==========================================================
# Doctor Medical Report Detail
#
# GET
# PATCH
# DELETE
#
# /api/reports/doctor/<id>/
# ==========================================================

class DoctorMedicalReportDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = (
        MedicalReportSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]


    def get_queryset(self):

        user = (
            self.request.user
        )


        if not hasattr(
            user,
            "doctor_profile"
        ):

            return (
                MedicalReport.objects.none()
            )


        return (

            get_report_queryset()

            .filter(

                doctor=
                user.doctor_profile

            )

        )


    # ======================================================
    # Secure Update
    # ======================================================

    def perform_update(
        self,
        serializer
    ):

        report = (
            self.get_object()
        )


        serializer.save(

            patient=
            report.patient,

            doctor=
            report.doctor,

            appointment=
            report.appointment,

            test_booking=
            report.test_booking,

        )