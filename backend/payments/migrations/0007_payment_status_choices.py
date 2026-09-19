from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0006_payment_refund_amounts"),
    ]

    operations = [
        migrations.AlterField(
            model_name="payment",
            name="payment_status",
            field=models.CharField(
                choices=[
                    ("Pending", "Pending"),
                    ("Paid", "Paid"),
                    ("Partially Paid", "Partially Paid"),
                    ("Failed", "Failed"),
                    ("Cancelled", "Cancelled"),
                    ("Refunded", "Refunded"),
                ],
                default="Pending",
                max_length=20,
            ),
        ),
    ]