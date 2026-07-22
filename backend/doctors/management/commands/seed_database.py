from django.core.management.base import BaseCommand

from accounts.models import CustomUser

from doctors.models import (
    Department,
    Doctor,
    DoctorSchedule,
)


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
            }

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