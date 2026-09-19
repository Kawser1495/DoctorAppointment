from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("appointments", "0008_allow_family_member_slot_bookings")]

    operations = [
        migrations.AddField(
            model_name="aisymptomreport",
            name="consultation_fee",
            field=models.DecimalField(decimal_places=2, default=100, max_digits=8),
        ),
        migrations.AddField(
            model_name="aisymptomreport",
            name="paid_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="aisymptomreport",
            name="payment_status",
            field=models.CharField(choices=[("Pending", "Pending"), ("Paid", "Paid"), ("Failed", "Failed")], default="Pending", max_length=20),
        ),
        migrations.AddField(
            model_name="aisymptomreport",
            name="payment_transaction_id",
            field=models.CharField(blank=True, default="", max_length=80),
        ),
    ]