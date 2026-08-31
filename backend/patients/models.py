from django.core.exceptions import ValidationError
from django.db import models

from accounts.models import CustomUser


# ==========================================================
# Patient Profile
# ==========================================================

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

    # ------------------------------------------------------
    # User
    # ------------------------------------------------------

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="patient_profile",
    )

    # ------------------------------------------------------
    # Patient Phone
    # ------------------------------------------------------
    # Optional because phone already exists in CustomUser.
    # We keep this field for patient-specific profile data.
    # ------------------------------------------------------

    phone_number = models.CharField(
        max_length=15,
        unique=True,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # Gender
    # ------------------------------------------------------

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # Date of Birth
    # ------------------------------------------------------

    date_of_birth = models.DateField(
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # Blood Group
    # ------------------------------------------------------

    blood_group = models.CharField(
        max_length=5,
        choices=BLOOD_GROUP_CHOICES,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # Address
    # ------------------------------------------------------

    address = models.TextField(
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # Emergency Contact
    # ------------------------------------------------------

    emergency_contact = models.CharField(
        max_length=15,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # Timestamps
    # ------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ======================================================
    # Meta
    # ======================================================

    class Meta:

        ordering = [
            "user__first_name",
            "user__username",
        ]

        verbose_name = "Patient"

        verbose_name_plural = "Patients"

    # ======================================================
    # String Representation
    # ======================================================

    def __str__(self):

        full_name = self.user.get_full_name()

        if full_name:
            return full_name

        return self.user.username

    # ======================================================
    # Profile Completion
    # ======================================================

    @property
    def is_complete(self):

        required_fields = [
            self.phone_number,
            self.gender,
            self.date_of_birth,
            self.blood_group,
            self.address,
            self.emergency_contact,
        ]

        return all(
            field not in [None, ""]
            for field in required_fields
        )

    # ======================================================
    # Profile Completion Percentage
    # ======================================================

    @property
    def completion_percentage(self):

        fields = [
            self.phone_number,
            self.gender,
            self.date_of_birth,
            self.blood_group,
            self.address,
            self.emergency_contact,
        ]

        completed = sum(
            1
            for field in fields
            if field not in [None, ""]
        )

        if not fields:
            return 0

        return int(
            (completed / len(fields)) * 100
        )

    # ======================================================
    # Validation
    # ======================================================

    def clean(self):

        super().clean()

        # --------------------------------------------------
        # Patient role validation
        # --------------------------------------------------

        if self.user:

            if self.user.role != "patient":

                raise ValidationError(
                    {
                        "user":
                        "Only users with patient role can have a patient profile."
                    }
                )

        # --------------------------------------------------
        # Phone validation
        # --------------------------------------------------

        if self.phone_number:

            phone = self.phone_number.strip()

            if not phone.isdigit():

                raise ValidationError(
                    {
                        "phone_number":
                        "Phone number must contain only digits."
                    }
                )

            if len(phone) < 10 or len(phone) > 15:

                raise ValidationError(
                    {
                        "phone_number":
                        "Phone number must contain 10 to 15 digits."
                    }
                )

            self.phone_number = phone

        # --------------------------------------------------
        # Emergency contact validation
        # --------------------------------------------------

        if self.emergency_contact:

            emergency = self.emergency_contact.strip()

            if not emergency.isdigit():

                raise ValidationError(
                    {
                        "emergency_contact":
                        "Emergency contact must contain only digits."
                    }
                )

            if len(emergency) < 10 or len(emergency) > 15:

                raise ValidationError(
                    {
                        "emergency_contact":
                        "Emergency contact must contain 10 to 15 digits."
                    }
                )

            self.emergency_contact = emergency

    # ======================================================
    # Save
    # ======================================================

    def save(self, *args, **kwargs):

        self.full_clean()

        super().save(*args, **kwargs)


# ==========================================================
# Family Member
# ==========================================================

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

    # ------------------------------------------------------
    # Patient
    # ------------------------------------------------------

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name="family_members",
    )

    # ------------------------------------------------------
    # Name
    # ------------------------------------------------------

    name = models.CharField(
        max_length=100,
    )

    # ------------------------------------------------------
    # Relation
    # ------------------------------------------------------

    relation = models.CharField(
        max_length=20,
        choices=RELATION_CHOICES,
    )

    # ------------------------------------------------------
    # Age
    # ------------------------------------------------------

    age = models.PositiveIntegerField()

    # ------------------------------------------------------
    # Gender
    # ------------------------------------------------------

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
    )

    # ------------------------------------------------------
    # Phone
    # ------------------------------------------------------

    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------
    # Timestamp
    # ------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    # ======================================================
    # Meta
    # ======================================================

    class Meta:

        ordering = [
            "name",
        ]

        verbose_name = "Family Member"

        verbose_name_plural = "Family Members"

    # ======================================================
    # String Representation
    # ======================================================

    def __str__(self):

        return f"{self.name} ({self.relation})"

    # ======================================================
    # Validation
    # ======================================================

    def clean(self):

        super().clean()

        # --------------------------------------------------
        # Name
        # --------------------------------------------------

        if self.name:

            self.name = " ".join(
                self.name.strip().split()
            )

        if not self.name:

            raise ValidationError(
                {
                    "name":
                    "Family member name cannot be empty."
                }
            )

        # --------------------------------------------------
        # Age
        # --------------------------------------------------

        if self.age < 0 or self.age > 130:

            raise ValidationError(
                {
                    "age":
                    "Age must be between 0 and 130."
                }
            )

        # --------------------------------------------------
        # Phone
        # --------------------------------------------------

        if self.phone_number:

            phone = self.phone_number.strip()

            if not phone.isdigit():

                raise ValidationError(
                    {
                        "phone_number":
                        "Phone number must contain only digits."
                    }
                )

            if len(phone) < 10 or len(phone) > 15:

                raise ValidationError(
                    {
                        "phone_number":
                        "Phone number must contain 10 to 15 digits."
                    }
                )

            self.phone_number = phone

    # ======================================================
    # Save
    # ======================================================

    def save(self, *args, **kwargs):

        self.full_clean()

        super().save(*args, **kwargs)