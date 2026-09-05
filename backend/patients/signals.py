from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import CustomUser

from .models import PatientProfile


# ==========================================================
# Automatically Create Patient Profile
# ==========================================================

@receiver(
    post_save,
    sender=CustomUser,
)
def create_patient_profile(
    sender,
    instance,
    created,
    **kwargs,
):
    """
    Automatically create a PatientProfile when a new
    patient user is created.

    Phone number is stored in CustomUser.phone.
    PatientProfile does not have a phone_number field.
    """

    if not created:
        return

    if instance.role != "patient":
        return

    PatientProfile.objects.get_or_create(
        user=instance,
    )