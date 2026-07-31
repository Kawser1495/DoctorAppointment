from django.core.management.base import BaseCommand
from datetime import date

from accounts.models import CustomUser

from patients.models import PatientProfile
from diagnostics.models import (
    TestCategory,
    DiagnosticTest,
    TestBooking,
)

from random import choice
from datetime import date, timedelta
from appointments.models import Appointment

from doctors.models import (
    Department,
    Doctor,
    DoctorSchedule,
    TimeSlot,
)

from appointments.models import Appointment
from payments.models import Payment
from reports.models import MedicalReport


class Command(BaseCommand):

    help = "Seed Initial Hospital Data"

    def handle(self, *args, **kwargs):

        # ==========================================
        # Department Data
        # ==========================================

        departments = [

            ("Cardiology", "Heart Specialist"),

            ("Neurology", "Brain Specialist"),

            ("Orthopedics", "Bone Specialist"),

            ("Medicine", "General Medicine"),

            ("ENT", "Ear Nose Throat"),

            ("Gynecology", "Women Care"),

            ("Pediatrics", "Child Specialist"),

            ("Dermatology", "Skin Specialist"),

            ("Dental", "Dental Care"),

            ("Ophthalmology", "Eye Specialist"),

        ]

        for name, description in departments:

            Department.objects.get_or_create(

                name=name,

                defaults={

                    "description": description

                }

            )

        self.stdout.write(

            self.style.SUCCESS(

                "Departments Seeded Successfully"

            )

        )

        # ==========================================
        # Doctor Data
        # ==========================================

        doctor_data = [

            {
                "username": "drjohn",
                "first_name": "John",
                "last_name": "Smith",
                "email": "drjohn@example.com",
                "department": "Cardiology",
                "specialization": "Cardiologist",
                "qualification": "MBBS, FCPS",
                "experience": 12,
                "fee": 1000,
            },

            {
                "username": "drrahim",
                "first_name": "Abdur",
                "last_name": "Rahim",
                "email": "rahim@example.com",
                "department": "Medicine",
                "specialization": "Medicine Specialist",
                "qualification": "MBBS, MD",
                "experience": 10,
                "fee": 800,
            },

            {
                "username": "drkarim",
                "first_name": "Abdul",
                "last_name": "Karim",
                "email": "karim@example.com",
                "department": "Neurology",
                "specialization": "Neurologist",
                "qualification": "MBBS, FCPS",
                "experience": 8,
                "fee": 1200,
            },

            {
                "username": "dralam",
                "first_name": "Shafiul",
                "last_name": "Alam",
                "email": "alam@example.com",
                "department": "Orthopedics",
                "specialization": "Orthopedic Surgeon",
                "qualification": "MBBS, MS",
                "experience": 15,
                "fee": 1500,
            },

            {
                "username": "drfatema",
                "first_name": "Fatema",
                "last_name": "Begum",
                "email": "fatema@example.com",
                "department": "Gynecology",
                "specialization": "Gynecologist",
                "qualification": "MBBS, FCPS",
                "experience": 11,
                "fee": 1200,
            },

        ]

        for doctor in doctor_data:

            user, created = CustomUser.objects.get_or_create(

                username=doctor["username"],

                defaults={

                    "first_name": doctor["first_name"],

                    "last_name": doctor["last_name"],

                    "email": doctor["email"],

                    "role": "Doctor",

                }

            )

            if created:

                user.set_password("Doctor@123")

                user.save()

            department = Department.objects.get(

                name=doctor["department"]

            )

            Doctor.objects.get_or_create(

                user=user,

                defaults={

                    "department": department,

                    "specialization": doctor["specialization"],

                    "qualification": doctor["qualification"],

                    "experience": doctor["experience"],

                    "consultation_fee": doctor["fee"],

                    "is_available": True,

                }

            )

        self.stdout.write(

            self.style.SUCCESS(

                "Doctors Seeded Successfully"

            )

        )
        
        
        # ==========================================
        # Patient Data
        # ==========================================

        patient_data = [

            {
                "username": "patient1",
                "first_name": "Kawser",
                "last_name": "Talukder",
                "email": "patient1@example.com",
                "phone": "01711111111",
                "gender": "Male",
                "dob": "2001-01-15",
                "blood_group": "B+",
                "address": "Dhaka",
                "emergency_contact": "01811111111",
                
            },

            {
                "username": "patient2",
                "first_name": "Rahim",
                "last_name": "Uddin",
                "email": "patient2@example.com",
                "phone": "01722222222",
                "gender": "Male",
                "dob": "1999-05-20",
                "blood_group": "A+",
                "address": "Tangail",
                "emergency_contact": "01822222222",
            },

            {
                "username": "patient3",
                "first_name": "Karim",
                "last_name": "Hasan",
                "email": "patient3@example.com",
                "phone": "01733333333",
                "gender": "Male",
                "dob": "2000-03-12",
                "blood_group": "O+",
                "address": "Gazipur",
                "emergency_contact": "01833333333",
            },

            {
                "username": "patient4",
                "first_name": "Fatema",
                "last_name": "Akter",
                "email": "patient4@example.com",
                "phone": "01744444444",
                "gender": "Female",
                "dob": "2002-09-18",
                "blood_group": "AB+",
                "address": "Dhaka",
                "emergency_contact": "01844444444",
            },

            {
                "username": "patient5",
                "first_name": "Nusrat",
                "last_name": "Jahan",
                "email": "patient5@example.com",
                "phone": "01755555555",
                "gender": "Female",
                "dob": "2001-12-10",
                "blood_group": "A-",
                "address": "Mymensingh",
                "emergency_contact": "01855555555",
            },

        ]

        for patient in patient_data:

            user, created = CustomUser.objects.get_or_create(

                username=patient["username"],

                defaults={

                    "first_name": patient["first_name"],

                    "last_name": patient["last_name"],

                    "email": patient["email"],

                    "role": "Patient",

                }

            )

            if created:

                user.set_password("Patient@123")

                user.save()

            PatientProfile.objects.get_or_create(

                user=user,

                defaults={

                    "phone_number": patient["phone"],

                    "gender": patient["gender"],
                    "date_of_birth": patient["dob"],
                    "blood_group": patient["blood_group"],
                    "address": patient["address"],
                    "emergency_contact": patient["emergency_contact"],


                }

            )

        self.stdout.write(

            self.style.SUCCESS(

                "Patients Seeded Successfully"

            )

        )

        # ==========================================
        # Doctor Schedule Seeder
        # ==========================================

        schedule_data = [

            ("Sunday", "09:00", "17:00"),

            ("Monday", "09:00", "17:00"),

            ("Tuesday", "09:00", "17:00"),

            ("Wednesday", "09:00", "17:00"),

            ("Thursday", "09:00", "17:00"),

        ]

        for doctor in Doctor.objects.all():

            for day, start_time, end_time in schedule_data:

                DoctorSchedule.objects.get_or_create(

                    doctor=doctor,

                    day=day,

                    defaults={

                        "start_time": start_time,

                        "end_time": end_time,

                        "is_active": True,

                    }

                )

        self.stdout.write(

            self.style.SUCCESS(

                "Doctor Schedules Seeded Successfully"

            )

        )

        # ==========================================
        # Time Slot Seeder
        # ==========================================

        slot_times = [

            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",

            "12:00",
            "12:30",

            "14:00",
            "14:30",

            "15:00",
            "15:30",

            "16:00",
            "16:30",

        ]

        for schedule in DoctorSchedule.objects.all():

            for slot in slot_times:

                TimeSlot.objects.get_or_create(

                    schedule=schedule,

                    slot_time=slot,

                    defaults={

                        "max_patient": 5,

                        "booked_count": 0,

                        "is_active": True,

                    }

                )

        self.stdout.write(

            self.style.SUCCESS(

                "Time Slots Seeded Successfully"
            )
        )
        
        
        # ==========================================
        # Appointment Seeder
        # ==========================================

        patients = list(PatientProfile.objects.all())

        doctors = list(Doctor.objects.all())

        statuses = [
            "Pending",
            "Confirmed",
            "Completed",
        ]

        if patients and doctors:

            for i in range(20):

                patient = choice(patients)

                doctor = choice(doctors)

                slot = TimeSlot.objects.filter(
                    schedule__doctor=doctor,
                    is_active=True,
                ).first()

                if not slot:
                    continue

                Appointment.objects.get_or_create(

                    patient=patient,

                    doctor=doctor,

                    slot=slot,

                    appointment_date=date.today() + timedelta(days=i % 7),

                    defaults={

                        "reason": "General Health Checkup",

                        "symptoms": "Fever and headache",

                        "status": choice(statuses),

                    }

                )

        self.stdout.write(

            self.style.SUCCESS(

                "Appointments Seeded Successfully"

            )

        )
        
        
        
        
        
        
                
                