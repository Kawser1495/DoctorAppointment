from datetime import date, timedelta, time
from decimal import Decimal
from random import choice
import uuid

from django.core.management.base import BaseCommand
from django.db import models

from accounts.models import CustomUser
from patients.models import PatientProfile

from doctors.models import (
    Department,
    Doctor,
    DoctorSchedule,
    TimeSlot,
)

from appointments.models import Appointment

from payments.models import Payment

from diagnostics.models import (
    TestCategory,
    DiagnosticTest,
    TestBooking,
)

from reports.models import MedicalReport
from notifications.models import Notification


class Command(BaseCommand):

    help = "Seed realistic hospital management system data"

    def handle(self, *args, **kwargs):

        self.stdout.write(
            self.style.WARNING(
                "\nStarting Hospital Database Seeder...\n"
            )
        )

        # ==================================================
        # 1. DEPARTMENTS
        # ==================================================

        departments_data = [

            ("Cardiology", "Diagnosis and treatment of heart and cardiovascular diseases."),

            ("Neurology", "Diagnosis and treatment of brain, spinal cord and nervous system disorders."),

            ("Orthopedics", "Treatment of bone, joint, muscle and musculoskeletal conditions."),

            ("Medicine", "General internal medicine, chronic disease management and adult healthcare."),

            ("ENT", "Treatment of ear, nose, throat and related head and neck conditions."),

            ("Gynecology", "Women's reproductive health, pregnancy and gynecological care."),

            ("Pediatrics", "Medical care for infants, children and adolescents."),

            ("Dermatology", "Diagnosis and treatment of skin, hair and nail conditions."),

            ("Dental", "Dental, oral and gum healthcare services."),

            ("Ophthalmology", "Diagnosis and treatment of eye and vision disorders."),
        ]

        for name, description in departments_data:

            department, created = Department.objects.get_or_create(
                name=name,
                defaults={
                    "description": description
                }
            )

            if not created:
                department.description = description
                department.save(update_fields=["description"])

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Departments seeded successfully"
            )
        )

        # ==================================================
        # 2. DOCTORS
        # ==================================================

        doctor_data = [

            # ==============================================
            # CARDIOLOGY - 3 Doctors
            # ==============================================

            {
                "username": "dr_rahat_has",
                "first_name": "Md. Rahat",
                "last_name": "Hasan",
                "email": "rahat.hasan@hospital.com",
                "department": "Cardiology",
                "specialization": "Interventional Cardiology and Heart Diseases",
                "qualification": "MBBS, MD (Cardiology), FACC",
                "experience": 14,
                "fee": 1500,
                "biography": "Specializes in coronary artery disease, hypertension, heart failure and cardiac interventions.",
            },

            {
                "username": "dr_nusrat_karim",
                "first_name": "Nusrat",
                "last_name": "Karim",
                "email": "nusrat.karim@hospital.com",
                "department": "Cardiology",
                "specialization": "Cardiology and Hypertension",
                "qualification": "MBBS, D-CARD, MD (Cardiology)",
                "experience": 9,
                "fee": 1200,
                "biography": "Experienced in hypertension, heart disease prevention and cardiovascular medicine.",
            },

            {
                "username": "dr_imran_ahmed",
                "first_name": "Imran",
                "last_name": "Ahmed",
                "email": "imran.ahmed@hospital.com",
                "department": "Cardiology",
                "specialization": "Clinical Cardiology",
                "qualification": "MBBS, FCPS (Medicine), MD (Cardiology)",
                "experience": 11,
                "fee": 1300,
                "biography": "Provides diagnosis and treatment for common and complex cardiovascular diseases.",
            },

            # ==============================================
            # NEUROLOGY - 2 Doctors
            # ==============================================

            {
                "username": "dr_farhana_islam",
                "first_name": "Farhana",
                "last_name": "Islam",
                "email": "farhana.islam@hospital.com",
                "department": "Neurology",
                "specialization": "Neurology and Stroke Medicine",
                "qualification": "MBBS, MD (Neurology)",
                "experience": 12,
                "fee": 1500,
                "biography": "Specializes in stroke, headache, migraine, epilepsy and neurological disorders.",
            },

            {
                "username": "dr_tanvir_hossain",
                "first_name": "Tanvir",
                "last_name": "Hossain",
                "email": "tanvir.hossain@hospital.com",
                "department": "Neurology",
                "specialization": "Brain and Nervous System Disorders",
                "qualification": "MBBS, FCPS (Medicine), MD (Neurology)",
                "experience": 8,
                "fee": 1200,
                "biography": "Provides care for epilepsy, migraine, nerve disorders and movement disorders.",
            },

            # ==============================================
            # ORTHOPEDICS - 2 Doctors
            # ==============================================

            {
                "username": "dr_samiul_rahman",
                "first_name": "Samiul",
                "last_name": "Rahman",
                "email": "samiul.rahman@hospital.com",
                "department": "Orthopedics",
                "specialization": "Orthopedic Surgery and Trauma",
                "qualification": "MBBS, MS (Orthopedics)",
                "experience": 16,
                "fee": 1500,
                "biography": "Specializes in fractures, trauma, bone injuries and orthopedic surgery.",
            },

            {
                "username": "dr_mahmud_ali",
                "first_name": "Mahmud",
                "last_name": "Ali",
                "email": "mahmud.ali@hospital.com",
                "department": "Orthopedics",
                "specialization": "Joint and Sports Injury Specialist",
                "qualification": "MBBS, D-ORTHO, MS (Orthopedics)",
                "experience": 10,
                "fee": 1200,
                "biography": "Treats joint pain, sports injuries, arthritis and musculoskeletal conditions.",
            },

            # ==============================================
            # MEDICINE - 2 Doctors
            # ==============================================

            {
                "username": "dr_abdur_rahim",
                "first_name": "Abdur",
                "last_name": "Rahim",
                "email": "abdur.rahim@hospital.com",
                "department": "Medicine",
                "specialization": "Internal Medicine and Diabetes",
                "qualification": "MBBS, FCPS (Medicine)",
                "experience": 15,
                "fee": 1000,
                "biography": "Experienced in diabetes, hypertension, fever and general internal medicine.",
            },

            {
                "username": "dr_sadia_sultana",
                "first_name": "Sadia",
                "last_name": "Sultana",
                "email": "sadia.sultana@hospital.com",
                "department": "Medicine",
                "specialization": "Internal Medicine",
                "qualification": "MBBS, MD (Internal Medicine)",
                "experience": 9,
                "fee": 900,
                "biography": "Provides comprehensive care for adult medical conditions and chronic diseases.",
            },

            # ==============================================
            # ENT - 2 Doctors
            # ==============================================

            {
                "username": "dr_nabil_chowdhury",
                "first_name": "Nabil",
                "last_name": "Chowdhury",
                "email": "nabil.chowdhury@hospital.com",
                "department": "ENT",
                "specialization": "Ear, Nose and Throat Specialist",
                "qualification": "MBBS, DLO, FCPS (ENT)",
                "experience": 13,
                "fee": 1000,
                "biography": "Treats ear infections, sinus problems, tonsillitis and throat disorders.",
            },

            {
                "username": "dr_mim_akter",
                "first_name": "Mim",
                "last_name": "Akter",
                "email": "mim.akter@hospital.com",
                "department": "ENT",
                "specialization": "ENT and Head-Neck Diseases",
                "qualification": "MBBS, MS (ENT)",
                "experience": 7,
                "fee": 900,
                "biography": "Experienced in common ear, nose, throat and voice-related conditions.",
            },

            # ==============================================
            # GYNECOLOGY - 2 Doctors
            # ==============================================

            {
                "username": "dr_fatema_begum",
                "first_name": "Fatema",
                "last_name": "Begum",
                "email": "fatema.begum@hospital.com",
                "department": "Gynecology",
                "specialization": "Gynecology and Obstetrics",
                "qualification": "MBBS, FCPS (Gynecology & Obstetrics)",
                "experience": 14,
                "fee": 1400,
                "biography": "Provides care for pregnancy, childbirth, menstrual disorders and women's health.",
            },

            {
                "username": "dr_samira_haque",
                "first_name": "Samira",
                "last_name": "Haque",
                "email": "samira.haque@hospital.com",
                "department": "Gynecology",
                "specialization": "Women's Reproductive Health",
                "qualification": "MBBS, MCPS, FCPS (Gynecology)",
                "experience": 8,
                "fee": 1100,
                "biography": "Specializes in reproductive health, pregnancy consultation and gynecological disorders.",
            },

            # ==============================================
            # PEDIATRICS - 2 Doctors
            # ==============================================

            {
                "username": "dr_arif_hasan",
                "first_name": "Arif",
                "last_name": "Hasan",
                "email": "arif.hasan@hospital.com",
                "department": "Pediatrics",
                "specialization": "Child Diseases and Pediatric Care",
                "qualification": "MBBS, DCH, FCPS (Pediatrics)",
                "experience": 13,
                "fee": 1000,
                "biography": "Provides medical care for newborns, infants, children and adolescents.",
            },

            {
                "username": "dr_tasnim_jahan",
                "first_name": "Tasnim",
                "last_name": "Jahan",
                "email": "tasnim.jahan@hospital.com",
                "department": "Pediatrics",
                "specialization": "Pediatric Medicine and Nutrition",
                "qualification": "MBBS, MD (Pediatrics)",
                "experience": 7,
                "fee": 900,
                "biography": "Focuses on childhood diseases, growth, nutrition and preventive healthcare.",
            },

            # ==============================================
            # DERMATOLOGY - 2 Doctors
            # ==============================================

            {
                "username": "dr_sharmin_akter",
                "first_name": "Sharmin",
                "last_name": "Akter",
                "email": "sharmin.akter@hospital.com",
                "department": "Dermatology",
                "specialization": "Dermatology and Skin Diseases",
                "qualification": "MBBS, DDV, FCPS (Dermatology)",
                "experience": 11,
                "fee": 1100,
                "biography": "Treats acne, eczema, allergies, psoriasis and other skin conditions.",
            },

            {
                "username": "dr_rakib_hassan",
                "first_name": "Rakib",
                "last_name": "Hassan",
                "email": "rakib.hassan@hospital.com",
                "department": "Dermatology",
                "specialization": "Dermatology and Cosmetic Skin Care",
                "qualification": "MBBS, DDV",
                "experience": 6,
                "fee": 900,
                "biography": "Provides treatment for skin, hair and nail problems and cosmetic dermatology.",
            },

            # ==============================================
            # DENTAL - 2 Doctors
            # ==============================================

            {
                "username": "dr_shafiq_islam",
                "first_name": "Shafiq",
                "last_name": "Islam",
                "email": "shafiq.islam@hospital.com",
                "department": "Dental",
                "specialization": "Dental Surgery and Oral Health",
                "qualification": "BDS, PGT, FCPS (Oral & Maxillofacial Surgery)",
                "experience": 12,
                "fee": 1000,
                "biography": "Experienced in dental pain, tooth extraction, oral surgery and dental care.",
            },

            {
                "username": "dr_rumana_ahmed",
                "first_name": "Rumana",
                "last_name": "Ahmed",
                "email": "rumana.ahmed@hospital.com",
                "department": "Dental",
                "specialization": "General Dentistry and Root Canal Treatment",
                "qualification": "BDS, PGT",
                "experience": 7,
                "fee": 800,
                "biography": "Provides routine dental care, fillings, scaling and root canal treatment.",
            },

            # ==============================================
            # OPHTHALMOLOGY - 2 Doctors
            # ==============================================

            {
                "username": "dr_kamal_hossain",
                "first_name": "Kamal",
                "last_name": "Hossain",
                "email": "kamal.hossain@hospital.com",
                "department": "Ophthalmology",
                "specialization": "Eye Diseases and Cataract Surgery",
                "qualification": "MBBS, DO, MS (Ophthalmology)",
                "experience": 15,
                "fee": 1300,
                "biography": "Specializes in cataract, glaucoma, eye infections and vision problems.",
            },

            {
                "username": "dr_lamia_noor",
                "first_name": "Lamia",
                "last_name": "Noor",
                "email": "lamia.noor@hospital.com",
                "department": "Ophthalmology",
                "specialization": "Ophthalmology and Retina Care",
                "qualification": "MBBS, DO, FCPS (Ophthalmology)",
                "experience": 9,
                "fee": 1100,
                "biography": "Provides care for retina disorders, diabetes-related eye disease and general ophthalmology.",
            },

        ]

        for data in doctor_data:

            user, created = CustomUser.objects.get_or_create(
                username=data["username"],
                defaults={
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "email": data["email"],
                    "role": "doctor",
                }
            )

            if created:
                user.set_password("Doctor@123")
                user.save()

            department = Department.objects.get(
                name=data["department"]
            )

            doctor, doctor_created = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    "department": department,
                    "specialization": data["specialization"],
                    "qualification": data["qualification"],
                    "experience": data["experience"],
                    "consultation_fee": Decimal(data["fee"]),
                    "biography": data["biography"],
                    "is_available": True,
                }
            )

            if not doctor_created:
                doctor.department = department
                doctor.specialization = data["specialization"]
                doctor.qualification = data["qualification"]
                doctor.experience = data["experience"]
                doctor.consultation_fee = Decimal(data["fee"])
                doctor.biography = data["biography"]
                doctor.is_available = True
                doctor.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {len(doctor_data)} Doctors seeded successfully"
            )
        )

        # ==================================================
        # 3. PATIENTS
        # ==================================================

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

        for data in patient_data:

            user, created = CustomUser.objects.get_or_create(
                username=data["username"],
                defaults={
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "email": data["email"],
                    "phone": data["phone"],
                    "role": "patient",
                }
            )

            if created:
                user.set_password("Patient@123")
                user.save()

            PatientProfile.objects.get_or_create(
                user=user,
                defaults={
                    "phone_number": data["phone"],
                    "gender": data["gender"],
                    "date_of_birth": data["dob"],
                    "blood_group": data["blood_group"],
                    "address": data["address"],
                    "emergency_contact": data["emergency_contact"],
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Patients seeded successfully"
            )
        )

        # ==================================================
        # 4. DOCTOR SCHEDULES
        # ==================================================

        schedule_patterns = {

            "Cardiology": [
                ("Sunday", "09:00", "13:00"),
                ("Tuesday", "09:00", "13:00"),
                ("Thursday", "09:00", "13:00"),
            ],

            "Neurology": [
                ("Saturday", "10:00", "15:00"),
                ("Monday", "10:00", "15:00"),
                ("Wednesday", "10:00", "15:00"),
            ],

            "Orthopedics": [
                ("Sunday", "15:00", "20:00"),
                ("Tuesday", "15:00", "20:00"),
                ("Thursday", "15:00", "20:00"),
            ],

            "Medicine": [
                ("Saturday", "09:00", "17:00"),
                ("Monday", "09:00", "17:00"),
                ("Wednesday", "09:00", "17:00"),
                ("Friday", "09:00", "13:00"),
            ],

            "ENT": [
                ("Sunday", "10:00", "16:00"),
                ("Tuesday", "10:00", "16:00"),
                ("Thursday", "10:00", "16:00"),
            ],

            "Gynecology": [
                ("Saturday", "09:00", "14:00"),
                ("Monday", "09:00", "14:00"),
                ("Wednesday", "09:00", "14:00"),
            ],

            "Pediatrics": [
                ("Saturday", "16:00", "20:00"),
                ("Sunday", "16:00", "20:00"),
                ("Tuesday", "16:00", "20:00"),
                ("Thursday", "16:00", "20:00"),
            ],

            "Dermatology": [
                ("Monday", "15:00", "20:00"),
                ("Wednesday", "15:00", "20:00"),
                ("Friday", "09:00", "13:00"),
            ],

            "Dental": [
                ("Saturday", "10:00", "18:00"),
                ("Monday", "10:00", "18:00"),
                ("Wednesday", "10:00", "18:00"),
            ],

            "Ophthalmology": [
                ("Sunday", "09:00", "15:00"),
                ("Tuesday", "09:00", "15:00"),
                ("Thursday", "09:00", "15:00"),
            ],

        }

        for doctor in Doctor.objects.all():

            department_name = doctor.department.name

            schedules = schedule_patterns.get(
                department_name,
                []
            )

            for day, start_time, end_time in schedules:

                schedule, created = DoctorSchedule.objects.get_or_create(
                    doctor=doctor,
                    day=day,
                    defaults={
                        "start_time": start_time,
                        "end_time": end_time,
                        "is_active": True,
                    }
                )

                if not created:
                    schedule.start_time = start_time
                    schedule.end_time = end_time
                    schedule.is_active = True
                    schedule.save()

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Doctor schedules seeded successfully"
            )
        )

        # ==================================================
        # 5. TIME SLOTS
        # ==================================================

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
            "17:00",
            "17:30",
            "18:00",
            "18:30",
            "19:00",
            "19:30",
        ]

        for schedule in DoctorSchedule.objects.all():

            for slot in slot_times:

                slot_time_obj = time.fromisoformat(slot)

                if (
                    schedule.start_time
                    <= slot_time_obj
                    < schedule.end_time
                ):

                    TimeSlot.objects.get_or_create(
                        schedule=schedule,
                        slot_time=slot_time_obj,
                        defaults={
                            "max_patient": 5,
                            "booked_count": 0,
                            "is_active": True,
                        }
                    )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Professional time slots seeded successfully"
            )
        )

        # ==================================================
        # 6. APPOINTMENTS
        # ==================================================

        patients = list(
            PatientProfile.objects.all()
        )

        doctors = list(
            Doctor.objects.filter(
                is_available=True
            )
        )

        appointment_statuses = [
            "Pending",
            "Confirmed",
            "Completed",
        ]

        appointment_reasons = [
            "General Health Checkup",
            "Follow-up Consultation",
            "Chest Pain",
            "Headache and Dizziness",
            "Fever and Weakness",
            "Blood Pressure Check",
            "Diabetes Follow-up",
            "Joint Pain",
            "Skin Problem",
            "Routine Consultation",
        ]

        appointment_symptoms = [
            "Mild symptoms for the last few days",
            "Fever and body pain",
            "Headache and weakness",
            "Pain and discomfort",
            "Difficulty sleeping",
            "Regular follow-up visit",
            "Routine health concern",
        ]

        day_mapping = {
            0: "Monday",
            1: "Tuesday",
            2: "Wednesday",
            3: "Thursday",
            4: "Friday",
            5: "Saturday",
            6: "Sunday",
        }

        if patients and doctors:

            created_count = 0

            for offset in range(1, 15):

                if created_count >= 20:
                    break

                appointment_date = (
                    date.today()
                    + timedelta(days=offset)
                )

                day_name = day_mapping[
                    appointment_date.weekday()
                ]

                available_doctors = [
                    doctor
                    for doctor in doctors
                    if doctor.schedules.filter(
                        day=day_name,
                        is_active=True
                    ).exists()
                ]

                if not available_doctors:
                    continue

                for _ in range(3):

                    if created_count >= 20:
                        break

                    patient = choice(patients)
                    doctor = choice(available_doctors)

                    available_slots = TimeSlot.objects.filter(
                        schedule__doctor=doctor,
                        schedule__day=day_name,
                        schedule__is_active=True,
                        is_active=True,
                    ).exclude(
                        booked_count__gte=models.F("max_patient")
                    )

                    slot = available_slots.order_by("?").first()

                    if not slot:
                        continue

                    already_exists = Appointment.objects.filter(
                        patient=patient,
                        doctor=doctor,
                        appointment_date=appointment_date,
                    ).exists()

                    if already_exists:
                        continue

                    Appointment.objects.create(
                        patient=patient,
                        doctor=doctor,
                        slot=slot,
                        appointment_date=appointment_date,
                        reason=choice(appointment_reasons),
                        symptoms=choice(appointment_symptoms),
                        status=choice(appointment_statuses),
                    )

                    slot.booked_count += 1
                    slot.save(
                        update_fields=["booked_count"]
                    )

                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Sample appointments seeded successfully"
            )
        )

        # ==================================================
        # 7. PAYMENTS
        # ==================================================

        payment_methods = [
            "Bkash",
            "Nagad",
            "Card",
            "Cash",
        ]

        for appointment in Appointment.objects.all():

            if appointment.status == "Pending":
                payment_status = "Pending"

            elif appointment.status in [
                "Confirmed",
                "Completed",
            ]:
                payment_status = "Paid"

            elif appointment.status in [
                "Cancelled",
                "Rejected",
            ]:
                payment_status = "Failed"

            else:
                payment_status = "Pending"

            Payment.objects.get_or_create(
                appointment=appointment,
                defaults={
                    "patient": appointment.patient,
                    "amount": Decimal(
                        appointment.doctor.consultation_fee
                    ),
                    "payment_method": choice(
                        payment_methods
                    ),
                    "transaction_id": (
                        f"TXN-"
                        f"{uuid.uuid4().hex[:10].upper()}"
                    ),
                    "payment_status": payment_status,
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Payments seeded successfully"
            )
        )

        # ==================================================
        # 8. DIAGNOSTIC CATEGORIES
        # ==================================================

        categories = [

            (
                "Blood Test",
                "Blood related laboratory tests",
            ),

            (
                "Urine Test",
                "Urine analysis and infection tests",
            ),

            (
                "Imaging",
                "Radiology and medical imaging services",
            ),

            (
                "Heart Checkup",
                "Cardiology diagnostic services",
            ),

            (
                "Diabetes",
                "Blood glucose and diabetes monitoring tests",
            ),

            (
                "Hormone",
                "Hormone and endocrine related tests",
            ),

            (
                "Liver Function",
                "Liver health and function tests",
            ),

            (
                "Kidney Function",
                "Kidney health and function tests",
            ),
        ]

        for name, description in categories:

            TestCategory.objects.get_or_create(
                name=name,
                defaults={
                    "description": description
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Diagnostic categories seeded successfully"
            )
        )

        # ==================================================
        # 9. DIAGNOSTIC TESTS
        # ==================================================

        test_data = [

            {
                "category": "Blood Test",
                "name": "Complete Blood Count (CBC)",
                "description": "Measures different components of blood including red and white blood cells.",
                "price": 600,
                "duration": "6 Hours",
            },

            {
                "category": "Blood Test",
                "name": "Blood Group and Rh Factor",
                "description": "Determines blood group and Rh factor.",
                "price": 300,
                "duration": "2 Hours",
            },

            {
                "category": "Blood Test",
                "name": "Hemoglobin",
                "description": "Measures hemoglobin level in the blood.",
                "price": 250,
                "duration": "2 Hours",
            },

            {
                "category": "Urine Test",
                "name": "Urine R/E",
                "description": "Routine examination of urine.",
                "price": 350,
                "duration": "4 Hours",
            },

            {
                "category": "Urine Test",
                "name": "Urine Culture",
                "description": "Detects bacterial infection in urine.",
                "price": 800,
                "duration": "24 Hours",
            },

            {
                "category": "Imaging",
                "name": "X-Ray Chest",
                "description": "Chest radiographic examination.",
                "price": 1000,
                "duration": "30 Minutes",
            },

            {
                "category": "Imaging",
                "name": "MRI Brain",
                "description": "Detailed magnetic resonance imaging of the brain.",
                "price": 6500,
                "duration": "2 Hours",
            },

            {
                "category": "Imaging",
                "name": "CT Scan",
                "description": "Computed tomography scan.",
                "price": 5000,
                "duration": "2 Hours",
            },

            {
                "category": "Heart Checkup",
                "name": "ECG",
                "description": "Records electrical activity of the heart.",
                "price": 700,
                "duration": "20 Minutes",
            },

            {
                "category": "Heart Checkup",
                "name": "Echocardiogram",
                "description": "Ultrasound examination of the heart.",
                "price": 2500,
                "duration": "45 Minutes",
            },

            {
                "category": "Diabetes",
                "name": "Random Blood Sugar",
                "description": "Measures current blood glucose level.",
                "price": 300,
                "duration": "1 Hour",
            },

            {
                "category": "Diabetes",
                "name": "HbA1c",
                "description": "Measures average blood sugar over approximately three months.",
                "price": 900,
                "duration": "6 Hours",
            },

            {
                "category": "Hormone",
                "name": "TSH",
                "description": "Measures thyroid stimulating hormone level.",
                "price": 900,
                "duration": "6 Hours",
            },

            {
                "category": "Liver Function",
                "name": "Liver Function Test (LFT)",
                "description": "Evaluates liver health and function.",
                "price": 1200,
                "duration": "6 Hours",
            },

            {
                "category": "Kidney Function",
                "name": "Kidney Function Test (KFT)",
                "description": "Evaluates kidney health and function.",
                "price": 1100,
                "duration": "6 Hours",
            },

        ]

        for data in test_data:

            category = TestCategory.objects.get(
                name=data["category"]
            )

            DiagnosticTest.objects.get_or_create(
                name=data["name"],
                defaults={
                    "category": category,
                    "description": data["description"],
                    "price": data["price"],
                    "duration": data["duration"],
                    "is_available": True,
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Diagnostic tests seeded successfully"
            )
        )

        # ==================================================
        # 10. TEST BOOKINGS
        # ==================================================

        tests = list(
            DiagnosticTest.objects.filter(
                is_available=True
            )
        )

        booking_statuses = [
            "Pending",
            "Confirmed",
            "Completed",
        ]

        booking_times = [
            time(9, 0),
            time(9, 30),
            time(10, 0),
            time(10, 30),
            time(11, 0),
            time(11, 30),
            time(12, 0),
            time(14, 0),
            time(15, 0),
            time(16, 0),
        ]

        if patients and tests:

            for i in range(15):

                patient = choice(patients)
                test = choice(tests)

                booking_date = (
                    date.today()
                    + timedelta(days=i + 1)
                )

                booking_number = (
                    f"TEST-"
                    f"{date.today().strftime('%Y%m%d')}-"
                    f"{uuid.uuid4().hex[:6].upper()}"
                )

                TestBooking.objects.get_or_create(
                    booking_number=booking_number,
                    defaults={
                        "patient": patient,
                        "diagnostic_test": test,
                        "booking_date": booking_date,
                        "booking_time": choice(
                            booking_times
                        ),
                        "status": choice(
                            booking_statuses
                        ),
                    }
                )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Test bookings seeded successfully"
            )
        )

        # ==================================================
        # 11. MEDICAL REPORTS
        # ==================================================

        report_titles = [
            "General Health Assessment",
            "Follow-up Consultation Report",
            "Medical Examination Report",
            "Consultation Summary",
            "Treatment Progress Report",
        ]

        prescriptions = [
            "Take prescribed medication as directed and maintain adequate rest.",
            "Continue current treatment and follow up after two weeks.",
            "Maintain a balanced diet and drink plenty of water.",
            "Monitor symptoms and return for follow-up if the condition worsens.",
            "Continue medication according to the doctor's instructions.",
        ]

        remarks = [
            "Patient condition is stable.",
            "Follow-up consultation recommended.",
            "Further laboratory investigation may be required.",
            "Patient advised to maintain regular medication.",
            "Condition is improving gradually.",
        ]

        completed_appointments = Appointment.objects.filter(
            status="Completed"
        )

        for appointment in completed_appointments:

            MedicalReport.objects.get_or_create(
                appointment=appointment,
                defaults={
                    "patient": appointment.patient,
                    "doctor": appointment.doctor,
                    "report_title": choice(
                        report_titles
                    ),
                    "prescription": choice(
                        prescriptions
                    ),
                    "remarks": choice(
                        remarks
                    ),
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Medical reports seeded successfully"
            )
        )

        # ==================================================
        # 12. NOTIFICATIONS
        # ==================================================

        for appointment in Appointment.objects.all():

            Notification.objects.get_or_create(
                user=appointment.patient.user,
                title=f"Appointment {appointment.status}",
                message=(
                    f"Your appointment with "
                    f"Dr. {appointment.doctor.user.get_full_name()} "
                    f"on {appointment.appointment_date} "
                    f"at {appointment.slot.slot_time.strftime('%I:%M %p')} "
                    f"is {appointment.status.lower()}."
                ),
                defaults={
                    "is_read": False
                }
            )

        for payment in Payment.objects.all():

            Notification.objects.get_or_create(
                user=payment.patient.user,
                title="Payment Update",
                message=(
                    f"Your payment of ৳{payment.amount} "
                    f"for appointment {payment.appointment.booking_number} "
                    f"is {payment.payment_status.lower()}."
                ),
                defaults={
                    "is_read": False
                }
            )

        for booking in TestBooking.objects.all():

            Notification.objects.get_or_create(
                user=booking.patient.user,
                title="Diagnostic Test Booking",
                message=(
                    f"Your booking for "
                    f"{booking.diagnostic_test.name} "
                    f"on {booking.booking_date} "
                    f"is {booking.status.lower()}."
                ),
                defaults={
                    "is_read": False
                }
            )

        for report in MedicalReport.objects.all():

            Notification.objects.get_or_create(
                user=report.patient.user,
                title="Medical Report Available",
                message=(
                    f"Your medical report "
                    f"'{report.report_title}' "
                    f"is now available."
                ),
                defaults={
                    "is_read": False
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Notifications seeded successfully"
            )
        )

        # ==================================================
        # COMPLETE
        # ==================================================

        self.stdout.write(
            self.style.SUCCESS(
                "\n=========================================="
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                " HOSPITAL DATABASE SEEDED SUCCESSFULLY!"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "==========================================\n"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Departments: {Department.objects.count()}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Doctors: {Doctor.objects.count()}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Patients: {PatientProfile.objects.count()}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Schedules: {DoctorSchedule.objects.count()}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Time Slots: {TimeSlot.objects.count()}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Appointments: {Appointment.objects.count()}"
            )
        )