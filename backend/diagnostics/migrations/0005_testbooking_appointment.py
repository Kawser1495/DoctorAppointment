from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("diagnostics", "0004_testbooking_report_available_note"),
        ("appointments", "0001_initial"),
    ]

    operations = [migrations.AddField(
        model_name="testbooking",
        name="appointment",
        field=models.ForeignKey(
            blank=True,
            null=True,
            on_delete=django.db.models.deletion.SET_NULL,
            related_name="diagnostic_bookings",
            to="appointments.appointment",
        ),
    )]