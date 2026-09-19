from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("doctors", "0012_healthtip"),
    ]

    operations = [
        migrations.AlterField(
            model_name="doctor",
            name="department",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="doctors",
                to="doctors.department",
            ),
        ),
        migrations.AlterField(
            model_name="doctor",
            name="specialization",
            field=models.CharField(
                blank=True,
                default="",
                max_length=150,
            ),
        ),
        migrations.AlterField(
            model_name="doctor",
            name="qualification",
            field=models.CharField(
                blank=True,
                default="",
                max_length=200,
            ),
        ),
        migrations.AlterField(
            model_name="doctor",
            name="experience",
            field=models.PositiveIntegerField(
                default=0,
                help_text="Experience in years",
            ),
        ),
        migrations.AlterField(
            model_name="doctor",
            name="consultation_fee",
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                max_digits=8,
            ),
        ),
    ]