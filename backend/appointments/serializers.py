from django.utils import timezone

from rest_framework import serializers

from doctors.models import TimeSlot

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

    slot_time = serializers.TimeField(
        source="slot.slot_time",
        read_only=True,
    )

    patient_name = serializers.SerializerMethodField()

    class Meta:

        model = Appointment

        fields = [

            "id",

            "booking_number",

            "patient",

            "patient_name",

            "family_member",

            "doctor",

            "doctor_name",

            "department_name",

            "specialization",

            "consultation_fee",

            "slot",

            "slot_time",

            "appointment_date",

            "reason",

            "symptoms",

            "status",

            "created_at",

            "updated_at",

        ]

        read_only_fields = [

            "id",

            "booking_number",

            "patient",

            "status",

            "consultation_fee",

            "created_at",

            "updated_at",

        ]

    # ======================================================
    # Doctor Name
    # ======================================================

    def get_doctor_name(self, obj):

        full_name = (
            obj.doctor.user
            .get_full_name()
            .strip()
        )

        if full_name:

            return f"Dr. {full_name}"

        return f"Dr. {obj.doctor.user.username}"

    # ======================================================
    # Patient Name
    # ======================================================

    def get_patient_name(self, obj):

        if obj.family_member:

            return obj.family_member.name

        return (
            obj.patient.user
            .get_full_name()
        )

    # ======================================================
    # Validation
    # ======================================================

    def validate(self, attrs):

        doctor = attrs.get("doctor")

        slot = attrs.get("slot")

        appointment_date = attrs.get(
            "appointment_date"
        )

        # --------------------------------------------------
        # Date cannot be in the past
        # --------------------------------------------------

        if appointment_date < timezone.localdate():

            raise serializers.ValidationError({

                "appointment_date":
                "Appointment date cannot be in the past."

            })

        # --------------------------------------------------
        # Doctor availability
        # --------------------------------------------------

        if not doctor.is_available:

            raise serializers.ValidationError({

                "doctor":
                "This doctor is currently unavailable."

            })

        # --------------------------------------------------
        # Slot belongs to doctor
        # --------------------------------------------------

        if slot.schedule.doctor_id != doctor.id:

            raise serializers.ValidationError({

                "slot":
                "Selected time slot does not belong to this doctor."

            })

        # --------------------------------------------------
        # Doctor schedule weekday
        # --------------------------------------------------

        day_name = appointment_date.strftime(
            "%A"
        )

        if slot.schedule.day != day_name:

            raise serializers.ValidationError({

                "appointment_date":
                f"Selected doctor does not have this time slot on {day_name}."

            })

        # --------------------------------------------------
        # Schedule active
        # --------------------------------------------------

        if not slot.schedule.is_active:

            raise serializers.ValidationError({

                "slot":
                "Doctor schedule is currently inactive."

            })

        # --------------------------------------------------
        # Slot active
        # --------------------------------------------------

        if not slot.is_active:

            raise serializers.ValidationError({

                "slot":
                "This time slot is currently unavailable."

            })

        # --------------------------------------------------
        # Slot full
        # --------------------------------------------------

        if slot.booked_count >= slot.max_patient:

            raise serializers.ValidationError({

                "slot":
                "This time slot is already full."

            })

        # --------------------------------------------------
        # Current patient
        # --------------------------------------------------

        request = self.context.get(
            "request"
        )

        if (
            request
            and request.user.is_authenticated
        ):

            try:

                patient = (
                    request.user.patient_profile
                )

            except AttributeError:

                raise serializers.ValidationError({

                    "patient":
                    "Patient profile not found. Please complete your profile first."

                })

            # ----------------------------------------------
            # Duplicate appointment
            # ----------------------------------------------

            already_exists = (
                Appointment.objects.filter(

                    patient=patient,

                    doctor=doctor,

                    appointment_date=appointment_date,

                )
                .exclude(
                    status__in=[
                        "Cancelled",
                        "Rejected",
                    ]
                )
            )

            if already_exists.exists():

                raise serializers.ValidationError({

                    "non_field_errors":
                    "You already have an appointment with this doctor on this date."

                })

        return attrs