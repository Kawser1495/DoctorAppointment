from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0007_appointment_rejection_reason"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="appointment",
            name="unique_patient_doctor_slot_date",
        ),
        migrations.AddConstraint(
            model_name="appointment",
            constraint=models.UniqueConstraint(
                fields=(
                    "patient",
                    "doctor",
                    "appointment_date",
                    "slot",
                    "family_member",
                ),
                name="unique_patient_doctor_slot_family_date",
            ),
        ),
    ]