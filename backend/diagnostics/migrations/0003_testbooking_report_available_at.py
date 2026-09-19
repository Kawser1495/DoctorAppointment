from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("diagnostics", "0002_alter_diagnostictest_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="testbooking",
            name="report_available_at",
            field=models.DateTimeField(
                blank=True,
                help_text="When the paid diagnostic report will be available to the patient.",
                null=True,
            ),
        ),
    ]