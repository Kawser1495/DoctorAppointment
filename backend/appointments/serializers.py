from rest_framework import serializers
from django.utils import timezone

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = (
            "booking_number",
            "created_at",
            "updated_at",
        )

    def validate(self, data):

        doctor = data.get("doctor")
        patient = data.get("patient")
        slot = data.get("slot")
        appointment_date = data.get("appointment_date")

        # ---------------------------------------
        # Required Field Validation
        # ---------------------------------------

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
                "slot": "Time slot is required."
            })

        if not appointment_date:
            raise serializers.ValidationError({
                "appointment_date": "Appointment date is required."
            })

        # ---------------------------------------
        # Past Date Validation
        # ---------------------------------------

        if appointment_date < timezone.now().date():
            raise serializers.ValidationError({
                "appointment_date":
                "Past date booking is not allowed."
            })

        # ---------------------------------------
        # Doctor Availability
        # ---------------------------------------

        if not doctor.is_available:
            raise serializers.ValidationError({
                "doctor":
                "Doctor is currently unavailable."
            })

        # ---------------------------------------
        # Time Slot Active Check
        # ---------------------------------------

        if not slot.is_active:
            raise serializers.ValidationError({
                "slot":
                "Selected time slot is inactive."
            })

        # ---------------------------------------
        # Slot Capacity Validation
        # ---------------------------------------

        if slot.booked_count >= slot.max_patient:
            raise serializers.ValidationError({
                "slot":
                "Selected time slot is already full."
            })

        # ---------------------------------------
        # Doctor Schedule Validation
        # ---------------------------------------

        schedule = slot.schedule

        weekday = appointment_date.strftime("%A")

        if schedule.day != weekday:
            raise serializers.ValidationError({
                "appointment_date":
                f"This doctor is not available on {weekday}."
            })

        # ---------------------------------------
        # Prevent Same Patient Booking
        # ---------------------------------------

        if Appointment.objects.filter(
            patient=patient,
            doctor=doctor,
            appointment_date=appointment_date,
            status__in=["Pending", "Confirmed"]
        ).exists():

            raise serializers.ValidationError({
                "patient":
                "You already have an active appointment with this doctor on this date."
            })

        return data

    def create(self, validated_data):

        appointment = Appointment.objects.create(
            **validated_data
        )

        slot = appointment.slot

        slot.booked_count += 1

        slot.save()

        return appointment

    def update(self, instance, validated_data):

        old_slot = instance.slot

        new_slot = validated_data.get("slot", old_slot)

        if old_slot != new_slot:

            if old_slot.booked_count > 0:
                old_slot.booked_count -= 1
                old_slot.save()

            new_slot.booked_count += 1
            new_slot.save()

        return super().update(instance, validated_data)