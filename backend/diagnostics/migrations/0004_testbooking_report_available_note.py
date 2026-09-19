from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("diagnostics", "0003_testbooking_report_available_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="testbooking",
            name="report_available_note",
            field=models.TextField(
                blank=True,
                help_text="Message from the diagnostic centre about report availability.",
            ),
        ),
    ]