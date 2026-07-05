from django.db import models
from patients.models import PatientProfile
from appointments.models import Appointment
from diagnostics.models import TestBooking


class Payment(models.Model):

    METHODS = [

        ('Bkash', 'Bkash'),

        ('Nagad', 'Nagad'),

        ('Rocket', 'Rocket'),

        ('Card', 'Card'),

        ('Cash', 'Cash')

    ]

    STATUS = [

        ('Pending', 'Pending'),

        ('Paid', 'Paid'),

        ('Failed', 'Failed'),

        ('Refunded', 'Refunded')

    ]

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE
    )

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    test_booking = models.ForeignKey(
        TestBooking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_method = models.CharField(
        max_length=20,
        choices=METHODS
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True
    )

    payment_status = models.CharField(
        max_length=20,
        choices=STATUS,
        default='Pending'
    )

    payment_date = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.transaction_id
