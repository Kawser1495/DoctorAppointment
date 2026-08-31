from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class CustomUserManager(UserManager):

    def create_superuser(
        self,
        username,
        email=None,
        password=None,
        **extra_fields
    ):

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        # Superuser must always be Admin role
        extra_fields["role"] = "admin"

        return super().create_superuser(
            username=username,
            email=email,
            password=password,
            **extra_fields,
        )


class CustomUser(AbstractUser):

    # ==========================================================
    # USER ROLES
    # ==========================================================

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

    # ==========================================================
    # CONTACT
    # ==========================================================

    phone = models.CharField(
        max_length=15,
        unique=True,
        blank=True,
        null=True,
    )

    # ==========================================================
    # ACCOUNT STATUS
    # ==========================================================

    is_verified = models.BooleanField(
        default=False,
    )

    # ==========================================================
    # TIMESTAMPS
    # ==========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ==========================================================
    # CUSTOM USER MANAGER
    # ==========================================================

    objects = CustomUserManager()

    # ==========================================================
    # META
    # ==========================================================

    class Meta:
        ordering = ["username"]

    # ==========================================================
    # STRING REPRESENTATION
    # ==========================================================

    def __str__(self):
        return self.username

    # ==========================================================
    # ROLE HELPERS
    # ==========================================================

    @property
    def is_admin_role(self):
        return self.role == "admin" or self.is_superuser

    @property
    def is_doctor_role(self):
        return self.role == "doctor"

    @property
    def is_patient_role(self):
        return self.role == "patient"

    @property
    def is_receptionist_role(self):
        return self.role == "receptionist"