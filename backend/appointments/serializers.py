from rest_framework import serializers
from django.utils import timezone
from django.db import transaction

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    booking_number = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()

    class Meta:
        model = Appointment
        fields = [
            "id",
            "booking_number",
            "patient",
            "family_member",
            "doctor",
            "slot",
            "appointment_date",
            "reason",
            "symptoms",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = (
            "booking_number",
            "status",
            "created_at",
            "updated_at",
        )

    def validate(self, data):

        patient = data.get("patient")
        family_member = data.get("family_member")
        doctor = data.get("doctor")
        slot = data.get("slot")
        appointment_date = data.get("appointment_date")
        reason = data.get("reason")

        # -------------------------------
        # Required Validation
        # -------------------------------

        if not patient:
            raise serializers.ValidationError({
                "patient": "Patient is required."
            })

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
                "appointment_date": "Appointment date is required."
            })

        if not reason:
            raise serializers.ValidationError({
                "reason": "Reason is required."
            })

        # -------------------------------
        # Past Date Check
        # -------------------------------

        if appointment_date < timezone.now().date():
            raise serializers.ValidationError({
                "appointment_date":
                "Past date booking is not allowed."
            })

        # -------------------------------
        # Family Member Validation
        # -------------------------------

        if family_member:

            if family_member.patient != patient:

                raise serializers.ValidationError({

                    "family_member":
                    "This family member does not belong to this patient."

                })

        # -------------------------------
        # Doctor Availability
        # -------------------------------

        if not doctor.is_available:

            raise serializers.ValidationError({

                "doctor":
                "Doctor is currently unavailable."

            })

        # -------------------------------
        # Active Slot Check
        # -------------------------------

        if not slot.is_active:

            raise serializers.ValidationError({

                "slot":
                "Selected slot is inactive."

            })

        # -------------------------------
        # Slot Capacity Check
        # -------------------------------

        if slot.is_full:

            raise serializers.ValidationError({

                "slot":
                "Selected slot is already full."

            })

        # -------------------------------
        # Schedule Validation
        # -------------------------------

        schedule = slot.schedule

        weekday = appointment_date.strftime("%A")

        if schedule.day != weekday:

            raise serializers.ValidationError({

                "appointment_date":
                f"Doctor is unavailable on {weekday}."

            })

        # -------------------------------
        # Duplicate Booking Check
        # -------------------------------

        duplicate = Appointment.objects.filter(

            patient=patient,

            doctor=doctor,

            appointment_date=appointment_date,

            slot=slot,

            status__in=[
                "Pending",
                "Confirmed"
            ]

        )

        if self.instance:

            duplicate = duplicate.exclude(pk=self.instance.pk)

        if duplicate.exists():

            raise serializers.ValidationError({

                "appointment":
                "You already booked this appointment."

            })

        return data

    @transaction.atomic
    def create(self, validated_data):

        appointment = Appointment.objects.create(
            **validated_data
        )

        slot = appointment.slot

        slot.booked_count += 1

        slot.save()

        return appointment

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

                old_slot.save()

            new_slot.booked_count += 1

            new_slot.save()

        return super().update(
            instance,
            validated_data
        )