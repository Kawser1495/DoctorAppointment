from django.db import migrations, models
import django.db.models.deletion


def copy_ai_report_payments(apps, schema_editor):
    Payment = apps.get_model("payments", "Payment")
    AIReportPayment = apps.get_model("appointments", "AISymptomReportPayment")
    for old_payment in AIReportPayment.objects.all().iterator():
        Payment.objects.get_or_create(
            transaction_id=old_payment.transaction_id,
            defaults={
                "patient_id": old_payment.patient_id,
                "ai_symptom_report_id": old_payment.report_id,
                "amount": old_payment.amount,
                "payment_mode": "Full",
                "payment_method": old_payment.payment_method,
                "payment_status": old_payment.payment_status,
                "is_refundable": False,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0008_payment_sslcommerz"),
        ("appointments", "0010_aisymptomreportpayment"),
    ]

    operations = [
        migrations.AddField(
            model_name="payment",
            name="ai_symptom_report",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="payments", to="appointments.aisymptomreport"),
        ),
        migrations.RemoveConstraint(
            model_name="payment",
            name="payment_for_exactly_one_source",
        ),
        migrations.AddConstraint(
            model_name="payment",
            constraint=models.CheckConstraint(
                condition=(
                    models.Q(("appointment__isnull", False))
                    ^ models.Q(("test_booking__isnull", False))
                    ^ models.Q(("ai_symptom_report__isnull", False))
                ),
                name="payment_for_exactly_one_source",
            ),
        ),
        migrations.RunPython(copy_ai_report_payments, migrations.RunPython.noop),
    ]