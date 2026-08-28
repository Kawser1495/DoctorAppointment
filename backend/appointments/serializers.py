from django.utils import timezone

from rest_framework import serializers

from doctors.models import TimeSlot
from patients.models import FamilyMember

from .models import Appointment


# ==========================================================
# Appointment Serializer
# ==========================================================

class AppointmentSerializer(
    serializers.ModelSerializer
):

    doctor_name = serializers.SerializerMethodField()

    department_name = serializers.CharField(
        source="doctor.department.name",
        read_only=True,
    )

    specialization = serializers.CharField(
        source="doctor.specialization",
        read_only=True,
    )

    # ======================================================
    # Consultation Fee
    # ======================================================

    consultation_fee = serializers.DecimalField(
        source="doctor.consultation_fee",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    # ======================================================
    # Slot Time
    # ======================================================

    slot_time = serializers.TimeField(
        source="slot.slot_time",
        read_only=True,
    )

    # ======================================================
    # Patient Name
    # ======================================================

    patient_name = serializers.SerializerMethodField()

    # ======================================================
    # Family Member Name
    # ======================================================

    family_member_name = serializers.SerializerMethodField()

    # ======================================================
    # Meta
    # ======================================================

    class Meta:

        model = Appointment

        fields = [

            "id",

            "booking_number",

            # ----------------------------------------------
            # Patient
            # ----------------------------------------------

            "patient",

            "patient_name",

            # ----------------------------------------------
            # Family Member
            # ----------------------------------------------

            "family_member",

            "family_member_name",

            # ----------------------------------------------
            # Doctor
            # ----------------------------------------------

            "doctor",

            "doctor_name",

            "department_name",

            "specialization",

            "consultation_fee",

            # ----------------------------------------------
            # Slot
            # ----------------------------------------------

            "slot",

            "slot_time",

            # ----------------------------------------------
            # Appointment
            # ----------------------------------------------

            "appointment_date",

            "reason",

            "symptoms",

            "status",

            # ----------------------------------------------
            # Timestamps
            # ----------------------------------------------

            "created_at",

            "updated_at",

        ]

        read_only_fields = [

            "id",

            "booking_number",

            "patient",

            "patient_name",

            "family_member_name",

            "status",

            "consultation_fee",

            "created_at",

            "updated_at",

        ]

    # ==========================================================
    # Doctor Name
    # ==========================================================

    def get_doctor_name(self, obj):

        full_name = (
            obj.doctor.user
            .get_full_name()
            .strip()
        )

        if full_name:

            return f"Dr. {full_name}"

        return f"Dr. {obj.doctor.user.username}"

    # ==========================================================
    # Patient Name
    # ==========================================================

    def get_patient_name(self, obj):

        # ------------------------------------------------------
        # If appointment is for family member
        # ------------------------------------------------------

        if obj.family_member:

            return obj.family_member.name

        # ------------------------------------------------------
        # Otherwise appointment is for logged-in patient
        # ------------------------------------------------------

        full_name = (
            obj.patient.user
            .get_full_name()
            .strip()
        )

        if full_name:

            return full_name

        return obj.patient.user.username

    # ==========================================================
    # Family Member Name
    # ==========================================================

    def get_family_member_name(self, obj):

        if obj.family_member:

            return obj.family_member.name

        return None

    # ==========================================================
    # Validation
    # ==========================================================

    def validate(self, attrs):

        # ======================================================
        # Get submitted values
        # ======================================================

        doctor = attrs.get(
            "doctor"
        )

        slot = attrs.get(
            "slot"
        )

        appointment_date = attrs.get(
            "appointment_date"
        )

        family_member = attrs.get(
            "family_member"
        )

        # ======================================================
        # Required validation
        # ======================================================

        if not doctor:

            raise serializers.ValidationError({

                "doctor":
                "Please select a doctor."

            })

        if not slot:

            raise serializers.ValidationError({

                "slot":
                "Please select an available time slot."

            })

        if not appointment_date:

            raise serializers.ValidationError({

                "appointment_date":
                "Please select an appointment date."

            })

        # ======================================================
        # Appointment date cannot be in the past
        # ======================================================

        if appointment_date < timezone.localdate():

            raise serializers.ValidationError({

                "appointment_date":
                "Appointment date cannot be in the past."

            })

        # ======================================================
        # Doctor availability
        # ======================================================

        if not doctor.is_available:

            raise serializers.ValidationError({

                "doctor":
                "This doctor is currently unavailable."

            })

        # ======================================================
        # Slot belongs to selected doctor
        # ======================================================

        if slot.schedule.doctor_id != doctor.id:

            raise serializers.ValidationError({

                "slot":
                "Selected time slot does not belong to this doctor."

            })

        # ======================================================
        # Doctor schedule weekday
        # ======================================================

        day_name = appointment_date.strftime(
            "%A"
        )

        if slot.schedule.day != day_name:

            raise serializers.ValidationError({

                "appointment_date":
                (
                    f"Selected doctor does not have this "
                    f"time slot on {day_name}."
                )

            })

        # ======================================================
        # Schedule active
        # ======================================================

        if not slot.schedule.is_active:

            raise serializers.ValidationError({

                "slot":
                "Doctor schedule is currently inactive."

            })

        # ======================================================
        # Slot active
        # ======================================================

        if not slot.is_active:

            raise serializers.ValidationError({

                "slot":
                "This time slot is currently unavailable."

            })

        # ======================================================
        # Slot full
        # ======================================================

        if slot.booked_count >= slot.max_patient:

            raise serializers.ValidationError({

                "slot":
                "This time slot is already full."

            })

        # ======================================================
        # Current logged-in patient
        # ======================================================

        request = self.context.get(
            "request"
        )

        if not request or not request.user.is_authenticated:

            raise serializers.ValidationError({

                "patient":
                "Authentication is required."

            })

        # ======================================================
        # Get PatientProfile
        # ======================================================

        try:

            patient = (
                request.user.patient_profile
            )

        except AttributeError:

            raise serializers.ValidationError({

                "patient":
                (
                    "Patient profile not found. "
                    "Please complete your profile first."
                )

            })

        # ======================================================
        # Family Member Validation
        # ======================================================

        if family_member:

            # --------------------------------------------------
            # Family member must belong to logged-in patient
            # --------------------------------------------------

            if family_member.patient_id != patient.id:

                raise serializers.ValidationError({

                    "family_member":
                    (
                        "You can only book appointments "
                        "for your own family members."
                    )

                })

        # ======================================================
        # Duplicate Appointment Validation
        # ======================================================

        # ------------------------------------------------------
        # Family member appointment
        # ------------------------------------------------------

        if family_member:

            already_exists = Appointment.objects.filter(

                patient=patient,

                family_member=family_member,

                doctor=doctor,

                appointment_date=appointment_date,

            ).exclude(

                status__in=[
                    "Cancelled",
                    "Rejected",
                ]

            )

        # ------------------------------------------------------
        # Own appointment
        # ------------------------------------------------------

        else:

            already_exists = Appointment.objects.filter(

                patient=patient,

                family_member__isnull=True,

                doctor=doctor,

                appointment_date=appointment_date,

            ).exclude(

                status__in=[
                    "Cancelled",
                    "Rejected",
                ]

            )

        # ======================================================
        # Duplicate Found
        # ======================================================

        if already_exists.exists():

            if family_member:

                raise serializers.ValidationError({

                    "non_field_errors":
                    (
                        f"{family_member.name} already has "
                        "an appointment with this doctor "
                        "on this date."
                    )

                })

            raise serializers.ValidationError({

                "non_field_errors":
                (
                    "You already have an appointment "
                    "with this doctor on this date."
                )

            })

        # ======================================================
        # Return Validated Data
        # ======================================================

        return attrs