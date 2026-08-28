from rest_framework import serializers

from .models import MedicalReport


class MedicalReportSerializer(serializers.ModelSerializer):

    # ======================================================
    # Display Information
    # ======================================================

    patient_name = serializers.SerializerMethodField()

    doctor_name = serializers.SerializerMethodField()

    for_name = serializers.SerializerMethodField()

    appointment_booking = serializers.CharField(
        source="appointment.booking_number",
        read_only=True,
        allow_null=True,
    )

    diagnostic_booking_number = serializers.CharField(
        source="test_booking.booking_number",
        read_only=True,
        allow_null=True,
    )

    diagnostic_test_name = serializers.CharField(
        source="test_booking.diagnostic_test.name",
        read_only=True,
        allow_null=True,
    )

    # ======================================================
    # File URL
    # ======================================================

    report_file_url = serializers.SerializerMethodField()

    class Meta:

        model = MedicalReport

        fields = [

            "id",

            # Report
            "report_type",
            "report_title",

            # Patient
            "patient",
            "patient_name",
            "for_name",

            # Doctor
            "doctor",
            "doctor_name",

            # Appointment
            "appointment",
            "appointment_booking",

            # Diagnostic
            "test_booking",
            "diagnostic_booking_number",
            "diagnostic_test_name",

            # Content
            "prescription",
            "remarks",

            # File
            "report_file",
            "report_file_url",

            # Date
            "uploaded_at",
        ]

        read_only_fields = [

            "id",

            "patient",
            "patient_name",
            "for_name",

            "doctor",
            "doctor_name",

            "appointment_booking",

            "diagnostic_booking_number",
            "diagnostic_test_name",

            "report_file_url",

            "uploaded_at",
        ]

    # ======================================================
    # Patient Name
    # ======================================================

    def get_patient_name(self, obj):

        if not obj.patient:
            return None

        user = obj.patient.user

        full_name = user.get_full_name().strip()

        if full_name:
            return full_name

        return user.username

    # ======================================================
    # For
    #
    # Self Appointment:
    #     Kawser Talukder
    #
    # Family Appointment:
    #     Mother
    # ======================================================

    def get_for_name(self, obj):

        appointment = obj.appointment

        if (
            appointment
            and appointment.family_member
        ):
            return appointment.family_member.name

        return self.get_patient_name(obj)

    # ======================================================
    # Doctor Name
    # ======================================================

    def get_doctor_name(self, obj):

        if not obj.doctor:
            return None

        user = obj.doctor.user

        full_name = user.get_full_name().strip()

        if full_name:
            return f"Dr. {full_name}"

        return f"Dr. {user.username}"

    # ======================================================
    # Report File URL
    # ======================================================

    def get_report_file_url(self, obj):

        if not obj.report_file:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.report_file.url
            )

        return obj.report_file.url