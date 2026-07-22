from django.db import models

from accounts.models import CustomUser


# ==========================================
# Patient Profile Model
# ==========================================

class PatientProfile(models.Model):

    GENDER_CHOICES = (

        ("Male", "Male"),

        ("Female", "Female"),

        ("Other", "Other"),

    )

    BLOOD_GROUP_CHOICES = (

        ("A+", "A+"),
        ("A-", "A-"),

        ("B+", "B+"),
        ("B-", "B-"),

        ("AB+", "AB+"),
        ("AB-", "AB-"),

        ("O+", "O+"),
        ("O-", "O-"),

    )

    user = models.OneToOneField(

        CustomUser,

        on_delete=models.CASCADE,

        related_name="patient_profile",

    )

    phone_number = models.CharField(

        max_length=15,

        unique=True,

    )

    gender = models.CharField(

        max_length=10,

        choices=GENDER_CHOICES,

    )

    date_of_birth = models.DateField()

    blood_group = models.CharField(

        max_length=5,

        choices=BLOOD_GROUP_CHOICES,

    )

    address = models.TextField()

    emergency_contact = models.CharField(

        max_length=15,

    )

    created_at = models.DateTimeField(

        auto_now_add=True,

    )

    updated_at = models.DateTimeField(

        auto_now=True,

    )

    class Meta:

        ordering = ["user__first_name"]

        verbose_name = "Patient"

        verbose_name_plural = "Patients"

    def __str__(self):

        return self.user.get_full_name()


# ==========================================
# Family Member Model
# ==========================================

class FamilyMember(models.Model):

    RELATION_CHOICES = (

        ("Father", "Father"),

        ("Mother", "Mother"),

        ("Brother", "Brother"),

        ("Sister", "Sister"),

        ("Husband", "Husband"),

        ("Wife", "Wife"),

        ("Son", "Son"),

        ("Daughter", "Daughter"),

        ("Other", "Other"),

    )

    GENDER_CHOICES = (

        ("Male", "Male"),

        ("Female", "Female"),

        ("Other", "Other"),

    )

    patient = models.ForeignKey(

        PatientProfile,

        on_delete=models.CASCADE,

        related_name="family_members",

    )

    name = models.CharField(

        max_length=100,

    )

    relation = models.CharField(

        max_length=20,

        choices=RELATION_CHOICES,

    )

    age = models.PositiveIntegerField()

    gender = models.CharField(

        max_length=10,

        choices=GENDER_CHOICES,

    )

    phone_number = models.CharField(

        max_length=15,

        blank=True,

        null=True,

    )

    created_at = models.DateTimeField(

        auto_now_add=True,

    )

    class Meta:

        ordering = ["name"]

        verbose_name = "Family Member"

        verbose_name_plural = "Family Members"

    def __str__(self):

        return f"{self.name} ({self.relation})"
