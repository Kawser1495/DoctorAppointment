from datetime import datetime, date, timedelta

from .models import TimeSlot


def generate_time_slots(schedule):

    # ======================================================
    # Do not generate slots for inactive schedule
    # ======================================================

    if not schedule.is_active:

        return {
            "created": 0,
            "message": "Schedule is inactive."
        }

    current_datetime = datetime.combine(
        date.today(),
        schedule.start_time
    )

    end_datetime = datetime.combine(
        date.today(),
        schedule.end_time
    )

    created_count = 0
    updated_count = 0

    # ======================================================
    # Generate slots
    # ======================================================

    while current_datetime < end_datetime:

        slot_time = current_datetime.time()

        slot, created = TimeSlot.objects.get_or_create(

            schedule=schedule,

            slot_time=slot_time,

            defaults={

                "max_patient":
                    schedule.max_patient_per_slot,

                "booked_count":
                    0,

                "is_active":
                    True,

            }
        )

        if created:

            created_count += 1

        else:

            # Update only capacity if slot already exists
            slot.max_patient = (
                schedule.max_patient_per_slot
            )

            slot.is_active = True

            slot.save()

            updated_count += 1

        current_datetime += timedelta(

            minutes=schedule.slot_duration_minutes

        )

    return {

        "created": created_count,

        "updated": updated_count,

        "message":
            "Time slots generated successfully."

    }