from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [("appointments", "0009_aisymptomreport_payment")]

    operations = [
        migrations.CreateModel(
            name="AISymptomReportPayment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("amount", models.DecimalField(decimal_places=2, default=100, max_digits=8)),
                ("payment_method", models.CharField(default="Card", max_length=20)),
                ("transaction_id", models.CharField(max_length=80, unique=True)),
                ("payment_status", models.CharField(default="Paid", max_length=20)),
                ("paid_at", models.DateTimeField(auto_now_add=True)),
                ("patient", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ai_report_payments", to="patients.patientprofile")),
                ("report", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="payment", to="appointments.aisymptomreport")),
            ],
            options={"ordering": ["-paid_at"]},
        ),
    ]