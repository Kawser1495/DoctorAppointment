from datetime import (
    datetime,
    timedelta,
)

from django.db import transaction

from .models import TimeSlot


# ==========================================================
# Generate Time Slots Automatically
# ==========================================================

@transaction.atomic
def generate_time_slots(schedule):

    """
    Automatically generate time slots based on:

    - start_time
    - end_time
    - slot_duration_minutes
    - max_patient_per_slot

    Example:

    Start: 09:00 AM
    End:   12:00 PM
    Duration: 30 minutes

    Generated:

    09:00 AM
    09:30 AM
    10:00 AM
    10:30 AM
    11:00 AM
    11:30 AM
    """

    today = datetime.today().date()

    current_datetime = datetime.combine(
        today,
        schedule.start_time,
    )

    end_datetime = datetime.combine(
        today,
        schedule.end_time,
    )

    expected_slot_times = []

    # ======================================================
    # Generate expected slot times
    # ======================================================

    while current_datetime < end_datetime:

        slot_time = current_datetime.time()

        expected_slot_times.append(
            slot_time
        )

        current_datetime += timedelta(
            minutes=schedule.slot_duration_minutes
        )

    # ======================================================
    # Create or Update Required Slots
    # ======================================================

    for slot_time in expected_slot_times:

        slot, created = TimeSlot.objects.get_or_create(

            schedule=schedule,

            slot_time=slot_time,

            defaults={

                "max_patient":
                    schedule.max_patient_per_slot,

                "is_active":
                    schedule.is_active,

            }

        )

        # --------------------------------------------------
        # Update slot configuration
        # --------------------------------------------------

        if not created:

            slot.max_patient = (
                schedule.max_patient_per_slot
            )

            slot.is_active = (
                schedule.is_active
            )

            # Make sure booked count is not invalid
            if (
                slot.booked_count >
                slot.max_patient
            ):

                slot.max_patient = (
                    slot.booked_count
                )

            slot.save()

    # ======================================================
    # Handle Old Slots
    # ======================================================

    old_slots = TimeSlot.objects.filter(
        schedule=schedule
    ).exclude(
        slot_time__in=expected_slot_times
    )

    for slot in old_slots:

        # --------------------------------------------------
        # If slot has appointments, keep it but deactivate
        # --------------------------------------------------

        if slot.booked_count > 0:

            slot.is_active = False

            slot.save()

        else:

            # Safe to delete unused slot
            slot.delete()

    return expected_slot_times