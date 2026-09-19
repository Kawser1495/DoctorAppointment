from django.db import migrations


def remove_invalid_reports(apps, schema_editor):
    AISymptomReport = apps.get_model("appointments", "AISymptomReport")
    AISymptomReport.objects.filter(patient__user__role__in=["doctor", "admin"]).delete()


class Migration(migrations.Migration):

    dependencies = [("appointments", "0005_aisymptomreport_clinical_fields")]

    operations = [migrations.RunPython(remove_invalid_reports, migrations.RunPython.noop)]
