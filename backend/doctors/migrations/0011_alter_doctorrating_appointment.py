from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0002_alter_appointment_symptoms_and_more"),
        ("doctors", "0010_doctorrating"),
    ]

    operations = [
        migrations.AlterField(
            model_name="doctorrating",
            name="appointment",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="doctor_rating",
                to="appointments.appointment",
            ),
        ),
    ]
