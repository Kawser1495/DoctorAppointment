from django.db import models
from accounts.models import CustomUser


class PatientProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    blood_group = models.CharField(max_length=5)
    address = models.TextField()
    emergency_contact = models.CharField(max_length=15)

    def __str__(self):
        return self.full_name


class FamilyMember(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    relation = models.CharField(max_length=50)
    age = models.IntegerField()
    gender = models.CharField(max_length=20)

    def __str__(self):
        return self.name
