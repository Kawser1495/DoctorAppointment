from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0004_aisymptomreport"),
        ("doctors", "0012_healthtip"),
        ("patients", "0003_remove_patientprofile_phone_number"),
        ("reports", "0007_medicalreport_advice_medicalreport_follow_up_date_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="FeedbackMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("sender", models.CharField(choices=[("Doctor", "Doctor"), ("Patient", "Patient")], max_length=10)),
                ("message", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("appointment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="feedback_messages", to="appointments.appointment")),
                ("doctor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="feedback_messages", to="doctors.doctor")),
                ("patient", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="feedback_messages", to="patients.patientprofile")),
            ],
            options={"ordering": ["created_at"]},
        ),
    ]
