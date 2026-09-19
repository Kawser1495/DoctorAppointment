from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0005_refundrequest_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="payment",
            name="refunded_amount",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=10,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="payment",
            name="refund_retained_amount",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=10,
                null=True,
            ),
        ),
    ]
