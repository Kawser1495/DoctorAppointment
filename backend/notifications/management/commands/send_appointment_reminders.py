from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from appointments.models import Appointment
from notifications.models import Notification


class Command(BaseCommand):

    help = "Create idempotent doctor reminders for appointments due soon."

    def handle(self, *args, **options):

        now = timezone.localtime()
        window_end = now + timedelta(minutes=30)

        appointments = Appointment.objects.filter(
            appointment_date=now.date(),
            status__in=["Pending", "Confirmed"],
        ).select_related(
            "doctor__user",
            "patient__user",
            "family_member",
            "slot",
        )

        created_count = 0

        for appointment in appointments:

            appointment_datetime = timezone.make_aware(
                datetime.combine(
                    appointment.appointment_date,
                    appointment.slot.slot_time,
                ),
                timezone.get_current_timezone(),
            )

            if not now <= appointment_datetime <= window_end:
                continue

            patient_name = (
                appointment.family_member.name
                if appointment.family_member
                else appointment.patient.user.get_full_name().strip()
                or appointment.patient.user.username
            )

            appointment_time = appointment.slot.slot_time.strftime(
                "%I:%M %p"
            )

            title = "Appointment Reminder"
            message = (
                f"You have an appointment with {patient_name} today at "
                f"{appointment_time}."
            )

            _, created = Notification.objects.get_or_create(
                user=appointment.doctor.user,
                title=title,
                message=message,
                defaults={
                    "notification_type": "Appointment",
                    "is_read": False,
                },
            )

            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created_count} appointment reminder(s)."
            )
        )