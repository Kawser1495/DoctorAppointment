from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("appointments", "0011_remove_appointment_unique_patient_doctor_slot_family_date_and_more"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="appointment",
            name="unique_patient_doctor_slot_date",
        ),
        migrations.AddConstraint(
            model_name="appointment",
            constraint=models.UniqueConstraint(
                condition=models.Q(
                    family_member__isnull=True,
                    status__in=["Pending", "Confirmed"],
                ),
                fields=("patient", "doctor", "appointment_date", "slot"),
                name="unique_patient_doctor_slot_date_direct",
            ),
        ),
        migrations.AddConstraint(
            model_name="appointment",
            constraint=models.UniqueConstraint(
                condition=models.Q(
                    family_member__isnull=False,
                    status__in=["Pending", "Confirmed"],
                ),
                fields=("patient", "doctor", "appointment_date", "slot", "family_member"),
                name="unique_patient_doctor_slot_date_family",
            ),
        ),
    ]