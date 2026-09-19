from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reports", "0008_feedbackmessage"),
    ]

    operations = [
        migrations.AddField(
            model_name="medicalreport",
            name="clinical_history",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="medicalreport",
            name="vitals",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="medicalreport",
            name="diagnostic_tests",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
