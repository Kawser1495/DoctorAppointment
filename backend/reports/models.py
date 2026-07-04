from django.db import models
from patients.models import PatientProfile

class MedicalReport(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)
    report_title = models.CharField(max_length=100)
    report_file = models.FileField(upload_to='medical_reports/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.report_title
