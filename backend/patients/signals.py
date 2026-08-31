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

    # ------------------------------------------------------
    # Only Patient users should have PatientProfile
    # ------------------------------------------------------

    if instance.role != "patient":
        return

    # ------------------------------------------------------
    # Create profile only when user is newly created
    # ------------------------------------------------------

    if created:

        PatientProfile.objects.get_or_create(
            user=instance,
            defaults={
                "phone_number": instance.phone or None,
            },
        )