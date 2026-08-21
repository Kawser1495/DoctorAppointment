from django.db import transaction
from django.utils import timezone

from rest_framework import serializers

from payments.models import Payment

from .models import Appointment


# ==========================================================
# Appointment Serializer
# ==========================================================

class AppointmentSerializer(serializers.ModelSerializer):

    # ======================================================
    # Payment Information
    # ======================================================

    payment_status = serializers.SerializerMethodField()

    payment_amount = serializers.SerializerMethodField()

    payment_method = serializers.SerializerMethodField()

    transaction_id = serializers.SerializerMethodField()

    # ======================================================
    # Read Only Appointment Information
    # ======================================================

    booking_number = serializers.ReadOnlyField()

    status = serializers.ReadOnlyField()

    doctor_name = serializers.CharField(
        source="doctor.user.get_full_name",
        read_only=True,
    )

    department = serializers.CharField(
        source="doctor.department.name",
        read_only=True,
    )

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

    # ======================================================
    # Meta
    # ======================================================

    class Meta:

        model = Appointment

        fields = [
            "id",

            "booking_number",

            "patient",

            "family_member",

            "patient_name",

            "doctor",

            "doctor_name",

            "department",

            "consultation_fee",

            "slot",

            "slot_time",

            "appointment_date",

            "reason",

            "symptoms",

            "status",

            "created_at",

            "updated_at",

            "payment_status",

            "payment_amount",

            "payment_method",

            "transaction_id",
        ]

        read_only_fields = [
            "id",
            "patient",
            "booking_number",
            "patient_name",
            "doctor_name",
            "department",
            "consultation_fee",
            "slot_time",
            "status",
            "created_at",
            "updated_at",
            "payment_status",
            "payment_amount",
            "payment_method",
            "transaction_id",
        ]

    # ======================================================
    # Patient Name
    # ======================================================

    def get_patient_name(self, obj):

        if obj.family_member:

            return obj.family_member.name

        full_name = obj.patient.user.get_full_name()

        if full_name:

            return full_name

        return obj.patient.user.username

    # ======================================================
    # Validation
    # ======================================================

    def validate(self, data):

        request = self.context.get("request")

        if not request or not request.user.is_authenticated:

            raise serializers.ValidationError({
                "detail": "Authentication is required."
            })

        # ==================================================
        # Patient Profile
        # ==================================================

        try:

            patient = request.user.patient_profile

        except Exception:

            raise serializers.ValidationError({
                "patient":
                "Patient profile not found."
            })

        # ==================================================
        # Get Data
        # ==================================================

        family_member = data.get(
            "family_member"
        )

        doctor = data.get(
            "doctor"
        )

        slot = data.get(
            "slot"
        )

        appointment_date = data.get(
            "appointment_date"
        )

        reason = data.get(
            "reason"
        )

        # ==================================================
        # Required Fields
        # ==================================================

        if not doctor:

            raise serializers.ValidationError({
                "doctor":
                "Doctor is required."
            })

        if not slot:

            raise serializers.ValidationError({
                "slot":
                "Please select a time slot."
            })

        if not appointment_date:

            raise serializers.ValidationError({
                "appointment_date":
                "Appointment date is required."
            })

        if not reason or not reason.strip():

            raise serializers.ValidationError({
                "reason":
                "Reason is required."
            })

        # ==================================================
        # Past Date
        # ==================================================

        if appointment_date < timezone.localdate():

            raise serializers.ValidationError({
                "appointment_date":
                "Past date booking is not allowed."
            })

        # ==================================================
        # Family Member Ownership
        # ==================================================

        if family_member:

            if family_member.patient_id != patient.id:

                raise serializers.ValidationError({
                    "family_member":
                    "This family member does not belong to you."
                })

        # ==================================================
        # Doctor Availability
        # ==================================================

        if not doctor.is_available:

            raise serializers.ValidationError({
                "doctor":
                "Doctor is currently unavailable."
            })

        # ==================================================
        # Slot Doctor Matching
        # ==================================================

        if slot.schedule.doctor_id != doctor.id:

            raise serializers.ValidationError({
                "slot":
                "Selected slot does not belong to the selected doctor."
            })

        # ==================================================
        # Schedule Active
        # ==================================================

        if not slot.schedule.is_active:

            raise serializers.ValidationError({
                "slot":
                "Doctor's schedule is currently inactive."
            })

        # ==================================================
        # Slot Active
        # ==================================================

        if not slot.is_active:

            raise serializers.ValidationError({
                "slot":
                "Selected slot is inactive."
            })

        # ==================================================
        # Day Validation
        # ==================================================

        weekday = appointment_date.strftime("%A")

        if slot.schedule.day != weekday:

            raise serializers.ValidationError({
                "appointment_date":
                f"Selected doctor does not have a schedule on {weekday}."
            })

        # ==================================================
        # Slot Capacity
        # ==================================================

        if self.instance:

            # ----------------------------------------------
            # If updating the same appointment's slot,
            # don't reject it just because it already
            # contributes to booked_count.
            # ----------------------------------------------

            if slot != self.instance.slot:

                if slot.is_full:

                    raise serializers.ValidationError({
                        "slot":
                        "Selected slot is already full."
                    })

        else:

            if slot.is_full:

                raise serializers.ValidationError({
                    "slot":
                    "Selected slot is already full."
                })

        # ==================================================
        # Duplicate Appointment
        # ==================================================

        existing = Appointment.objects.filter(
            patient=patient,
            doctor=doctor,
            appointment_date=appointment_date,
        ).exclude(
            status__in=[
                "Cancelled",
                "Rejected",
            ]
        )

        if self.instance:

            existing = existing.exclude(
                pk=self.instance.pk
            )

        if existing.exists():

            raise serializers.ValidationError({
                "non_field_errors": [
                    "You already have an appointment with this doctor on this date."
                ]
            })

        return data

    # ======================================================
    # Create Appointment
    # ======================================================

    @transaction.atomic
    def create(self, validated_data):

        request = self.context["request"]

        # ==================================================
        # Get Patient
        # ==================================================

        try:

            patient = request.user.patient_profile

        except Exception:

            raise serializers.ValidationError({
                "patient":
                "Patient profile not found."
            })

        validated_data["patient"] = patient

        # ==================================================
        # Lock Slot
        # ==================================================

        slot = validated_data["slot"]

        slot = type(slot).objects.select_for_update().select_related(
            "schedule",
            "schedule__doctor",
        ).get(
            pk=slot.pk
        )

        # ==================================================
        # Final Capacity Check
        # ==================================================

        if slot.booked_count >= slot.max_patient:

            raise serializers.ValidationError({
                "slot":
                "Selected slot is already full."
            })

        if not slot.is_active:

            raise serializers.ValidationError({
                "slot":
                "Selected slot is inactive."
            })

        # ==================================================
        # Create Appointment
        # ==================================================

        validated_data["slot"] = slot

        appointment = Appointment.objects.create(
            **validated_data
        )

        # ==================================================
        # Increase Booked Count
        # ==================================================

        slot.booked_count += 1

        slot.save(
            update_fields=[
                "booked_count"
            ]
        )

        return appointment

    # ======================================================
    # Update Appointment
    # ======================================================

    @transaction.atomic
    def update(self, instance, validated_data):

        old_slot = instance.slot

        new_slot = validated_data.get(
            "slot",
            old_slot
        )

        # ==================================================
        # Slot Changed
        # ==================================================

        if old_slot != new_slot:

            # ----------------------------------------------
            # Lock Old Slot
            # ----------------------------------------------

            old_slot = type(old_slot).objects.select_for_update().get(
                pk=old_slot.pk
            )

            # ----------------------------------------------
            # Lock New Slot
            # ----------------------------------------------

            new_slot = type(new_slot).objects.select_for_update().get(
                pk=new_slot.pk
            )

            # ----------------------------------------------
            # New Slot Capacity
            # ----------------------------------------------

            if new_slot.booked_count >= new_slot.max_patient:

                raise serializers.ValidationError({
                    "slot":
                    "Selected slot is already full."
                })

            if not new_slot.is_active:

                raise serializers.ValidationError({
                    "slot":
                    "Selected slot is inactive."
                })

            # ----------------------------------------------
            # Release Old Slot
            # ----------------------------------------------

            if old_slot.booked_count > 0:

                old_slot.booked_count -= 1

                old_slot.save(
                    update_fields=[
                        "booked_count"
                    ]
                )

            # ----------------------------------------------
            # Book New Slot
            # ----------------------------------------------

            new_slot.booked_count += 1

            new_slot.save(
                update_fields=[
                    "booked_count"
                ]
            )

            validated_data["slot"] = new_slot

        # ==================================================
        # Update Appointment
        # ==================================================

        return super().update(
            instance,
            validated_data
        )

    # ======================================================
    # Payment Helper
    # ======================================================

    def get_payment(self, obj):

        return Payment.objects.filter(
            appointment=obj
        ).order_by(
            "-payment_date"
        ).first()

    # ======================================================
    # Payment Status
    # ======================================================

    def get_payment_status(self, obj):

        payment = self.get_payment(obj)

        if payment:

            return payment.payment_status

        return "Pending"

    # ======================================================
    # Payment Amount
    # ======================================================

    def get_payment_amount(self, obj):

        payment = self.get_payment(obj)

        if payment:

            return payment.amount

        return None

    # ======================================================
    # Payment Method
    # ======================================================

    def get_payment_method(self, obj):

        payment = self.get_payment(obj)

        if payment:

            return payment.payment_method

        return None

    # ======================================================
    # Transaction ID
    # ======================================================

    def get_transaction_id(self, obj):

        payment = self.get_payment(obj)

        if payment:

            return payment.transaction_id

        return None