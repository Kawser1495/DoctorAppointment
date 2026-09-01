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

    today = timezone.now().strftime("%Y%m%d")

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

        default="",

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

            # ------------------------------------------------
            # Prevent exact duplicate appointment
            # ------------------------------------------------

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

        indexes = [

            models.Index(

                fields=[

                    "patient",

                    "-appointment_date",

                ]

            ),

            models.Index(

                fields=[

                    "doctor",

                    "appointment_date",

                ]

            ),

            models.Index(

                fields=[

                    "slot",

                    "appointment_date",

                ]

            ),

            models.Index(

                fields=[

                    "status",

                ]

            ),

            models.Index(

                fields=[

                    "booking_number",

                ]

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

        # ==================================================
        # Patient validation
        # ==================================================

        if self.patient_id:

            try:

                patient = self.patient

                if not patient.user:

                    raise ValidationError({

                        "patient":
                        "Selected patient has no associated user."

                    })

                if patient.user.role != "patient":

                    raise ValidationError({

                        "patient":
                        "Only patient users can have appointments."

                    })

            except PatientProfile.DoesNotExist:

                raise ValidationError({

                    "patient":
                    "Patient profile does not exist."

                })

        # ==================================================
        # Family Member validation
        # ==================================================

        if self.family_member_id:

            if not self.patient_id:

                raise ValidationError({

                    "family_member":
                    "Patient must be selected before selecting a family member."

                })

            # ----------------------------------------------
            # Family member MUST belong to this patient
            # ----------------------------------------------

            if self.family_member.patient_id != self.patient_id:

                raise ValidationError({

                    "family_member":
                    "This family member does not belong to the selected patient."

                })

        # ==================================================
        # Doctor validation
        # ==================================================

        if not self.doctor_id:

            raise ValidationError({

                "doctor":
                "Doctor is required."

            })

        # ==================================================
        # Slot validation
        # ==================================================

        if not self.slot_id:

            raise ValidationError({

                "slot":
                "Time slot is required."

            })

        # ==================================================
        # Slot must belong to selected doctor
        # ==================================================

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

        # ==================================================
        # Appointment Date Validation
        # ==================================================

        if not self.appointment_date:

            raise ValidationError({

                "appointment_date":
                "Appointment date is required."

            })

        # ==================================================
        # Prevent past appointment date
        # ==================================================

        today = timezone.localdate()

        if self.appointment_date < today:

            raise ValidationError({

                "appointment_date":
                "Appointment date cannot be in the past."

            })

        # ==================================================
        # Appointment date must match schedule day
        # ==================================================

        if (

            self.slot_id

            and

            self.appointment_date

        ):

            appointment_day = (

                self.appointment_date.strftime("%A")

            )

            schedule_day = self.slot.schedule.day

            if appointment_day != schedule_day:

                raise ValidationError({

                    "appointment_date":

                    f"This appointment date is "
                    f"{appointment_day}, but the selected "
                    f"slot belongs to {schedule_day} schedule."

                })

        # ==================================================
        # Slot Active Check
        # ==================================================

        if (

            self.slot_id

            and

            not self.slot.is_active

        ):

            raise ValidationError({

                "slot":
                "This time slot is currently inactive."

            })

        # ==================================================
        # Slot Full Check
        # ==================================================
        #
        # When updating an existing appointment, the current
        # appointment should not make its own slot appear full.
        #
        # ==================================================

        if self.slot_id:

            existing_appointments = (

                Appointment.objects

                .filter(

                    slot=self.slot,

                    appointment_date=self.appointment_date,

                )

                .exclude(

                    status__in=[

                        "Cancelled",

                        "Rejected",

                    ]

                )

            )

            if self.pk:

                existing_appointments = (

                    existing_appointments.exclude(

                        pk=self.pk

                    )

                )

            if (

                self.slot.capacity

                and

                existing_appointments.count()

                >=

                self.slot.capacity

            ):

                raise ValidationError({

                    "slot":
                    "This time slot is already full."

                })

        # ==================================================
        # Reason Validation
        # ==================================================

        if self.reason is not None:

            self.reason = self.reason.strip()

            if not self.reason:

                raise ValidationError({

                    "reason":
                    "Appointment reason cannot be empty."

                })

        # ==================================================
        # Symptoms Cleanup
        # ==================================================

        if self.symptoms:

            self.symptoms = self.symptoms.strip()

    # ======================================================
    # Save with Validation
    # ======================================================

    def save(self, *args, **kwargs):

        self.full_clean()

        super().save(
            *args,
            **kwargs
        )