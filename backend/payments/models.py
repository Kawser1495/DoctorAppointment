from django.db import models
from patients.models import PatientProfile

class Payment(models.Model):
    PAYMENT_METHODS = (
        ('bkash', 'Bkash'),
        ('nagad', 'Nagad'),
        ('card', 'Card'),
        ('cash', 'Cash'),
    )

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_status = models.CharField(max_length=20, default='paid')
    transaction_id = models.CharField(max_length=100)

    def __str__(self):
        return self.transaction_id
