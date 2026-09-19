import os

os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"

import django
django.setup()

from django.db.models.signals import post_save
from django.core.management import call_command

from doctors.models import DoctorSchedule
from doctors.signals import generate_time_slots

from appointments.models import Appointment
from appointments.signals import update_slot

from accounts.models import CustomUser
from patients.signals import create_patient_profile


post_save.disconnect(
    generate_time_slots,
    sender=DoctorSchedule,
)

post_save.disconnect(
    update_slot,
    sender=Appointment,
)

post_save.disconnect(
    create_patient_profile,
    sender=CustomUser,
)

print("Required signals temporarily disconnected.")
print("Starting PostgreSQL data import...")

try:
    call_command(
        "loaddata",
        "sqlite_data_before_postgresql.json",
    )
finally:
    post_save.connect(
        generate_time_slots,
        sender=DoctorSchedule,
    )

    post_save.connect(
        update_slot,
        sender=Appointment,
    )

    post_save.connect(
        create_patient_profile,
        sender=CustomUser,
    )

    print("Signals reconnected.")