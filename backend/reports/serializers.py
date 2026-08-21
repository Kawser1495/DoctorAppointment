from rest_framework import serializers

from .models import MedicalReport


class MedicalReportSerializer(serializers.ModelSerializer):

    # ==========================================================
    # Read-Only Information
    # ==========================================================

    patient_name = serializers.SerializerMethodField()

    doctor_name = serializers.SerializerMethodField()

    appointment_booking = serializers.CharField(
        source="appointment.booking_number",
        read_only=True,
    )

    # ==========================================================
    # Meta
    # ==========================================================

    class Meta:

        model = MedicalReport

        fields = [
            "id",

            # Patient
            "patient",
            "patient_name",

            # Doctor
            "doctor",
            "doctor_name",

            # Appointment
            "appointment",
            "appointment_booking",

            # Report
            "report_title",
            "report_file",
            "prescription",
            "remarks",

            "uploaded_at",
        ]

        read_only_fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "appointment_booking",
            "uploaded_at",
        ]

    # ==========================================================
    # Patient Name
    # ==========================================================

    def get_patient_name(self, obj):

        full_name = obj.patient.user.get_full_name()

        if full_name:
            return full_name

        return obj.patient.user.username

    # ==========================================================
    # Doctor Name
    # ==========================================================

    def get_doctor_name(self, obj):

        full_name = obj.doctor.user.get_full_name()

        if full_name:
            return f"Dr. {full_name}"

        return f"Dr. {obj.doctor.user.username}"