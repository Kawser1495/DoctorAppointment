from django.db import models
from patients.models import PatientProfile

class TestCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
