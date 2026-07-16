from django.db import models
from accounts.models import CustomUser


# ==========================
# Department Model
# ==========================

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Department"
        verbose_name_plural = "Departments"

    def __str__(self):
        return self.name


# ==========================
# Doctor Model
# ==========================

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

    specialization = models.CharField(max_length=150)

    qualification = models.CharField(max_length=200)

    experience = models.PositiveIntegerField(
        help_text="Experience in years"
    )

    consultation_fee = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    biography = models.TextField(blank=True)

    profile_image = models.ImageField(
        upload_to="doctor_profiles/",
        blank=True,
        null=True
    )

    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user__first_name"]
        verbose_name = "Doctor"
        verbose_name_plural = "Doctors"

    def __str__(self):
        return f"Dr. {self.user.get_full_name()}"


# ==========================
# Doctor Schedule
# ==========================

class DoctorSchedule(models.Model):

    DAYS = (
        ("Sunday", "Sunday"),
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
        ("Saturday", "Saturday"),
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="schedules"
    )

    day = models.CharField(
        max_length=20,
        choices=DAYS
    )

    start_time = models.TimeField()

    end_time = models.TimeField()

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("doctor", "day")
        ordering = ["doctor", "day"]

    def __str__(self):
        return f"{self.doctor} - {self.day}"


# ==========================
# Time Slot
# ==========================

class TimeSlot(models.Model):

    schedule = models.ForeignKey(
        DoctorSchedule,
        on_delete=models.CASCADE,
        related_name="slots"
    )

    slot_time = models.TimeField()

    max_patient = models.PositiveIntegerField(default=1)

    booked_count = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["slot_time"]
        unique_together = ("schedule", "slot_time")

    def __str__(self):
        return f"{self.schedule.day} | {self.slot_time}"

    @property
    def is_full(self):
        return self.booked_count >= self.max_patient