import json

from django.utils import timezone
from rest_framework import serializers

from .models import (
    FeedbackMessage,
    MedicalReport,
)


class MedicalReportSerializer(
    serializers.ModelSerializer
):

    # ======================================================
    # Display Information
    # ======================================================

    patient_name = (
        serializers.SerializerMethodField()
    )


    doctor_name = (
        serializers.SerializerMethodField()
    )

    doctor_profile = (
        serializers.SerializerMethodField()
    )


    for_name = (
        serializers.SerializerMethodField()
    )

    patient_profile = (
        serializers.SerializerMethodField()
    )


    appointment_booking = (
        serializers.CharField(

            source=
            "appointment.booking_number",

            read_only=True,

            allow_null=True,

        )
    )


    diagnostic_booking_number = (
        serializers.CharField(

            source=
            "test_booking.booking_number",

            read_only=True,

            allow_null=True,

        )
    )


    diagnostic_test_name = (
        serializers.CharField(

            source=
            "test_booking.diagnostic_test.name",

            read_only=True,

            allow_null=True,

        )
    )


    # ======================================================
    # File URL
    # ======================================================

    report_file_url = (
        serializers.SerializerMethodField()
    )


    class Meta:

        model = (
            MedicalReport
        )


        fields = [

            "id",

            # Report
            "report_type",
            "report_title",
            "report_status",

            "medicines",
            "clinical_history",
            "vitals",
            "diagnostic_tests",
            "diagnostic_result",
            "admin_result_published",
            "admin_managed",
            "symptoms",
            "advice",
            "follow_up_date",

            # Patient
            "patient",
            "patient_name",
            "for_name",
            "patient_profile",

            # Doctor
            "doctor",
            "doctor_name",
            "doctor_profile",

            # Appointment
            "appointment",
            "appointment_booking",

            # Diagnostic
            "test_booking",
            "diagnostic_booking_number",
            "diagnostic_test_name",

            "admin_result_published",

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

            "admin_managed",

        ]

    def validate_medicines(self, value):

        if value is None:
            return []

        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError as error:
                raise serializers.ValidationError(
                    "Medicines must be valid JSON."
                ) from error

        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Medicines must be a list."
            )

        cleaned_medicines = []

        for medicine in value:

            if not isinstance(medicine, dict):
                raise serializers.ValidationError(
                    "Each medicine must be an object."
                )

            name = str(medicine.get("name", "")).strip()

            if not name:
                raise serializers.ValidationError(
                    "Every medicine must have a name."
                )

            cleaned_medicines.append({
                "name": name,
                "dosage": str(medicine.get("dosage", "")).strip(),
                "frequency": str(medicine.get("frequency", "")).strip(),
                "timing": str(medicine.get("timing", "")).strip(),
                "duration": str(medicine.get("duration", "")).strip(),
                "instructions": str(medicine.get("instructions", "")).strip(),
            })

        return cleaned_medicines

    def validate_vitals(self, value):
        if value in (None, ""):
            return {}

        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError as error:
                raise serializers.ValidationError(
                    "Vitals must be valid JSON."
                ) from error

        if not isinstance(value, dict):
            raise serializers.ValidationError("Vitals must be an object.")

        return {
            str(key): str(item).strip()
            for key, item in value.items()
            if str(item).strip()
        }

    def validate_diagnostic_tests(self, value):
        if value in (None, ""):
            return []

        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError as error:
                raise serializers.ValidationError(
                    "Diagnostic tests must be valid JSON."
                ) from error

        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Diagnostic tests must be a list."
            )

        cleaned_tests = []
        for test in value:
            if not isinstance(test, dict):
                raise serializers.ValidationError(
                    "Each diagnostic test must be an object."
                )

            name = str(test.get("name", "")).strip()
            if not name:
                raise serializers.ValidationError(
                    "Every diagnostic test must have a name."
                )

            cleaned_tests.append({
                "name": name,
                "instructions": str(test.get("instructions", "")).strip(),
                "urgency": str(test.get("urgency", "Routine")).strip() or "Routine",
            })

        return cleaned_tests

    def validate_appointment(self, value):

        request = self.context.get("request")
        doctor = getattr(request.user, "doctor_profile", None) if request else None

        if doctor and value.doctor_id != doctor.id:
            raise serializers.ValidationError(
                "You can only use your own appointments."
            )

        return value

    def validate_follow_up_date(self, value):

        if value and value < timezone.localdate():
            raise serializers.ValidationError(
                "Follow-up date cannot be in the past."
            )

        return value


    # ======================================================
    # Patient Name
    # ======================================================

    def get_patient_name(
        self,
        obj
    ):

        if not obj.patient:

            return None


        user = (
            obj.patient.user
        )


        full_name = (
            user.get_full_name()
            .strip()
        )


        return (

            full_name

            or

            user.username

        )


    # ======================================================
    # Appointment For Name
    # ======================================================

    def get_for_name(
        self,
        obj
    ):

        appointment = (
            obj.appointment
        )


        if (

            appointment

            and

            appointment.family_member

        ):

            return (
                appointment
                .family_member
                .name
            )


        return (
            self.get_patient_name(
                obj
            )
        )


    # ======================================================
    # Doctor Name
    # ======================================================

    def get_doctor_name(
        self,
        obj
    ):

        doctor = obj.doctor
        if not doctor and obj.test_booking and obj.test_booking.appointment:
            doctor = obj.test_booking.appointment.doctor
        if not doctor and obj.appointment:
            doctor = obj.appointment.doctor

        if not doctor:

            return (
                "Doctor"
            )


        user = (
            doctor.user
        )


        full_name = (
            user.get_full_name()
            .strip()
        )


        if full_name:

            return (
                f"Dr. {full_name}"
            )


        return (
            f"Dr. {user.username}"
        )

    def get_doctor_profile(
        self,
        obj
    ):
        if not obj.doctor:
            return {}

        doctor = obj.doctor
        return {
            "name": self.get_doctor_name(obj),
            "qualification": doctor.qualification or "Medical Consultant",
            "designation": doctor.specialization or "Consultant Physician",
            "department": doctor.department.name if doctor.department else "General Medicine",
            "clinic_name": "MediCare Connect Clinic",
            "phone": doctor.user.phone or "N/A",
            "email": doctor.user.email or "N/A",
            "registration_no": doctor.license_number or "N/A",
        }

    def get_patient_profile(
        self,
        obj
    ):
        if not obj.patient:
            return {}

        profile = obj.patient
        age = None
        if profile.date_of_birth:
            today = timezone.localdate()
            age = today.year - profile.date_of_birth.year - (
                (today.month, today.day)
                < (profile.date_of_birth.month, profile.date_of_birth.day)
            )

        return {
            "age": age,
            "gender": profile.gender or "N/A",
            "blood_group": profile.blood_group or "N/A",
        }


    # ======================================================
    # Report File URL
    # ======================================================

    def get_report_file_url(
        self,
        obj
    ):

        if not obj.report_file:

            return None


        request = (
            self.context.get(
                "request"
            )
        )


        if request:

            return (
                request.build_absolute_uri(

                    obj.report_file.url

                )
            )


        return (
            obj.report_file.url
        )


    # ======================================================
    # Validation
    # ======================================================

    def validate(
        self,
        attrs
    ):

        report_type = (

            attrs.get(

                "report_type",

                getattr(

                    self.instance,

                    "report_type",

                    None

                )

            )

        )


        appointment = (

            attrs.get(

                "appointment",

                getattr(

                    self.instance,

                    "appointment",

                    None

                )

            )

        )


        test_booking = (

            attrs.get(

                "test_booking",

                getattr(

                    self.instance,

                    "test_booking",

                    None

                )

            )

        )


        # --------------------------------------------------
        # Medical Report
        # --------------------------------------------------

        if (

            report_type
            ==
            "Medical"

        ):

            if not appointment:

                raise serializers.ValidationError({

                    "appointment":

                    "Medical report requires an appointment."

                })


        # --------------------------------------------------
        # Diagnostic Report
        # --------------------------------------------------

        elif (

            report_type
            ==
            "Diagnostic"

        ):

            if not test_booking and not appointment:

                raise serializers.ValidationError({

                    "test_booking":

                    "Diagnostic report requires an appointment or test booking."

                })


        return (
            attrs
        )


class FeedbackMessageSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    appointment_booking = serializers.CharField(
        source="appointment.booking_number",
        read_only=True,
    )

    class Meta:
        model = FeedbackMessage
        fields = [
            "id",
            "doctor",
            "doctor_name",
            "patient",
            "patient_name",
            "appointment",
            "appointment_booking",
            "sender",
            "message",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "doctor",
            "doctor_name",
            "patient",
            "patient_name",
            "sender",
            "appointment_booking",
            "created_at",
        ]

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name().strip() or obj.patient.user.username

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name().strip() or obj.doctor.user.username