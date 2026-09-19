from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("appointments", "0004_aisymptomreport")]

    operations = [
        migrations.AddField(model_name="aisymptomreport", name="duration", field=models.CharField(blank=True, default="", max_length=80)),
        migrations.AddField(model_name="aisymptomreport", name="severity", field=models.CharField(blank=True, default="", max_length=30)),
        migrations.AddField(model_name="aisymptomreport", name="possible_conditions", field=models.TextField(blank=True, default="")),
        migrations.AddField(model_name="aisymptomreport", name="doctor_assessment", field=models.TextField(blank=True, default="")),
        migrations.AddField(model_name="aisymptomreport", name="updated_at", field=models.DateTimeField(auto_now=True)),
    ]
