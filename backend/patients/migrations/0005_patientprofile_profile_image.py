from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("patients", "0004_familymember_blood_group"),
    ]

    operations = [
        migrations.AddField(
            model_name="patientprofile",
            name="profile_image",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="patient_profiles/",
            ),
        ),
    ]