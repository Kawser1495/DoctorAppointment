from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reports", "0010_medicalreport_admin_result_published"),
    ]

    operations = [
        migrations.AddField(
            model_name="medicalreport",
            name="admin_managed",
            field=models.BooleanField(
                db_index=True,
                default=False,
                help_text="True when an administrator has edited or supplied this report.",
            ),
        ),
    ]