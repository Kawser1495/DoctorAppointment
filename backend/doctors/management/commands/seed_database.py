from datetime import date, datetime, timedelta, time
from decimal import Decimal
from random import choice
import uuid

from django.core.management.base import BaseCommand
from django.db import models, transaction

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

    DEFAULT_DOCTOR_PASSWORD = "Doctor@123"
    DEFAULT_PATIENT_PASSWORD = "Patient@123"

    SLOT_DURATION_MINUTES = 30
    MAX_PATIENT_PER_SLOT = 5

    # ==================================================
    # MAIN COMMAND
    # ==================================================

    @transaction.atomic
    def handle(self, *args, **kwargs):

        self.stdout.write(
            self.style.WARNING(
                "\nStarting Hospital Database Seeder...\n"
            )
        )

        self.seed_departments()
        self.seed_doctors()
        self.seed_patients()
        self.seed_doctor_schedules()
        self.seed_time_slots()

        # Important:
        # First synchronize old slot counts
        self.sync_slot_booked_counts()

        self.seed_appointments()

        # Sync again after creating appointments
        self.sync_slot_booked_counts()

        self.seed_payments()
        self.seed_diagnostic_categories()
        self.seed_diagnostic_tests()
        self.seed_test_bookings()
        self.seed_medical_reports()
        self.seed_notifications()

        self.print_summary()

    # ==================================================
    # 1. DEPARTMENTS
    # ==================================================

    def seed_departments(self):

        departments_data = [

            (
                "Cardiology",
                "Diagnosis and treatment of heart and cardiovascular diseases."
            ),

            (
                "Neurology",
                "Diagnosis and treatment of brain, spinal cord and nervous system disorders."
            ),

            (
                "Orthopedics",
                "Treatment of bone, joint, muscle and musculoskeletal conditions."
            ),

            (
                "Medicine",
                "General internal medicine, chronic disease management and adult healthcare."
            ),

            (
                "ENT",
                "Treatment of ear, nose, throat and related head and neck conditions."
            ),

            (
                "Gynecology",
                "Women's reproductive health, pregnancy and gynecological care."
            ),

            (
                "Pediatrics",
                "Medical care for infants, children and adolescents."
            ),

            (
                "Dermatology",
                "Diagnosis and treatment of skin, hair and nail conditions."
            ),

            (
                "Dental",
                "Dental, oral and gum healthcare services."
            ),

            (
                "Ophthalmology",
                "Diagnosis and treatment of eye and vision disorders."
            ),
        ]

        for name, description in departments_data:

            Department.objects.update_or_create(
                name=name,
                defaults={
                    "description": description
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Departments seeded successfully"
            )
        )

    # ==================================================
    # 2. DOCTORS
    # ==================================================

    def seed_doctors(self):

        doctor_data = [

            # ==========================================
            # 1. DR ABDUL KARIM
            # ==========================================

            {
                "username": "dr_abdul_karim",
                "first_name": "Abdul",
                "last_name": "Karim",
                "email": "abdul.karim@hospital.com",
                "department": "Neurology",
                "specialization": "Neurologist",
                "qualification": "MBBS, FCPS",
                "experience": 8,
                "fee": 1200,
                "biography": (
                    "Experienced neurologist specializing in brain, "
                    "nerve and neurological disorders."
                ),
            },

            # ==========================================
            # 2. DR ABDUR RAHIM
            # ==========================================

            {
                "username": "dr_abdur_rahim",
                "first_name": "Abdur",
                "last_name": "Rahim",
                "email": "abdur.rahim@hospital.com",
                "department": "Medicine",
                "specialization": "Medicine Specialist",
                "qualification": "MBBS, MD",
                "experience": 10,
                "fee": 800,
                "biography": (
                    "Provides treatment for general medical conditions "
                    "and adult healthcare."
                ),
            },

            # ==========================================
            # 3. DR ARIF HOSSAIN
            # ==========================================

            {
                "username": "dr_arif_hossain",
                "first_name": "Arif",
                "last_name": "Hossain",
                "email": "arif.hossain@hospital.com",
                "department": "Medicine",
                "specialization": "Diabetes and Internal Medicine",
                "qualification": "MBBS, MD (Medicine)",
                "experience": 11,
                "fee": 1100,
                "biography": (
                    "Specializes in diabetes management, internal medicine "
                    "and chronic disease care."
                ),
            },

            # ==========================================
            # 4. DR FAHIM AHMED
            # ==========================================

            {
                "username": "dr_fahim_ahmed",
                "first_name": "Fahim",
                "last_name": "Ahmed",
                "email": "fahim.ahmed@hospital.com",
                "department": "Dental",
                "specialization": (
                    "Dental Surgery and Root Canal Treatment"
                ),
                "qualification": "BDS, PGT",
                "experience": 6,
                "fee": 700,
                "biography": (
                    "Provides dental surgery, root canal treatment, "
                    "tooth care and oral health services."
                ),
            },

            # ==========================================
            # 5. DR FARHANA ISLAM
            # ==========================================

            {
                "username": "dr_farhana_islam",
                "first_name": "Farhana",
                "last_name": "Islam",
                "email": "farhana.islam@hospital.com",
                "department": "Neurology",
                "specialization": "Neurology and Stroke",
                "qualification": "MBBS, MD (Neurology)",
                "experience": 12,
                "fee": 1500,
                "biography": (
                    "Specializes in stroke, migraine, epilepsy and "
                    "neurological disorders."
                ),
            },

            # ==========================================
            # 6. DR FATEMA BEGUM
            # ==========================================

            {
                "username": "dr_fatema_begum",
                "first_name": "Fatema",
                "last_name": "Begum",
                "email": "fatema.begum@hospital.com",
                "department": "Gynecology",
                "specialization": "Gynecologist",
                "qualification": "MBBS, FCPS",
                "experience": 11,
                "fee": 1200,
                "biography": (
                    "Provides treatment for women's health, pregnancy "
                    "and gynecological conditions."
                ),
            },

            # ==========================================
            # 7. DR IMRAN CHOWDHURY
            # ==========================================

            {
                "username": "dr_imran_chowdhury",
                "first_name": "Imran",
                "last_name": "Chowdhury",
                "email": "imran.chowdhury@hospital.com",
                "department": "Pediatrics",
                "specialization": (
                    "Child Diseases and Newborn Care"
                ),
                "qualification": "MBBS, DCH, FCPS (Pediatrics)",
                "experience": 12,
                "fee": 1000,
                "biography": (
                    "Provides healthcare for newborns, infants, children "
                    "and pediatric diseases."
                ),
            },

            # ==========================================
            # 8. DR IMRAN KABIR
            # ==========================================

            {
                "username": "dr_imran_kabir",
                "first_name": "Imran",
                "last_name": "Kabir",
                "email": "imran.kabir@hospital.com",
                "department": "Dental",
                "specialization": "Dental and Oral Surgery",
                "qualification": "BDS, MS (Oral Surgery)",
                "experience": 12,
                "fee": 800,
                "biography": (
                    "Specializes in dental treatment, oral surgery and "
                    "oral healthcare."
                ),
            },

            # ==========================================
            # 9. DR JANNAT ARA
            # ==========================================

            {
                "username": "dr_jannat_ara",
                "first_name": "Jannat",
                "last_name": "Ara",
                "email": "jannat.ara@hospital.com",
                "department": "Pediatrics",
                "specialization": (
                    "Pediatrics and Child Nutrition"
                ),
                "qualification": "MBBS, MD (Pediatrics)",
                "experience": 8,
                "fee": 900,
                "biography": (
                    "Focuses on child diseases, nutrition, growth and "
                    "preventive pediatric healthcare."
                ),
            },

            # ==========================================
            # 10. DR JOHN SMITH
            # ==========================================

            {
                "username": "dr_john_smith",
                "first_name": "John",
                "last_name": "Smith",
                "email": "john.smith@hospital.com",
                "department": "Cardiology",
                "specialization": "Cardiologist",
                "qualification": "MBBS, FCPS",
                "experience": 12,
                "fee": 1000,
                "biography": (
                    "Experienced cardiologist specializing in heart "
                    "diseases and cardiovascular care."
                ),
            },
        ]

        for data in doctor_data:

            user, created = CustomUser.objects.get_or_create(
                username=data["username"]
            )

            user.first_name = data["first_name"]
            user.last_name = data["last_name"]
            user.email = data["email"]
            user.role = "doctor"

            if created:
                user.set_password(
                    self.DEFAULT_DOCTOR_PASSWORD
                )

            user.save()

            department = Department.objects.get(
                name=data["department"]
            )

            Doctor.objects.update_or_create(
                user=user,
                defaults={
                    "department": department,
                    "specialization": data["specialization"],
                    "qualification": data["qualification"],
                    "experience": data["experience"],
                    "consultation_fee": Decimal(
                        str(data["fee"])
                    ),
                    "biography": data["biography"],
                    "is_available": True,
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {len(doctor_data)} Doctors seeded successfully"
            )
        )

    # ==================================================
    # 3. PATIENTS
    # ==================================================

    def seed_patients(self):

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
                username=data["username"]
            )

            user.first_name = data["first_name"]
            user.last_name = data["last_name"]
            user.email = data["email"]
            user.phone = data["phone"]
            user.role = "patient"

            if created:
                user.set_password(
                    self.DEFAULT_PATIENT_PASSWORD
                )

            user.save()

            PatientProfile.objects.update_or_create(
                user=user,
                defaults={
                    "phone_number": data["phone"],
                    "gender": data["gender"],
                    "date_of_birth": data["dob"],
                    "blood_group": data["blood_group"],
                    "address": data["address"],
                    "emergency_contact": (
                        data["emergency_contact"]
                    ),
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

    def seed_doctor_schedules(self):

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

        doctors = Doctor.objects.select_related(
            "department"
        ).all()

        for doctor in doctors:

            schedules = schedule_patterns.get(
                doctor.department.name,
                []
            )

            for day, start_time, end_time in schedules:

                DoctorSchedule.objects.update_or_create(
                    doctor=doctor,
                    day=day,
                    defaults={
                        "start_time": time.fromisoformat(
                            start_time
                        ),
                        "end_time": time.fromisoformat(
                            end_time
                        ),
                        "is_active": True,
                    }
                )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Doctor schedules seeded successfully"
            )
        )

    # ==================================================
    # 5. TIME SLOTS
    #
    # Automatically creates 30-minute slots based on
    # every doctor's actual schedule.
    # ==================================================

    def seed_time_slots(self):

        schedules = DoctorSchedule.objects.filter(
            is_active=True
        )

        created_count = 0

        for schedule in schedules:

            current_datetime = datetime.combine(
                date.today(),
                schedule.start_time
            )

            end_datetime = datetime.combine(
                date.today(),
                schedule.end_time
            )

            while current_datetime < end_datetime:

                slot_time = current_datetime.time()

                _, created = TimeSlot.objects.update_or_create(
                    schedule=schedule,
                    slot_time=slot_time,
                    defaults={
                        "max_patient": (
                            self.MAX_PATIENT_PER_SLOT
                        ),
                        "is_active": True,
                    }
                )

                if created:
                    created_count += 1

                current_datetime += timedelta(
                    minutes=self.SLOT_DURATION_MINUTES
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Time slots seeded successfully "
                f"({created_count} new slots)"
            )
        )

    # ==================================================
    # 6. SYNC SLOT BOOKED COUNT
    #
    # Fixes old incorrect booked_count values.
    # ==================================================

    def sync_slot_booked_counts(self):

        slots = TimeSlot.objects.all()

        for slot in slots:

            appointment_count = Appointment.objects.filter(
                slot=slot
            ).exclude(
                status__in=["Cancelled", "Rejected"]
            ).count()

            if appointment_count > slot.max_patient:
                appointment_count = slot.max_patient

            TimeSlot.objects.filter(
                pk=slot.pk
            ).update(
                booked_count=appointment_count
            )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Time slot booked counts synchronized"
            )
        )

    # ==================================================
    # 7. APPOINTMENTS
    #
    # Fixed appointment generation:
    # - Correct doctor working day
    # - Correct schedule
    # - Correct slot capacity
    # - No duplicate patient/doctor/date appointment
    # ==================================================

    def seed_appointments(self):

        patients = list(
            PatientProfile.objects.all()
        )

        if not patients:
            self.stdout.write(
                self.style.WARNING(
                    "⚠ No patients found. Skipping appointments."
                )
            )
            return

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

        target_appointments = 30
        created_count = 0

        for offset in range(1, 31):

            if created_count >= target_appointments:
                break

            appointment_date = (
                date.today()
                + timedelta(days=offset)
            )

            day_name = appointment_date.strftime(
                "%A"
            )

            schedules = list(
                DoctorSchedule.objects.select_related(
                    "doctor",
                    "doctor__department"
                ).filter(
                    day=day_name,
                    is_active=True,
                    doctor__is_available=True
                )
            )

            if not schedules:
                continue

            attempts = 0
            max_attempts = 20

            while (
                created_count < target_appointments
                and attempts < max_attempts
            ):

                attempts += 1

                patient = choice(patients)
                schedule = choice(schedules)
                doctor = schedule.doctor

                # Prevent same patient booking same doctor
                # more than once on the same date.
                duplicate_appointment = Appointment.objects.filter(
                    patient=patient,
                    doctor=doctor,
                    appointment_date=appointment_date,
                ).exists()

                if duplicate_appointment:
                    continue

                available_slots = list(
                    TimeSlot.objects.filter(
                        schedule=schedule,
                        is_active=True,
                        booked_count__lt=models.F(
                            "max_patient"
                        )
                    )
                )

                if not available_slots:
                    continue

                slot = choice(available_slots)

                # Additional safety check:
                # Same patient + doctor + date + slot
                # should never be duplicated.
                exact_duplicate = Appointment.objects.filter(
                    patient=patient,
                    doctor=doctor,
                    appointment_date=appointment_date,
                    slot=slot,
                ).exists()

                if exact_duplicate:
                    continue

                status = choice(
                    appointment_statuses
                )

                appointment = Appointment.objects.create(
                    patient=patient,
                    doctor=doctor,
                    slot=slot,
                    appointment_date=appointment_date,
                    reason=choice(
                        appointment_reasons
                    ),
                    symptoms=choice(
                        appointment_symptoms
                    ),
                    status=status,
                )

                # Safely update booked count
                TimeSlot.objects.filter(
                    pk=slot.pk,
                    booked_count__lt=models.F(
                        "max_patient"
                    )
                ).update(
                    booked_count=models.F(
                        "booked_count"
                    ) + 1
                )

                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {created_count} Sample appointments seeded successfully"
            )
        )

    # ==================================================
    # 8. PAYMENTS
    # ==================================================

    def seed_payments(self):

        payment_methods = [
            "Bkash",
            "Nagad",
            "Card",
            "Cash",
        ]

        created_count = 0

        for appointment in Appointment.objects.select_related(
            "patient",
            "doctor"
        ).all():

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

            _, created = Payment.objects.get_or_create(
                appointment=appointment,
                defaults={
                    "patient": appointment.patient,
                    "amount": appointment.doctor.consultation_fee,
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

            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {created_count} Payments seeded successfully"
            )
        )

    # ==================================================
    # 9. DIAGNOSTIC CATEGORIES
    # ==================================================

    def seed_diagnostic_categories(self):

        categories = [

            (
                "Blood Test",
                "Blood related laboratory tests."
            ),

            (
                "Urine Test",
                "Urine analysis and infection tests."
            ),

            (
                "Imaging",
                "Radiology and medical imaging services."
            ),

            (
                "Heart Checkup",
                "Cardiology diagnostic services."
            ),

            (
                "Diabetes",
                "Blood glucose and diabetes monitoring tests."
            ),

            (
                "Hormone",
                "Hormone and endocrine related tests."
            ),

            (
                "Liver Function",
                "Liver health and function tests."
            ),

            (
                "Kidney Function",
                "Kidney health and function tests."
            ),
        ]

        for name, description in categories:

            TestCategory.objects.update_or_create(
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
    # 10. DIAGNOSTIC TESTS
    # ==================================================

    def seed_diagnostic_tests(self):

        test_data = [

            {
                "category": "Blood Test",
                "name": "Complete Blood Count (CBC)",
                "description": (
                    "Measures different components of blood."
                ),
                "price": 600,
                "duration": "6 Hours",
            },

            {
                "category": "Blood Test",
                "name": "Blood Group and Rh Factor",
                "description": (
                    "Determines blood group and Rh factor."
                ),
                "price": 300,
                "duration": "2 Hours",
            },

            {
                "category": "Blood Test",
                "name": "Hemoglobin",
                "description": (
                    "Measures hemoglobin level in the blood."
                ),
                "price": 250,
                "duration": "2 Hours",
            },

            {
                "category": "Urine Test",
                "name": "Urine R/E",
                "description": (
                    "Routine examination of urine."
                ),
                "price": 350,
                "duration": "4 Hours",
            },

            {
                "category": "Urine Test",
                "name": "Urine Culture",
                "description": (
                    "Detects bacterial infection in urine."
                ),
                "price": 800,
                "duration": "24 Hours",
            },

            {
                "category": "Imaging",
                "name": "X-Ray Chest",
                "description": (
                    "Chest radiographic examination."
                ),
                "price": 1000,
                "duration": "30 Minutes",
            },

            {
                "category": "Imaging",
                "name": "MRI Brain",
                "description": (
                    "Detailed magnetic resonance imaging of the brain."
                ),
                "price": 6500,
                "duration": "2 Hours",
            },

            {
                "category": "Imaging",
                "name": "CT Scan",
                "description": (
                    "Computed tomography scan."
                ),
                "price": 5000,
                "duration": "2 Hours",
            },

            {
                "category": "Heart Checkup",
                "name": "ECG",
                "description": (
                    "Records electrical activity of the heart."
                ),
                "price": 700,
                "duration": "20 Minutes",
            },

            {
                "category": "Heart Checkup",
                "name": "Echocardiogram",
                "description": (
                    "Ultrasound examination of the heart."
                ),
                "price": 2500,
                "duration": "45 Minutes",
            },

            {
                "category": "Diabetes",
                "name": "Random Blood Sugar",
                "description": (
                    "Measures current blood glucose level."
                ),
                "price": 300,
                "duration": "1 Hour",
            },

            {
                "category": "Diabetes",
                "name": "HbA1c",
                "description": (
                    "Measures average blood sugar over three months."
                ),
                "price": 900,
                "duration": "6 Hours",
            },

            {
                "category": "Hormone",
                "name": "TSH",
                "description": (
                    "Measures thyroid stimulating hormone level."
                ),
                "price": 900,
                "duration": "6 Hours",
            },

            {
                "category": "Liver Function",
                "name": "Liver Function Test (LFT)",
                "description": (
                    "Evaluates liver health and function."
                ),
                "price": 1200,
                "duration": "6 Hours",
            },

            {
                "category": "Kidney Function",
                "name": "Kidney Function Test (KFT)",
                "description": (
                    "Evaluates kidney health and function."
                ),
                "price": 1100,
                "duration": "6 Hours",
            },
        ]

        for data in test_data:

            category = TestCategory.objects.get(
                name=data["category"]
            )

            DiagnosticTest.objects.update_or_create(
                name=data["name"],
                defaults={
                    "category": category,
                    "description": data["description"],
                    "price": Decimal(
                        str(data["price"])
                    ),
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
    # 11. TEST BOOKINGS
    # ==================================================

    def seed_test_bookings(self):

        patients = list(
            PatientProfile.objects.all()
        )

        tests = list(
            DiagnosticTest.objects.filter(
                is_available=True
            )
        )

        if not patients or not tests:

            self.stdout.write(
                self.style.WARNING(
                    "⚠ No patients or tests found. Skipping test bookings."
                )
            )
            return

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

        created_count = 0

        for offset in range(1, 16):

            patient = choice(patients)
            diagnostic_test = choice(tests)

            booking_date = (
                date.today()
                + timedelta(days=offset)
            )

            booking_number = (
                f"TEST-"
                f"{booking_date.strftime('%Y%m%d')}-"
                f"{uuid.uuid4().hex[:6].upper()}"
            )

            _, created = TestBooking.objects.get_or_create(
                booking_number=booking_number,
                defaults={
                    "patient": patient,
                    "diagnostic_test": diagnostic_test,
                    "booking_date": booking_date,
                    "booking_time": choice(
                        booking_times
                    ),
                    "status": choice(
                        booking_statuses
                    ),
                }
            )

            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {created_count} Test bookings seeded successfully"
            )
        )

    # ==================================================
    # 12. MEDICAL REPORTS
    # ==================================================

    def seed_medical_reports(self):

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
        ).select_related(
            "patient",
            "doctor"
        )

        created_count = 0

        for appointment in completed_appointments:

            _, created = MedicalReport.objects.get_or_create(
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

            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {created_count} Medical reports seeded successfully"
            )
        )

    # ==================================================
    # 13. NOTIFICATIONS
    # ==================================================

    def seed_notifications(self):

        created_count = 0

        for appointment in Appointment.objects.select_related(
            "patient__user",
            "doctor__user",
            "slot"
        ):

            _, created = Notification.objects.get_or_create(
                user=appointment.patient.user,
                title=f"Appointment {appointment.status}",
                message=(
                    f"Your appointment with "
                    f"Dr. {appointment.doctor.user.get_full_name()} "
                    f"on {appointment.appointment_date} "
                    f"at "
                    f"{appointment.slot.slot_time.strftime('%I:%M %p')} "
                    f"is {appointment.status.lower()}."
                ),
                defaults={
                    "is_read": False
                }
            )

            if created:
                created_count += 1

        for payment in Payment.objects.select_related(
            "patient__user",
            "appointment"
        ):

            _, created = Notification.objects.get_or_create(
                user=payment.patient.user,
                title="Payment Update",
                message=(
                    f"Your payment of ৳{payment.amount} "
                    f"for appointment "
                    f"{payment.appointment.booking_number} "
                    f"is {payment.payment_status.lower()}."
                ),
                defaults={
                    "is_read": False
                }
            )

            if created:
                created_count += 1

        for booking in TestBooking.objects.select_related(
            "patient__user",
            "diagnostic_test"
        ):

            _, created = Notification.objects.get_or_create(
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

            if created:
                created_count += 1

        for report in MedicalReport.objects.select_related(
            "patient__user"
        ):

            _, created = Notification.objects.get_or_create(
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

            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {created_count} Notifications seeded successfully"
            )
        )

    # ==================================================
    # 14. SUMMARY
    # ==================================================

    def print_summary(self):

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
                "=========================================="
            )
        )

        self.stdout.write(
            f"Departments: {Department.objects.count()}"
        )

        self.stdout.write(
            f"Doctors: {Doctor.objects.count()}"
        )

        self.stdout.write(
            f"Available Doctors: "
            f"{Doctor.objects.filter(is_available=True).count()}"
        )

        self.stdout.write(
            f"Patients: {PatientProfile.objects.count()}"
        )

        self.stdout.write(
            f"Schedules: {DoctorSchedule.objects.count()}"
        )

        self.stdout.write(
            f"Time Slots: {TimeSlot.objects.count()}"
        )

        self.stdout.write(
            f"Active Slots: "
            f"{TimeSlot.objects.filter(is_active=True).count()}"
        )

        self.stdout.write(
            f"Appointments: {Appointment.objects.count()}"
        )

        self.stdout.write(
            f"Payments: {Payment.objects.count()}"
        )

        self.stdout.write(
            f"Diagnostic Categories: "
            f"{TestCategory.objects.count()}"
        )

        self.stdout.write(
            f"Diagnostic Tests: "
            f"{DiagnosticTest.objects.count()}"
        )

        self.stdout.write(
            f"Test Bookings: "
            f"{TestBooking.objects.count()}"
        )

        self.stdout.write(
            f"Medical Reports: "
            f"{MedicalReport.objects.count()}"
        )

        self.stdout.write(
            f"Notifications: "
            f"{Notification.objects.count()}"
        )

        self.stdout.write(
            self.style.SUCCESS(
                "==========================================\n"
            )
        )