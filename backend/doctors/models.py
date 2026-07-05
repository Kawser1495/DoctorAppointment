from django.db import models
from accounts.models import CustomUser


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()

    class Meta:
        ordering = ['name']
        verbose_name = "Department"
        verbose_name_plural = "Departments"

    def __str__(self):
        return self.name


class Doctor(models.Model):

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="doctor_profile"
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="doctors"
    )

    specialization = models.CharField(max_length=100)

    qualification = models.CharField(
        max_length=150,
        blank=True
    )

    experience = models.PositiveIntegerField(
        help_text="Experience (Years)"
    )

    consultation_fee = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    biography = models.TextField(
        blank=True
    )

    chamber_room = models.CharField(
        max_length=50,
        blank=True
    )

    profile_image = models.ImageField(
        upload_to="doctor_profiles/",
        blank=True,
        null=True
    )

    is_available = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ['user__first_name']

    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username}"


class DoctorSchedule(models.Model):

    DAY_CHOICES = [
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
    ]

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="schedules"
    )

    day = models.CharField(
        max_length=20,
        choices=DAY_CHOICES
    )

    start_time = models.TimeField()

    end_time = models.TimeField()

    is_active = models.BooleanField(
        default=True
    )

    class Meta:
        unique_together = ['doctor', 'day']
        ordering = ['day']

    def __str__(self):
        return f"{self.doctor} - {self.day}"


class TimeSlot(models.Model):

    schedule = models.ForeignKey(
        DoctorSchedule,
        on_delete=models.CASCADE,
        related_name="time_slots"
    )

    slot_time = models.TimeField()

    maximum_patients = models.PositiveIntegerField(
        default=1
    )

    booked_patients = models.PositiveIntegerField(
        default=0
    )

    is_active = models.BooleanField(
        default=True
    )

    class Meta:
        unique_together = ['schedule', 'slot_time']
        ordering = ['slot_time']

    def __str__(self):
        return f"{self.schedule.day} - {self.slot_time}"