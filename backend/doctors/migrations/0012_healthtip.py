from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [("doctors", "0011_alter_doctorrating_appointment")]

    operations = [
        migrations.CreateModel(
            name="HealthTip",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=160)),
                ("content", models.TextField()),
                ("category", models.CharField(blank=True, default="General wellness", max_length=80)),
                ("is_published", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("doctor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="health_tips", to="doctors.doctor")),
            ],
            options={"ordering": ["-updated_at"]},
        ),
    ]
