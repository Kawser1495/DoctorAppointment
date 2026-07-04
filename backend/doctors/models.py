from django.db import models
from accounts.models import CustomUser


class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name


class Doctor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    specialization = models.CharField(max_length=100)
    experience = models.IntegerField()
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2)
    profile_image = models.ImageField(upload_to='doctor_profiles/')
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.user.username
    
    
    
class DoctorSchedule(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    day = models.CharField(max_length=20)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.doctor.user.username} - {self.day}"
