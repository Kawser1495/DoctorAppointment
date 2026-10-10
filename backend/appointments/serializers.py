from datetime import date

from django.utils import timezone
from datetime import timedelta

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

    doctor_profile = serializers.SerializerMethodField()

    department_name = serializers.CharField(
        source="doctor.department.name",
        read_only=True,
    )

    specialization = serializers.CharField(
        source="doctor.specialization",
        read_only=True,
    )

    patient_profile = serializers.SerializerMethodField()

    family_member_details = serializers.SerializerMethodField()

    family_member = serializers.PrimaryKeyRelatedField(
        queryset=FamilyMember.objects.all(),
        required=False,
        allow_null=True,
    )

    appointment_time = serializers.SerializerMethodField()

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

    payment_status = serializers.SerializerMethodField()

    is_paid = serializers.SerializerMethodField()

    is_today = serializers.SerializerMethodField()

    booked_today = serializers.SerializerMethodField()

    refund_request_status = serializers.SerializerMethodField()

    can_request_refund = serializers.SerializerMethodField()

    refund_approved = serializers.SerializerMethodField()

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

            "doctor_profile",

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

            "ai_category",

            "ai_urgency",

            "ai_specialist",

            "ai_guidance",

            "ai_report_shared",

            "payment_status",
            "is_paid",
            "is_today",
            "booked_today",
            "refund_request_status",
            "can_request_refund",
            "refund_approved",

            "status",

            "rejection_reason",

            "ai_category",

            "ai_urgency",

            "ai_specialist",

            "ai_guidance",

            "ai_report_shared",

            "patient_profile",

            "family_member_details",

            "appointment_time",

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

            "rejection_reason",

            "consultation_fee",

            "patient_profile",

            "family_member_details",

            "appointment_time",

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

    def get_doctor_profile(self, obj):
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

    def get_payment_status(self, obj):
        payment = obj.payments.order_by("-payment_date", "-id").first()
        return payment.payment_status if payment else "Unpaid"

    def get_is_paid(self, obj):
        return obj.payments.filter(
            payment_status__in=["Paid", "Partially Paid"]
        ).exists()

    def get_is_today(self, obj):
        return obj.appointment_date == timezone.localdate()

    def get_booked_today(self, obj):
        return timezone.localtime(obj.created_at).date() == timezone.localdate()

    def get_refund_request_status(self, obj):
        return obj.payments.filter(
            refund_requests__isnull=False,
        ).order_by(
            "-refund_requests__requested_at",
        ).values_list(
            "refund_requests__refund_status",
            flat=True,
        ).first()

    def get_can_request_refund(self, obj):
        return obj.payments.filter(
            payment_status="Paid",
            payment_mode="Full",
            is_refundable=True,
            payment_date__gte=timezone.now() - timedelta(hours=24),
        ).exclude(
            refund_requests__refund_status__in=["Pending", "Approved", "Completed"],
        ).exists()

    def get_refund_approved(self, obj):
        return obj.payments.filter(payment_status="Refunded").exists()

    # ==========================================================
    # Patient Details
    # ==========================================================

    def get_patient_profile(self, obj):

        if not obj.patient:
            return None

        patient = obj.patient

        birth_date = getattr(patient, "date_of_birth", None)

        age = None

        if birth_date:
            today = date.today()
            age = today.year - birth_date.year - (
                (today.month, today.day) < (birth_date.month, birth_date.day)
            )

        return {
            "id": patient.id,
            "full_name": patient.user.get_full_name() or patient.user.username,
            "age": age,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "phone": patient.user.phone,
            "email": patient.user.email,
            "address": patient.address,
            "emergency_contact": patient.emergency_contact,
        }

    # ==========================================================
    # Family Member Details
    # ==========================================================

    def get_family_member_details(self, obj):

        family_member = obj.family_member

        if not family_member:
            return None

        return {
            "id": family_member.id,
            "name": family_member.name,
            "age": family_member.age,
            "gender": family_member.gender,
            "relation": family_member.relation,
            "phone_number": family_member.phone_number,
            "blood_group": family_member.blood_group,
        }

    # ==========================================================
    # Appointment Time
    # ==========================================================

    def get_appointment_time(self, obj):

        if obj.slot:
            return obj.slot.slot_time.strftime("%H:%M:%S")

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

        request = self.context.get("request")
        patient = getattr(request.user, "patient_profile", None) if request else None

        if patient and slot:
            conflicting_appointment = Appointment.objects.filter(
                patient=patient,
                appointment_date=appointment_date,
                slot__slot_time=slot.slot_time,
                status__in=["Pending", "Confirmed"],
            ).first()

            if conflicting_appointment:
                raise serializers.ValidationError({
                    "appointment_date": (
                        "You already have an active appointment on "
                        f"{appointment_date} at "
                        f"{slot.slot_time.strftime('%I:%M %p')}. "
                        "Please choose another date or time."
                    ),
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


class AdminAppointmentSerializer(AppointmentSerializer):

    payment_status = serializers.SerializerMethodField()

    class Meta(AppointmentSerializer.Meta):
        fields = AppointmentSerializer.Meta.fields + [
            "payment_status",
        ]

    def get_payment_status(self, obj):
        payment = obj.payments.order_by("-payment_date").first()
        return payment.payment_status if payment else "Unpaid"