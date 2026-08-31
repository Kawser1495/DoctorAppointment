import uuid

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from patients.models import (
    PatientProfile,
    FamilyMember,
)

from doctors.models import (
    Doctor,
    TimeSlot,
)


# ==========================================================
# Booking Number Generator
# ==========================================================

def generate_booking_number():

    today = timezone.now().strftime(
        "%Y%m%d"
    )

    unique = uuid.uuid4().hex[:6].upper()

    return f"APT-{today}-{unique}"


# ==========================================================
# Appointment Model
# ==========================================================

class Appointment(models.Model):

    # ======================================================
    # Appointment Status
    # ======================================================

    STATUS_CHOICES = [

        ("Pending", "Pending"),

        ("Confirmed", "Confirmed"),

        ("Completed", "Completed"),

        ("Cancelled", "Cancelled"),

        ("Rejected", "Rejected"),

        ("No Show", "No Show"),

    ]


    # ======================================================
    # Booking Number
    # ======================================================

    booking_number = models.CharField(

        max_length=30,

        unique=True,

        default=generate_booking_number,

        editable=False,

    )


    # ======================================================
    # Patient
    # ======================================================

    patient = models.ForeignKey(

        PatientProfile,

        on_delete=models.CASCADE,

        related_name="appointments",

    )


    # ======================================================
    # Family Member
    # ======================================================

    family_member = models.ForeignKey(

        FamilyMember,

        on_delete=models.SET_NULL,

        null=True,

        blank=True,

        related_name="appointments",

    )


    # ======================================================
    # Doctor
    # ======================================================

    doctor = models.ForeignKey(

        Doctor,

        on_delete=models.CASCADE,

        related_name="appointments",

    )


    # ======================================================
    # Time Slot
    # ======================================================

    slot = models.ForeignKey(

        TimeSlot,

        on_delete=models.CASCADE,

        related_name="appointments",

    )


    # ======================================================
    # Appointment Date
    # ======================================================

    appointment_date = models.DateField()


    # ======================================================
    # Reason
    # ======================================================

    reason = models.TextField(

        help_text="Reason for the appointment",

    )


    # ======================================================
    # Symptoms
    # ======================================================

    symptoms = models.TextField(

        blank=True,

        help_text="Patient symptoms (Optional)",

    )


    # ======================================================
    # Status
    # ======================================================

    status = models.CharField(

        max_length=20,

        choices=STATUS_CHOICES,

        default="Pending",

    )


    # ======================================================
    # Timestamps
    # ======================================================

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

            "-appointment_date",

            "-created_at",

        ]

        verbose_name = "Appointment"

        verbose_name_plural = "Appointments"

        constraints = [

            # Prevent exact duplicate booking

            models.UniqueConstraint(

                fields=[

                    "patient",

                    "doctor",

                    "appointment_date",

                    "slot",

                ],

                name="unique_patient_doctor_slot_date",

            ),

        ]


    # ======================================================
    # String Representation
    # ======================================================

    def __str__(self):

        if self.family_member:

            patient_name = self.family_member.name

        else:

            patient_name = (
                self.patient.user.get_full_name()
                or
                self.patient.user.username
            )

        doctor_name = (
            self.doctor.user.get_full_name()
            or
            self.doctor.user.username
        )

        return (

            f"{self.booking_number} | "

            f"{patient_name} | "

            f"Dr. {doctor_name}"

        )


    # ======================================================
    # Validation
    # ======================================================

    def clean(self):

        super().clean()


        # --------------------------------------------------
        # Slot must belong to selected doctor
        # --------------------------------------------------

        if (

            self.slot_id

            and

            self.doctor_id

        ):

            if (

                self.slot.schedule.doctor_id

                !=

                self.doctor_id

            ):

                raise ValidationError({

                    "slot":

                        "Selected time slot does not belong "
                        "to the selected doctor."

                })


        # --------------------------------------------------
        # Appointment date must match schedule day
        # --------------------------------------------------

        if (

            self.slot_id

            and

            self.appointment_date

        ):

            appointment_day = (
                self.appointment_date.strftime(
                    "%A"
                )
            )

            schedule_day = (
                self.slot.schedule.day
            )

            if appointment_day != schedule_day:

                raise ValidationError({

                    "appointment_date":

                        f"This appointment date is {appointment_day}, "

                        f"but the selected slot belongs to "

                        f"{schedule_day} schedule."

                })


        # --------------------------------------------------
        # Prevent past appointment date
        # --------------------------------------------------

        if (

            self.appointment_date

            and

            self.appointment_date < timezone.localdate()

        ):

            raise ValidationError({

                "appointment_date":

                    "Appointment date cannot be in the past."

            })


        # --------------------------------------------------
        # Prevent booking inactive slot
        # --------------------------------------------------

        if (

            self.slot_id

            and

            not self.slot.is_active

        ):

            raise ValidationError({

                "slot":

                    "This time slot is currently inactive."

            })


        # --------------------------------------------------
        # Prevent booking full slot
        # --------------------------------------------------

        if (

            self.slot_id

            and

            self.slot.is_full

        ):

            raise ValidationError({

                "slot":

                    "This time slot is already full."

            })


    # ======================================================
    # Save with Validation
    # ======================================================

    def save(self, *args, **kwargs):

        self.full_clean()

        super().save(
            *args,
            **kwargs
        )