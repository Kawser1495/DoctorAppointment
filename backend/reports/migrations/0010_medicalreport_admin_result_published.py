from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("reports", "0009_medicalreport_structured_content"),
    ]

    operations = [
        migrations.AddField(
            model_name="medicalreport",
            name="admin_result_published",
            field=models.BooleanField(default=False, db_index=True),
        ),
    ]
