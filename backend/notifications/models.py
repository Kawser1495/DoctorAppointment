from django.db import models

from accounts.models import CustomUser


class Notification(models.Model):

    # ==========================================================
    # Notification Types
    # ==========================================================

    NOTIFICATION_TYPES = (

        ("Doctor Registration", "Doctor Registration"),

        ("Doctor Approved", "Doctor Approved"),

        ("Doctor Rejected", "Doctor Rejected"),

        ("Appointment", "Appointment"),

        ("Payment", "Payment"),

        ("Report", "Report"),

        ("Diagnostic", "Diagnostic"),

        ("General", "General"),

    )

    # ==========================================================
    # User
    # ==========================================================

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    # ==========================================================
    # Notification Information
    # ==========================================================

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default="General",
    )

    title = models.CharField(
        max_length=200,
    )

    message = models.TextField()

    # ==========================================================
    # Read Status
    # ==========================================================

    is_read = models.BooleanField(
        default=False,
    )

    # ==========================================================
    # Created
    # ==========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ==========================================================
    # Meta
    # ==========================================================

    class Meta:

        ordering = [
            "-created_at"
        ]

        verbose_name = "Notification"

        verbose_name_plural = "Notifications"

    # ==========================================================
    # String Representation
    # ==========================================================

    def __str__(self):

        return (
            f"{self.user.username} | "
            f"{self.title}"
        )