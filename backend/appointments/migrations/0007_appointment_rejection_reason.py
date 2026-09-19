from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0006_remove_invalid_ai_reports"),
    ]

    operations = [
        migrations.AddField(
            model_name="appointment",
            name="rejection_reason",
            field=models.TextField(
                blank=True,
                default="",
                help_text="Reason provided by the doctor when rejecting an appointment.",
            ),
        ),
    ]