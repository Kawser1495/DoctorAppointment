from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import CustomUser
from doctors.models import (
    Department,
    Doctor,
    DoctorSchedule,
    TimeSlot,
)


class Command(BaseCommand):

    help = "Create hospital departments, doctors, schedules and time slots"

    def handle(self, *args, **options):

        departments_data = [
            {
                "name": "Cardiology",
                "description": "Heart Specialist",
            },
            {
                "name": "Neurology",
                "description": "Brain and Nerve Specialist",
            },
            {
                "name": "Orthopedics",
                "description": "Bone and Joint Specialist",
            },
            {
                "name": "Medicine",
                "description": "General and Internal Medicine",
            },
            {
                "name": "ENT",
                "description": "Ear, Nose and Throat Specialist",
            },
            {
                "name": "Gynecology",
                "description": "Women Health Specialist",
            },
            {
                "name": "Pediatrics",
                "description": "Child Specialist",
            },
            {
                "name": "Dermatology",
                "description": "Skin and Hair Specialist",
            },
            {
                "name": "Dental",
                "description": "Dental Care",
            },
            {
                "name": "Ophthalmology",
                "description": "Eye Specialist",
            },
        ]

        doctors_data = [

            {
                "username": "rahat_hasan",
                "first_name": "Md. Rahat",
                "last_name": "Hasan",
                "department": "Cardiology",
                "specialization": "Interventional Cardiology and Heart Diseases",
                "qualification": "MBBS, MD (Cardiology)",
                "experience": 14,
                "fee": 1200,
                "days": ["Sunday", "Tuesday", "Thursday"],
                "start": "09:00",
                "end": "12:00",
            },

            {
                "username": "nusrat_karim",
                "first_name": "Nusrat",
                "last_name": "Karim",
                "department": "Cardiology",
                "specialization": "Cardiology and Hypertension",
                "qualification": "MBBS, D-CARD",
                "experience": 9,
                "fee": 1000,
                "days": ["Monday", "Wednesday", "Saturday"],
                "start": "15:00",
                "end": "17:30",
            },

            {
                "username": "farhana_islam",
                "first_name": "Farhana",
                "last_name": "Islam",
                "department": "Neurology",
                "specialization": "Neurology and Stroke",
                "qualification": "MBBS, MD (Neurology)",
                "experience": 12,
                "fee": 1500,
                "days": ["Sunday", "Tuesday", "Thursday"],
                "start": "09:00",
                "end": "12:00",
            },

            {
                "username": "tanvir_ahmed",
                "first_name": "Tanvir",
                "last_name": "Ahmed",
                "department": "Neurology",
                "specialization": "Brain, Nerve and Migraine Specialist",
                "qualification": "MBBS, FCPS, MD (Neurology)",
                "experience": 10,
                "fee": 1300,
                "days": ["Monday", "Wednesday", "Saturday"],
                "start": "16:00",
                "end": "19:00",
            },

            {
                "username": "mahmud_rahman",
                "first_name": "Mahmud",
                "last_name": "Rahman",
                "department": "Orthopedics",
                "specialization": "Orthopedic and Trauma Surgery",
                "qualification": "MBBS, MS (Orthopedics)",
                "experience": 15,
                "fee": 1200,
                "days": ["Sunday", "Tuesday", "Thursday"],
                "start": "10:00",
                "end": "13:00",
            },

            {
                "username": "sohan_kabir",
                "first_name": "Sohan",
                "last_name": "Kabir",
                "department": "Orthopedics",
                "specialization": "Bone, Joint and Sports Injury",
                "qualification": "MBBS, D-ORTHO",
                "experience": 8,
                "fee": 900,
                "days": ["Monday", "Wednesday", "Friday"],
                "start": "17:00",
                "end": "20:00",
            },

            {
                "username": "sadia_rahman",
                "first_name": "Sadia",
                "last_name": "Rahman",
                "department": "Medicine",
                "specialization": "Internal Medicine",
                "qualification": "MBBS, FCPS (Medicine)",
                "experience": 13,
                "fee": 1000,
                "days": ["Sunday", "Monday", "Tuesday"],
                "start": "09:00",
                "end": "13:00",
            },

            {
                "username": "arif_hossain",
                "first_name": "Arif",
                "last_name": "Hossain",
                "department": "Medicine",
                "specialization": "Diabetes and Internal Medicine",
                "qualification": "MBBS, MD (Medicine)",
                "experience": 11,
                "fee": 1100,
                "days": ["Wednesday", "Thursday", "Saturday"],
                "start": "10:00",
                "end": "14:00",
            },

            {
                "username": "mehedi_hasan",
                "first_name": "Mehedi",
                "last_name": "Hasan",
                "department": "Medicine",
                "specialization": "General Medicine and Chronic Diseases",
                "qualification": "MBBS, FCPS (Medicine)",
                "experience": 7,
                "fee": 800,
                "days": ["Sunday", "Tuesday", "Thursday"],
                "start": "16:00",
                "end": "20:00",
            },

            {
                "username": "kamal_hossain",
                "first_name": "Kamal",
                "last_name": "Hossain",
                "department": "ENT",
                "specialization": "Ear, Nose and Throat",
                "qualification": "MBBS, DLO, FCPS (ENT)",
                "experience": 14,
                "fee": 1000,
                "days": ["Sunday", "Tuesday", "Thursday"],
                "start": "10:00",
                "end": "13:00",
            },

            {
                "username": "rima_sultana",
                "first_name": "Rima",
                "last_name": "Sultana",
                "department": "ENT",
                "specialization": "ENT and Head Neck Diseases",
                "qualification": "MBBS, MCPS, FCPS (ENT)",
                "experience": 9,
                "fee": 900,
                "days": ["Monday", "Wednesday", "Saturday"],
                "start": "15:00",
                "end": "18:00",
            },

            {
                "username": "samira_rahman",
                "first_name": "Samira",
                "last_name": "Rahman",
                "department": "Gynecology",
                "specialization": "Gynecology and Obstetrics",
                "qualification": "MBBS, FCPS (Gynae and Obs)",
                "experience": 16,
                "fee": 1400,
                "days": ["Sunday", "Tuesday", "Thursday"],
                "start": "09:00",
                "end": "13:00",
            },

            {
                "username": "tania_akter",
                "first_name": "Tania",
                "last_name": "Akter",
                "department": "Gynecology",
                "specialization": "Women's Health and Infertility",
                "qualification": "MBBS, DGO, FCPS",
                "experience": 10,
                "fee": 1200,
                "days": ["Monday", "Wednesday", "Saturday"],
                "start": "16:00",
                "end": "19:00",
            },

            {
                "username": "imran_chowdhury",
                "first_name": "Imran",
                "last_name": "Chowdhury",
                "department": "Pediatrics",
                "specialization": "Child Diseases and Newborn Care",
                "qualification": "MBBS, DCH, FCPS (Pediatrics)",
                "experience": 12,
                "fee": 1000,
                "days": ["Sunday", "Tuesday", "Thursday"],
                "start": "10:00",
                "end": "13:00",
            },

            {
                "username": "jannat_ara",
                "first_name": "Jannat",
                "last_name": "Ara",
                "department": "Pediatrics",
                "specialization": "Pediatrics and Child Nutrition",
                "qualification": "MBBS, MD (Pediatrics)",
                "experience": 8,
                "fee": 900,
                "days": ["Monday", "Wednesday", "Saturday"],
                "start": "15:00",
                "end": "18:00",
            },

            {
                "username": "tania_sultana",
                "first_name": "Tania",
                "last_name": "Sultana",
                "department": "Dermatology",
                "specialization": "Skin, Allergy and Dermatology",
                "qualification": "MBBS, DDV",
                "experience": 11,
                "fee": 1100,
                "days": ["Sunday", "Tuesday", "Thursday"],
                "start": "11:00",
                "end": "14:00",
            },

            {
                "username": "nabila_noor",
                "first_name": "Nabila",
                "last_name": "Noor",
                "department": "Dermatology",
                "specialization": "Skin, Hair and Aesthetic Dermatology",
                "qualification": "MBBS, MD (Dermatology)",
                "experience": 7,
                "fee": 1000,
                "days": ["Monday", "Wednesday", "Saturday"],
                "start": "16:00",
                "end": "19:00",
            },

            {
                "username": "imran_kabir",
                "first_name": "Imran",
                "last_name": "Kabir",
                "department": "Dental",
                "specialization": "Dental and Oral Surgery",
                "qualification": "BDS, MS (Oral Surgery)",
                "experience": 12,
                "fee": 800,
                "days": ["Sunday", "Tuesday", "Thursday"],
                "start": "10:00",
                "end": "14:00",
            },

            {
                "username": "fahim_ahmed",
                "first_name": "Fahim",
                "last_name": "Ahmed",
                "department": "Dental",
                "specialization": "Dental Surgery and Root Canal Treatment",
                "qualification": "BDS, PGT",
                "experience": 6,
                "fee": 700,
                "days": ["Monday", "Wednesday", "Saturday"],
                "start": "16:00",
                "end": "20:00",
            },

            {
                "username": "shafiq_ahmed",
                "first_name": "Shafiq",
                "last_name": "Ahmed",
                "department": "Ophthalmology",
                "specialization": "Eye and Vision Specialist",
                "qualification": "MBBS, DO, MS (Ophthalmology)",
                "experience": 15,
                "fee": 1200,
                "days": ["Sunday", "Tuesday", "Thursday"],
                "start": "09:00",
                "end": "12:00",
            },

            {
                "username": "rashedul_karim",
                "first_name": "Rashedul",
                "last_name": "Karim",
                "department": "Ophthalmology",
                "specialization": "Cataract and Retina Specialist",
                "qualification": "MBBS, MS (Ophthalmology)",
                "experience": 10,
                "fee": 1300,
                "days": ["Monday", "Wednesday", "Saturday"],
                "start": "15:00",
                "end": "18:00",
            },
        ]

        try:

            with transaction.atomic():

                # ==========================================
                # Create Departments
                # ==========================================

                department_map = {}

                for item in departments_data:

                    department, created = Department.objects.get_or_create(
                        name=item["name"],
                        defaults={
                            "description": item["description"],
                        },
                    )

                    department_map[item["name"]] = department

                    if created:

                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Created Department: {department.name}"
                            )
                        )

                    else:

                        self.stdout.write(
                            f"Department already exists: {department.name}"
                        )

                # ==========================================
                # Create Doctors, Schedules and Slots
                # ==========================================

                for item in doctors_data:

                    # Create User
                    user, user_created = CustomUser.objects.get_or_create(
                        username=item["username"],
                        defaults={
                            "first_name": item["first_name"],
                            "last_name": item["last_name"],
                            "email": f"{item['username']}@hospital.com",
                        },
                    )

                    if user_created:
                        user.set_password("Doctor@123")
                        user.save()

                    # Create Doctor Profile
                    doctor, doctor_created = Doctor.objects.get_or_create(
                        user=user,
                        defaults={
                            "department": department_map[
                                item["department"]
                            ],
                            "specialization": item["specialization"],
                            "qualification": item["qualification"],
                            "experience": item["experience"],
                            "consultation_fee": item["fee"],
                            "biography": (
                                f"{item['specialization']} with "
                                f"{item['experience']} years of experience."
                            ),
                            "is_available": True,
                        },
                    )

                    # Update department and doctor data
                    if not doctor_created:

                        doctor.department = department_map[
                            item["department"]
                        ]

                        doctor.specialization = item["specialization"]
                        doctor.qualification = item["qualification"]
                        doctor.experience = item["experience"]
                        doctor.consultation_fee = item["fee"]
                        doctor.is_available = True

                        doctor.save()

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Doctor ready: Dr. "
                            f"{item['first_name']} "
                            f"{item['last_name']}"
                        )
                    )

                    # ======================================
                    # Create Doctor Schedules
                    # ======================================

                    for day in item["days"]:

                        start_time = datetime.strptime(
                            item["start"],
                            "%H:%M"
                        ).time()

                        end_time = datetime.strptime(
                            item["end"],
                            "%H:%M"
                        ).time()

                        schedule, schedule_created = (
                            DoctorSchedule.objects.get_or_create(
                                doctor=doctor,
                                day=day,
                                defaults={
                                    "start_time": start_time,
                                    "end_time": end_time,
                                    "is_active": True,
                                },
                            )
                        )

                        # Update existing schedule
                        if not schedule_created:

                            schedule.start_time = start_time
                            schedule.end_time = end_time
                            schedule.is_active = True
                            schedule.save()

                        # ==================================
                        # Create 30-minute Time Slots
                        # ==================================

                        current_time = datetime.strptime(
                            item["start"],
                            "%H:%M"
                        )

                        finish_time = datetime.strptime(
                            item["end"],
                            "%H:%M"
                        )

                        while current_time <= finish_time:

                            slot_time = current_time.time()

                            TimeSlot.objects.get_or_create(
                                schedule=schedule,
                                slot_time=slot_time,
                                defaults={
                                    "max_patient": 5,
                                    "booked_count": 0,
                                    "is_active": True,
                                },
                            )

                            current_time += timedelta(minutes=30)

                self.stdout.write(
                    self.style.SUCCESS(
                        "\n===================================="
                    )
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        "Hospital data created successfully!"
                    )
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        "10 Departments"
                    )
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        "21 Doctors"
                    )
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        "Doctor Schedules created"
                    )
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        "Time Slots created"
                    )
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        "===================================="
                    )
                )

        except Exception as error:

            self.stdout.write(
                self.style.ERROR(
                    f"Error: {str(error)}"
                )
            )

            raise error