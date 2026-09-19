from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0002_alter_appointment_symptoms_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="appointment",
            name="ai_category",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="appointment",
            name="ai_guidance",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="appointment",
            name="ai_report_shared",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="appointment",
            name="ai_specialist",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="appointment",
            name="ai_urgency",
            field=models.CharField(blank=True, default="", max_length=20),
        ),
    ]
