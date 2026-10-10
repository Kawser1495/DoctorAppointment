from datetime import date

from django.test import TestCase

from accounts.models import CustomUser
from appointments.models import Appointment
from doctors.models import Department, Doctor, DoctorSchedule, TimeSlot
from doctors.serializers import DoctorRatingSerializer


class DoctorRatingSerializerTests(TestCase):

    def setUp(self):
        self.patient_user = CustomUser.objects.create_user(
            username="patient_rater",
            email="patient_rater@example.com",
            password="StrongPass123!",
            role="patient",
            phone="1111111111",
            is_verified=True,
        )
        self.doctor_user = CustomUser.objects.create_user(
            username="doctor_rater",
            email="doctor_rater@example.com",
            password="StrongPass123!",
            role="doctor",
            phone="2222222222",
            is_verified=True,
        )

        self.department = Department.objects.create(
            name="Cardiology",
            description="Cardiology department",
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            department=self.department,
            specialization="Cardiology",
            qualification="MD",
            experience=8,
            consultation_fee="250.00",
        )
        self.schedule = DoctorSchedule.objects.create(
            doctor=self.doctor,
            day="Monday",
            start_time="09:00:00",
            end_time="10:00:00",
            slot_duration_minutes=30,
            max_patient_per_slot=5,
        )
        self.slot = TimeSlot.objects.get(
            schedule=self.schedule,
            slot_time="09:00:00",
        )
        self.appointment = Appointment.objects.create(
            patient=self.patient_user.patient_profile,
            doctor=self.doctor,
            slot=self.slot,
            appointment_date=date(2026, 9, 5),
            reason="Regular consultation",
            status="Completed",
        )

    def test_completed_appointment_rating_accepts_patient_only_payload(self):
        serializer = DoctorRatingSerializer(
            data={
                "appointment": self.appointment.id,
                "rating": 5,
                "review": "Excellent care and clear advice.",
            },
            context={"request": type("Req", (), {"user": self.patient_user})()},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        rating = serializer.save(
            doctor=self.doctor,
            patient=self.patient_user.patient_profile,
        )

        self.assertEqual(rating.doctor, self.doctor)
        self.assertEqual(rating.patient, self.patient_user.patient_profile)
        self.assertEqual(rating.appointment, self.appointment)
        self.assertEqual(rating.rating, 5)

    def test_active_appointment_rating_accepts_patient_comment(self):
        self.appointment.status = "Pending"
        self.appointment.save(update_fields=["status"])

        serializer = DoctorRatingSerializer(
            data={
                "appointment": self.appointment.id,
                "rating": 4,
                "review": "Easy booking and helpful communication.",
            },
            context={"request": type("Req", (), {"user": self.patient_user})()},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_cancelled_appointment_rating_is_rejected(self):
        self.appointment.status = "Cancelled"
        self.appointment.save(update_fields=["status"])

        serializer = DoctorRatingSerializer(
            data={
                "appointment": self.appointment.id,
                "rating": 4,
                "review": "This should not be accepted.",
            },
            context={"request": type("Req", (), {"user": self.patient_user})()},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("appointment", serializer.errors)

    def test_patient_can_review_doctor_without_an_appointment(self):
        serializer = DoctorRatingSerializer(
            data={
                "doctor": self.doctor.id,
                "rating": 4,
                "review": "The doctor profile was helpful.",
            },
            context={"request": type("Req", (), {"user": self.patient_user})()},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        rating = serializer.save()

        self.assertEqual(rating.doctor, self.doctor)
        self.assertEqual(rating.patient, self.patient_user.patient_profile)
        self.assertIsNone(rating.appointment)
