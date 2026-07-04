from django.db import models
from patients.models import PatientProfile

class TestCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
    
class DiagnosticTest(models.Model):
    category = models.ForeignKey(TestCategory, on_delete=models.CASCADE)
    test_name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField()

    def __str__(self):
        return self.test_name
