from rest_framework import generics
from django.db.models import Q
from rest_framework.views import APIView

from rest_framework.permissions import (
    IsAuthenticated,
)
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status

from rest_framework.exceptions import (
    ValidationError,
    PermissionDenied,
)

from .models import (
    FeedbackMessage,
    MedicalReport,
)

from .serializers import (
    FeedbackMessageSerializer,
    MedicalReportSerializer,
)

from accounts.permissions import IsAdmin
from appointments.models import Appointment
from notifications.models import Notification


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
            "test_booking__appointment",
            "test_booking__appointment__doctor",
            "test_booking__appointment__doctor__user",

        )

        .order_by(

            "-uploaded_at"

        )

    )


def notify_published_report(report):
    patient_name = report.patient.user.get_full_name() or report.patient.user.username
    is_diagnostic = report.report_type == "Diagnostic" or bool(report.test_booking)
    report_kind = "diagnostic test result" if is_diagnostic else "medical report"

    Notification.objects.create(
        user=report.patient.user,
        notification_type="Diagnostic" if is_diagnostic else "Report",
        title="Diagnostic test result available" if is_diagnostic else "Medical report available",
        message=f"Your {report_kind} '{report.report_title}' is now available to view.",
        is_read=False,
    )

    doctor = report.doctor
    if not doctor and report.appointment:
        doctor = report.appointment.doctor
    if not doctor and report.test_booking and report.test_booking.appointment:
        doctor = report.test_booking.appointment.doctor
    if doctor:
        Notification.objects.create(
            user=doctor.user,
            notification_type="Diagnostic" if is_diagnostic else "Report",
            title="Patient diagnostic result available" if is_diagnostic else "Patient report available",
            message=f"A {report_kind} for {patient_name} is now available.",
            is_read=False,
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

                patient=patient,
                report_status="Published",

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
                Q(report_type="Medical", admin_managed=False)
                | Q(report_type="Diagnostic")
            )
            .filter(
                Q(doctor=doctor)
                | Q(appointment__doctor=doctor)
                | Q(test_booking__appointment__doctor=doctor)
            )
            .distinct()

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


class AdminMedicalReportListView(generics.ListAPIView):

    serializer_class = MedicalReportSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = None

    def get_queryset(self):
        return get_report_queryset()


class AdminMedicalReportStatusView(generics.UpdateAPIView):

    serializer_class = MedicalReportSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return get_report_queryset()

    def patch(self, request, *args, **kwargs):
        report = self.get_object()
        previous_status = report.report_status
        next_status = request.data.get("report_status")
        valid_statuses = dict(MedicalReport.REPORT_STATUS_CHOICES)

        if next_status not in valid_statuses:
            return Response(
                {"detail": "Invalid report status."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.report_status = next_status
        if report.report_type == "Diagnostic" and report.diagnostic_result:
            report.admin_result_published = True
        report.save(update_fields=["report_status", "admin_result_published"])
        has_publishable_content = (
            report.report_type != "Diagnostic"
            or bool(report.diagnostic_result or report.report_file)
        )
        if next_status == "Published" and previous_status != "Published" and has_publishable_content:
            notify_published_report(report)
        return Response(
            MedicalReportSerializer(
                report,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )


class AdminMedicalReportUpdateView(generics.UpdateAPIView):
    serializer_class = MedicalReportSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    http_method_names = ["patch", "options"]

    def get_queryset(self):
        return get_report_queryset()

    def perform_update(self, serializer):
        previous_report = self.get_object()
        previous_status = previous_report.report_status
        previous_result = previous_report.diagnostic_result
        previous_file = bool(previous_report.report_file)
        report = serializer.save(
            admin_managed=True,
            admin_result_published=(
                previous_report.report_type == "Diagnostic"
                and bool(
                    serializer.validated_data.get("diagnostic_result", previous_result)
                    or serializer.validated_data.get("report_file", previous_report.report_file)
                )
            )
        )
        result_was_added = report.diagnostic_result != previous_result
        file_was_added = bool(report.report_file) and not previous_file
        has_publishable_content = (
            report.report_type != "Diagnostic"
            or bool(report.diagnostic_result or report.report_file)
        )
        if report.report_status == "Published" and has_publishable_content and (previous_status != "Published" or result_was_added or file_was_added):
            notify_published_report(report)

class FeedbackMessageListView(generics.ListAPIView):
    serializer_class = FeedbackMessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        queryset = FeedbackMessage.objects.select_related(
            "doctor__user",
            "patient__user",
            "appointment",
        )
        if hasattr(user, "doctor_profile"):
            return queryset.filter(doctor=user.doctor_profile)
        if hasattr(user, "patient_profile"):
            return queryset.filter(patient=user.patient_profile)
        return queryset.none()


class FeedbackMessageCreateView(generics.CreateAPIView):
    serializer_class = FeedbackMessageSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        appointment_id = request.data.get("appointment")
        message = str(request.data.get("message", "")).strip()

        if not appointment_id or not message:
            return Response(
                {"detail": "Appointment and message are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment = get_object_or_404(
            Appointment.objects.select_related("doctor", "patient"),
            pk=appointment_id,
        )
        user = request.user

        if hasattr(user, "doctor_profile") and appointment.doctor_id == user.doctor_profile.id:
            sender = "Doctor"
        elif hasattr(user, "patient_profile") and appointment.patient_id == user.patient_profile.id:
            sender = "Patient"
        else:
            raise PermissionDenied("You do not have access to this appointment conversation.")

        feedback = FeedbackMessage.objects.create(
            doctor=appointment.doctor,
            patient=appointment.patient,
            appointment=appointment,
            sender=sender,
            message=message,
        )

        return Response(
            FeedbackMessageSerializer(
                feedback,
                context={"request": request},
            ).data,
            status=status.HTTP_201_CREATED,
        )


class FeedbackMessageClearView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        if hasattr(request.user, "doctor_profile"):
            deleted, _ = FeedbackMessage.objects.filter(
                doctor=request.user.doctor_profile,
                sender="Doctor",
            ).delete()
        elif hasattr(request.user, "patient_profile"):
            deleted, _ = FeedbackMessage.objects.filter(
                patient=request.user.patient_profile,
                sender="Patient",
            ).delete()
        else:
            return Response(
                {"detail": "Feedback access is not available for this user."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({"deleted": deleted}, status=status.HTTP_200_OK)