from datetime import (
    datetime,
    timedelta,
)

from django.db.models.signals import (
    post_save,
)

from django.dispatch import receiver

from .models import (
    DoctorSchedule,
    TimeSlot,
)


# ==========================================================
# Automatically Generate Time Slots
# ==========================================================

@receiver(
    post_save,
    sender=DoctorSchedule
)
def generate_time_slots(
    sender,
    instance,
    **kwargs
):

    # ======================================================
    # Schedule inactive হলে slots inactive
    # ======================================================

    if not instance.is_active:

        instance.slots.update(
            is_active=False
        )

        return


    # ======================================================
    # Start / End Datetime
    # ======================================================

    start_datetime = datetime.combine(
        datetime.today(),
        instance.start_time,
    )

    end_datetime = datetime.combine(
        datetime.today(),
        instance.end_time,
    )


    slot_duration = timedelta(
        minutes=
        instance.slot_duration_minutes
    )


    # ======================================================
    # First deactivate previous slots
    #
    # Existing historical slot records delete করছি না।
    # Appointment relation থাকলেও safe থাকবে।
    # ======================================================

    instance.slots.update(
        is_active=False
    )


    current = start_datetime


    # ======================================================
    # Generate Slots
    # ======================================================

    while current < end_datetime:

        slot_end = (
            current +
            slot_duration
        )


        # Slot end schedule end-এর বাইরে যাবে না

        if slot_end > end_datetime:

            break


        TimeSlot.objects.update_or_create(

            schedule=instance,

            slot_time=current.time(),

            defaults={

                "max_patient":
                    instance.max_patient_per_slot,

                "is_active":
                    True,

            },

        )


        current = slot_end