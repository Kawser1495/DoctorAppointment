from rest_framework import serializers
from django.utils import timezone
from django.db import transaction
from payments.models import Payment

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    # ==========================
    # Read Only Fields
    # ==========================
    payment_status = serializers.SerializerMethodField()

    payment_amount = serializers.SerializerMethodField()

    payment_method = serializers.SerializerMethodField()

    transaction_id = serializers.SerializerMethodField()

    booking_number = serializers.ReadOnlyField()

    status = serializers.ReadOnlyField()

    doctor_name = serializers.CharField(
        source="doctor.user.get_full_name",
        read_only=True
    )

    department = serializers.CharField(
        source="doctor.department.name",
        read_only=True
    )
    
    consultation_fee = serializers.DecimalField(
    source="doctor.consultation_fee",
    max_digits=10,
    decimal_places=2,
    read_only=True
    )

    slot_time = serializers.TimeField(
        source="slot.slot_time",
        read_only=True
    )

    patient_name = serializers.SerializerMethodField()

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

        read_only_fields = (

            "patient",

            "booking_number",

            "status",

            "created_at",

            "updated_at",

        )

    # =====================================
    # Patient Name
    # =====================================

    def get_patient_name(self, obj):

        if obj.family_member:

            return obj.family_member.name

        return obj.patient.user.get_full_name()

    # =====================================
    # Validation
    # =====================================

    def validate(self, data):

        request = self.context["request"]

        if not hasattr(request.user, "patient_profile"):

            raise serializers.ValidationError({

                "patient":
                "Patient profile not found."

            })

        patient = request.user.patient_profile

        family_member = data.get("family_member")
        doctor = data.get("doctor")
        slot = data.get("slot")
        appointment_date = data.get("appointment_date")
        reason = data.get("reason")

        # Required Validation

        if not doctor:

            raise serializers.ValidationError({
                "doctor": "Doctor is required."
            })

        if not slot:

            raise serializers.ValidationError({
                "slot": "Please select a time slot."
            })

        if not appointment_date:

            raise serializers.ValidationError({
                "appointment_date":
                "Appointment date is required."
            })

        if not reason:

            raise serializers.ValidationError({
                "reason": "Reason is required."
            })

        # Past Date Validation

        if appointment_date < timezone.now().date():

            raise serializers.ValidationError({

                "appointment_date":
                "Past date booking is not allowed."

            })

        # Family Member Validation

        if family_member:

            if family_member.patient != patient:

                raise serializers.ValidationError({

                    "family_member":
                    "This family member does not belong to this patient."

                })

        # Doctor Availability

        if not doctor.is_available:

            raise serializers.ValidationError({

                "doctor":
                "Doctor is currently unavailable."

            })

        # Slot Active Validation

        if not slot.is_active:

            raise serializers.ValidationError({

                "slot":
                "Selected slot is inactive."

            })

        # Slot Capacity Validation

        if slot.is_full:

            raise serializers.ValidationError({

                "slot":
                "Selected slot is already full."

            })

        # Doctor Schedule Validation

        schedule = slot.schedule

        weekday = appointment_date.strftime("%A")

        if schedule.day != weekday:

            raise serializers.ValidationError({

                "appointment_date":
                f"Doctor is unavailable on {weekday}."

            })

        # Duplicate Appointment Validation

        existing = Appointment.objects.filter(
            patient=patient,
            doctor=doctor,
            appointment_date=appointment_date,
        ).exclude(
            status__in=["Cancelled", "Rejected"]
        )

        if self.instance:

            existing = existing.exclude(pk=self.instance.pk)

        if existing.exists():

            raise serializers.ValidationError({

                "non_field_errors": [

                    "You already have an appointment with this doctor on this date."

                ]

            })

        return data

    # =====================================
    # Create Appointment
    # =====================================

    @transaction.atomic
    def create(self, validated_data):

        validated_data["patient"] = (
            self.context["request"]
            .user
            .patientprofile
        )

        appointment = Appointment.objects.create(
            **validated_data
        )

        slot = appointment.slot

        slot.booked_count += 1

        slot.save(
            update_fields=["booked_count"]
        )

        return appointment

    # =====================================
    # Update Appointment
    # =====================================

    @transaction.atomic
    def update(self, instance, validated_data):

        old_slot = instance.slot

        new_slot = validated_data.get(
            "slot",
            old_slot
        )

        if old_slot != new_slot:

            if old_slot.booked_count > 0:

                old_slot.booked_count -= 1

                old_slot.save(update_fields=["booked_count"])

            new_slot.booked_count += 1

            new_slot.save(update_fields=["booked_count"])

        return super().update(
            instance,
            validated_data
        )
        
        
    # =====================================
    # Payment Status
    # =====================================

    def get_payment_status(self, obj):

        payment = Payment.objects.filter(
            appointment=obj
        ).first()

        if payment:
            return payment.payment_status

        return "Pending"


    # =====================================
    # Payment Amount
    # =====================================

    def get_payment_amount(self, obj):

        payment = Payment.objects.filter(
            appointment=obj
        ).first()

        if payment:
            return payment.amount
        
        return None


    # =====================================
    # Payment Method
    # =====================================

    def get_payment_method(self, obj):

        payment = Payment.objects.filter(
            appointment=obj
        ).first()

        if payment:
            return payment.payment_method

        return None


    # =====================================
    # Transaction ID
    # =====================================

    def get_transaction_id(self, obj):

        payment = Payment.objects.filter(
            appointment=obj
        ).first()

        if payment:
            return payment.transaction_id

        return None