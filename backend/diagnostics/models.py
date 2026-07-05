from django.db import models
from patients.models import PatientProfile, FamilyMember


class TestCategory(models.Model):

    name = models.CharField(max_length=100, unique=True)

    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Test Categories"

    def __str__(self):
        return self.name
    
    
    class DiagnosticTest(models.Model):

    category = models.ForeignKey(
        TestCategory,
        on_delete=models.CASCADE,
        related_name="tests"
    )

    name = models.CharField(max_length=150)

    price = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    preparation = models.TextField(
        blank=True,
        help_text="Preparation before the test"
    )

    duration = models.CharField(
        max_length=100,
        blank=True
    )

    description = models.TextField(blank=True)

    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
    
    
    class TestBooking(models.Model):

    STATUS = [

        ('Pending', 'Pending'),

        ('Confirmed', 'Confirmed'),

        ('Completed', 'Completed'),

        ('Cancelled', 'Cancelled')

    ]

    booking_number = models.CharField(
        max_length=25,
        unique=True
    )

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE
    )

    family_member = models.ForeignKey(
        FamilyMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    diagnostic_test = models.ForeignKey(
        DiagnosticTest,
        on_delete=models.CASCADE
    )

    booking_date = models.DateField()

    booking_time = models.TimeField()

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="Pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.booking_number