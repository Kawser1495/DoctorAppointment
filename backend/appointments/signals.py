from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Appointment


@receiver(post_save, sender=Appointment)

def update_slot(sender, instance, created, **kwargs):

    if created:

        slot = instance.slot

        slot.booked_count += 1

        slot.save()