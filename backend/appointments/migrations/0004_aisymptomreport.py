from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0003_appointment_ai_report"),
        ("doctors", "0011_alter_doctorrating_appointment"),
        ("patients", "0004_familymember_blood_group"),
    ]

    operations = [
        migrations.CreateModel(
            name="AISymptomReport",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("symptoms", models.TextField()),
                ("ai_category", models.CharField(blank=True, default="", max_length=120)),
                ("ai_urgency", models.CharField(blank=True, default="", max_length=20)),
                ("ai_specialist", models.CharField(blank=True, default="", max_length=120)),
                ("ai_guidance", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("doctor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ai_symptom_reports", to="doctors.doctor")),
                ("patient", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ai_symptom_reports", to="patients.patientprofile")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
