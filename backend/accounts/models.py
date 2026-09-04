from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


# ==========================================================
# Custom User Manager
# ==========================================================

class CustomUserManager(UserManager):

    def create_superuser(
        self,
        username,
        email=None,
        password=None,
        **extra_fields
    ):

        extra_fields.setdefault(
            "is_staff",
            True
        )

        extra_fields.setdefault(
            "is_superuser",
            True
        )

        extra_fields.setdefault(
            "is_active",
            True
        )

        # Superuser must always be Admin
        extra_fields["role"] = "admin"

        extra_fields["doctor_status"] = (
            "not_applicable"
        )

        extra_fields["is_verified"] = True

        return super().create_superuser(
            username=username,
            email=email,
            password=password,
            **extra_fields,
        )


# ==========================================================
# Custom User Model
# ==========================================================

class CustomUser(AbstractUser):

    # ======================================================
    # USER ROLES
    # ======================================================

    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("doctor", "Doctor"),
        ("patient", "Patient"),
        ("receptionist", "Receptionist"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="patient",
        db_index=True,
    )

    # ======================================================
    # CONTACT
    # ======================================================

    phone = models.CharField(
        max_length=15,
        unique=True,
        blank=True,
        null=True,
    )

    # ======================================================
    # ACCOUNT VERIFICATION
    # ======================================================

    is_verified = models.BooleanField(
        default=False,
    )

    # ======================================================
    # DOCTOR APPROVAL STATUS
    # ======================================================

    DOCTOR_STATUS_CHOICES = (
        (
            "not_applicable",
            "Not Applicable"
        ),
        (
            "pending",
            "Pending"
        ),
        (
            "approved",
            "Approved"
        ),
        (
            "rejected",
            "Rejected"
        ),
    )

    doctor_status = models.CharField(
        max_length=20,
        choices=DOCTOR_STATUS_CHOICES,
        default="not_applicable",
        db_index=True,
    )

    doctor_rejection_reason = models.TextField(
        blank=True,
        null=True,
    )

    # ======================================================
    # TIMESTAMPS
    # ======================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ======================================================
    # CUSTOM USER MANAGER
    # ======================================================

    objects = CustomUserManager()

    # ======================================================
    # META
    # ======================================================

    class Meta:

        ordering = [
            "username"
        ]

    # ======================================================
    # STRING REPRESENTATION
    # ======================================================

    def __str__(self):

        return self.username

    # ======================================================
    # SAVE
    #
    # Keeps doctor_status consistent with role.
    # ======================================================

    def save(self, *args, **kwargs):

        if self.role != "doctor":

            self.doctor_status = (
                "not_applicable"
            )

            self.doctor_rejection_reason = None

        super().save(*args, **kwargs)

    # ======================================================
    # ROLE HELPERS
    # ======================================================

    @property
    def is_admin_role(self):

        return (
            self.role == "admin"
            or self.is_superuser
        )

    @property
    def is_doctor_role(self):

        return self.role == "doctor"

    @property
    def is_patient_role(self):

        return self.role == "patient"

    @property
    def is_receptionist_role(self):

        return self.role == "receptionist"

    # ======================================================
    # DOCTOR STATUS HELPERS
    # ======================================================

    @property
    def is_doctor_pending(self):

        return (
            self.role == "doctor"
            and self.doctor_status == "pending"
        )

    @property
    def is_doctor_approved(self):

        return (
            self.role == "doctor"
            and self.doctor_status == "approved"
        )

    @property
    def is_doctor_rejected(self):

        return (
            self.role == "doctor"
            and self.doctor_status == "rejected"
        )