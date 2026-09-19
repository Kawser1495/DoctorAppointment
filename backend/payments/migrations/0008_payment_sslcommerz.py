from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("payments", "0007_payment_status_choices")]

    operations = [
        migrations.AlterField(
            model_name="payment",
            name="payment_method",
            field=models.CharField(
                choices=[
                    ("Bkash", "Bkash"),
                    ("Nagad", "Nagad"),
                    ("Rocket", "Rocket"),
                    ("Card", "Card"),
                    ("SSLCOMMERZ", "SSLCOMMERZ"),
                    ("Cash", "Cash"),
                ],
                max_length=20,
            ),
        ),
    ]