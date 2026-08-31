from datetime import date, datetime, timedelta, time
from decimal import Decimal
from random import choice
import uuid

from django.core.management.base import BaseCommand
from django.db import models, transaction
from django.utils import timezone

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
    help = "Seed realistic and conflict-safe hospital management system data"

    DEFAULT_DOCTOR_PASSWORD = "Doctor@123"
    DEFAULT_PATIENT_PASSWORD = "Patient@123"

    SLOT_DURATION_MINUTES = 30
    MAX_PATIENT_PER_SLOT = 5

    APPOINTMENT_TARGET = 30
    TEST_BOOKING_TARGET = 15

    # ==================================================
    # COMMAND ARGUMENTS
    # ==================================================

    def add_arguments(self, parser):

        parser.add_argument(
            "--reset-passwords",
            action="store_true",
            help="Reset passwords of seeded users."
        )

    # ==================================================
    # MAIN COMMAND
    # ==================================================

    @transaction.atomic
    def handle(self, *args, **options):

        self.reset_passwords = options.get(
            "reset_passwords",
            False
        )

        self.stdout.write(
            self.style.WARNING(
                "\n=========================================="
            )
        )

        self.stdout.write(
            self.style.WARNING(
                " Starting Hospital Database Seeder..."
            )
        )

        self.stdout.write(
            self.style.WARNING(
                "==========================================\n"
            )
        )

        self.seed_departments()
        self.seed_doctors()
        self.seed_patients()
        self.seed_doctor_schedules()
        self.seed_time_slots()

        self.sync_slot_booked_counts()

        self.seed_appointments()

        self.sync_slot_booked_counts()

        self.seed_payments()
        self.seed_diagnostic_categories()
        self.seed_diagnostic_tests()
        self.seed_test_bookings()
        self.seed_medical_reports()
        self.seed_notifications()

        self.print_summary()

    # ==================================================
    # HELPER METHODS
    # ==================================================

    def get_or_create_user(
        self,
        username,
        first_name,
        last_name,
        email,
        role,
        password,
        phone=None,
    ):

        # Search existing user by username
        user = CustomUser.objects.filter(
            username=username
        ).first()

        # Search by email if username not found
        if not user:
            user = CustomUser.objects.filter(
                email=email
            ).first()

        # Search by phone if still not found
        if not user and phone:
            user = CustomUser.objects.filter(
                phone=phone
            ).first()

        created = False

        if not user:

            user = CustomUser(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                role=role,
            )

            if phone:
                user.phone = phone

            user.set_password(password)
            user.save()

            created = True

        else:

            # Update basic information
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.role = role

            # Handle phone safely
            if phone:

                existing_phone_user = (
                    CustomUser.objects
                    .filter(phone=phone)
                    .exclude(pk=user.pk)
                    .first()
                )

                if existing_phone_user:

                    self.stdout.write(
                        self.style.WARNING(
                            f"⚠ Phone conflict: {phone} is already "
                            f"used by {existing_phone_user.username}"
                        )
                    )

                else:
                    user.phone = phone

            user.save()

        return user, created
    
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
                "General internal medicine and adult healthcare services."
            ),

            (
                "ENT",
                "Treatment of ear, nose, throat and related conditions."
            ),

            (
                "Gynecology",
                "Women's reproductive health and gynecological care."
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
                f"✓ {len(departments_data)} Departments ready"
            )
        )

    # ==================================================
    # 2. DOCTORS
    # ==================================================

    def seed_doctors(self):

        doctor_data = [

            {
                "username": "dr_mohammad_rahman",
                "first_name": "Mohammad",
                "last_name": "Rahman",
                "email": "dr.mohammad.rahman@hospital.com",
                "department": "Cardiology",
                "specialization": "Cardiologist",
                "qualification": "MBBS, FCPS (Cardiology)",
                "experience": 15,
                "fee": 1500,
                "biography": "Experienced cardiologist specializing in heart disease, hypertension and cardiovascular care.",
            },

            {
                "username": "dr_ahmed_hossain",
                "first_name": "Ahmed",
                "last_name": "Hossain",
                "email": "dr.ahmed.hossain@hospital.com",
                "department": "Neurology",
                "specialization": "Neurologist",
                "qualification": "MBBS, MD (Neurology)",
                "experience": 12,
                "fee": 1600,
                "biography": "Specialist in neurological disorders, migraine, stroke and epilepsy management.",
            },

            {
                "username": "dr_mahmud_hasib",
                "first_name": "Mahmud",
                "last_name": "Hasib",
                "email": "dr.mahmud.hasib@hospital.com",
                "department": "Orthopedics",
                "specialization": "Orthopedic Surgeon",
                "qualification": "MBBS, MS (Orthopedics)",
                "experience": 13,
                "fee": 1500,
                "biography": "Specializes in bone, joint, fracture and musculoskeletal treatment.",
            },

            {
                "username": "dr_tanvir_islam",
                "first_name": "Tanvir",
                "last_name": "Islam",
                "email": "dr.tanvir.islam@hospital.com",
                "department": "Medicine",
                "specialization": "Medicine Specialist",
                "qualification": "MBBS, MD (Medicine)",
                "experience": 10,
                "fee": 1000,
                "biography": "Specializes in internal medicine, diabetes and chronic disease management.",
            },

            {
                "username": "dr_rezaul_karim",
                "first_name": "Rezaul",
                "last_name": "Karim",
                "email": "dr.rezaul.karim@hospital.com",
                "department": "ENT",
                "specialization": "ENT Specialist",
                "qualification": "MBBS, DLO, FCPS",
                "experience": 12,
                "fee": 1200,
                "biography": "Specializes in ear, nose, throat and related head and neck conditions.",
            },

            {
                "username": "dr_farhana_akter",
                "first_name": "Farhana",
                "last_name": "Akter",
                "email": "dr.farhana.akter@hospital.com",
                "department": "Gynecology",
                "specialization": "Gynecologist and Obstetrician",
                "qualification": "MBBS, FCPS (Gynecology)",
                "experience": 11,
                "fee": 1400,
                "biography": "Provides comprehensive care for women's health, pregnancy and gynecological conditions.",
            },

            {
                "username": "dr_sadia_sultana",
                "first_name": "Sadia",
                "last_name": "Sultana",
                "email": "dr.sadia.sultana@hospital.com",
                "department": "Pediatrics",
                "specialization": "Pediatrician",
                "qualification": "MBBS, DCH, FCPS (Pediatrics)",
                "experience": 9,
                "fee": 1200,
                "biography": "Provides specialized medical care for infants, children and adolescents.",
            },

            {
                "username": "dr_nusrat_jahan",
                "first_name": "Nusrat",
                "last_name": "Jahan",
                "email": "dr.nusrat.jahan@hospital.com",
                "department": "Dermatology",
                "specialization": "Dermatologist",
                "qualification": "MBBS, DDV",
                "experience": 8,
                "fee": 1100,
                "biography": "Provides treatment for skin, hair and nail related diseases.",
            },

            {
                "username": "dr_imran_kabir",
                "first_name": "Imran",
                "last_name": "Kabir",
                "email": "dr.imran.kabir@hospital.com",
                "department": "Dental",
                "specialization": "Dental Surgeon",
                "qualification": "BDS, MS (Oral Surgery)",
                "experience": 10,
                "fee": 900,
                "biography": "Provides dental treatment, oral surgery and preventive oral healthcare.",
            },

            {
                "username": "dr_sharmin_akter",
                "first_name": "Sharmin",
                "last_name": "Akter",
                "email": "dr.sharmin.akter@hospital.com",
                "department": "Ophthalmology",
                "specialization": "Ophthalmologist",
                "qualification": "MBBS, DO",
                "experience": 11,
                "fee": 1300,
                "biography": "Specializes in eye diseases, vision problems and comprehensive eye care.",
            },
        ]

        for data in doctor_data:

            user, _ = self.get_or_create_user(
                username=data["username"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                role="doctor",
                password=self.DEFAULT_DOCTOR_PASSWORD,
            )

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
                    "consultation_fee": Decimal(str(data["fee"])),
                    "biography": data["biography"],
                    "is_available": True,
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {len(doctor_data)} Doctors ready"
            )
        )

    # ==================================================
    # 3. PATIENTS
    # ==================================================

    def seed_patients(self):

        patient_data = [

            {
                "username": "patient_kawser_talukder",
                "first_name": "Kawser",
                "last_name": "Talukder",
                "email": "kawser.talukder@example.com",
                "phone": "01711111111",
                "gender": "Male",
                "dob": "2001-01-15",
                "blood_group": "B+",
                "address": "Dhaka, Bangladesh",
                "emergency_contact": "01811111111",
            },

            {
                "username": "patient_rakib_hasan",
                "first_name": "Rakib",
                "last_name": "Hasan",
                "email": "rakib.hasan@example.com",
                "phone": "01722222222",
                "gender": "Male",
                "dob": "1999-05-20",
                "blood_group": "A+",
                "address": "Tangail, Bangladesh",
                "emergency_contact": "01822222222",
            },

            {
                "username": "patient_sumaiya_islam",
                "first_name": "Sumaiya",
                "last_name": "Islam",
                "email": "sumaiya.islam@example.com",
                "phone": "01733333333",
                "gender": "Female",
                "dob": "2002-03-12",
                "blood_group": "O+",
                "address": "Gazipur, Bangladesh",
                "emergency_contact": "01833333333",
            },

            {
                "username": "patient_tamim_ahmed",
                "first_name": "Tamim",
                "last_name": "Ahmed",
                "email": "tamim.ahmed@example.com",
                "phone": "01744444444",
                "gender": "Male",
                "dob": "1998-09-18",
                "blood_group": "AB+",
                "address": "Dhaka, Bangladesh",
                "emergency_contact": "01844444444",
            },

            {
                "username": "patient_nusrat_jahan",
                "first_name": "Nusrat",
                "last_name": "Jahan",
                "email": "nusrat.jahan@example.com",
                "phone": "01755555555",
                "gender": "Female",
                "dob": "2001-12-10",
                "blood_group": "A-",
                "address": "Mymensingh, Bangladesh",
                "emergency_contact": "01855555555",
            },

            {
                "username": "patient_sakib_hasan",
                "first_name": "Sakib",
                "last_name": "Hasan",
                "email": "sakib.hasan@example.com",
                "phone": "01766666666",
                "gender": "Male",
                "dob": "1997-07-25",
                "blood_group": "O+",
                "address": "Chattogram, Bangladesh",
                "emergency_contact": "01866666666",
            },

            {
                "username": "patient_mim_akter",
                "first_name": "Mim",
                "last_name": "Akter",
                "email": "mim.akter@example.com",
                "phone": "01777777777",
                "gender": "Female",
                "dob": "2003-04-10",
                "blood_group": "B+",
                "address": "Rajshahi, Bangladesh",
                "emergency_contact": "01877777777",
            },

            {
                "username": "patient_fahim_chowdhury",
                "first_name": "Fahim",
                "last_name": "Chowdhury",
                "email": "fahim.chowdhury@example.com",
                "phone": "01788888888",
                "gender": "Male",
                "dob": "1996-11-08",
                "blood_group": "A+",
                "address": "Khulna, Bangladesh",
                "emergency_contact": "01888888888",
            },
        ]

        for data in patient_data:

            user, _ = self.get_or_create_user(
                username=data["username"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                role="patient",
                password=self.DEFAULT_PATIENT_PASSWORD,
                phone=data["phone"],
            )

            PatientProfile.objects.update_or_create(
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
                f"✓ {len(patient_data)} Patients ready"
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

        for doctor in Doctor.objects.select_related("department"):

            schedules = schedule_patterns.get(
                doctor.department.name,
                []
            )

            for day, start_time, end_time in schedules:

                DoctorSchedule.objects.update_or_create(
                    doctor=doctor,
                    day=day,
                    defaults={
                        "start_time": time.fromisoformat(start_time),
                        "end_time": time.fromisoformat(end_time),
                        "is_active": True,
                    }
                )

        self.stdout.write(
            self.style.SUCCESS(
                "✓ Doctor schedules ready"
            )
        )

    # ==================================================
    # 5. TIME SLOTS
    # ==================================================

    def seed_time_slots(self):

        created_count = 0

        schedules = DoctorSchedule.objects.filter(
            is_active=True
        )

        for schedule in schedules:

            current = datetime.combine(
                date.today(),
                schedule.start_time
            )

            end = datetime.combine(
                date.today(),
                schedule.end_time
            )

            while current < end:

                slot_time = current.time()

                _, created = TimeSlot.objects.update_or_create(
                    schedule=schedule,
                    slot_time=slot_time,
                    defaults={
                        "max_patient": self.MAX_PATIENT_PER_SLOT,
                        "is_active": True,
                    }
                )

                if created:
                    created_count += 1

                current += timedelta(
                    minutes=self.SLOT_DURATION_MINUTES
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Time slots ready "
                f"({created_count} new slots, "
                f"{self.SLOT_DURATION_MINUTES} minute interval)"
            )
        )

    # ==================================================
    # 6. SYNC SLOT COUNTS
    # ==================================================

    def sync_slot_booked_counts(self):

        updated_count = 0

        for slot in TimeSlot.objects.all():

            count = Appointment.objects.filter(
                slot=slot
            ).exclude(
                status__in=[
                    "Cancelled",
                    "Rejected",
                ]
            ).count()

            count = min(
                count,
                slot.max_patient
            )

            if slot.booked_count != count:

                TimeSlot.objects.filter(
                    pk=slot.pk
                ).update(
                    booked_count=count
                )

                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Slot booking counts synchronized "
                f"({updated_count} updated)"
            )
        )

    # ==================================================
    # 7. APPOINTMENTS
    # ==================================================

    def seed_appointments(self):

        patients = list(
            PatientProfile.objects.all()
        )

        if not patients:

            self.stdout.write(
                self.style.WARNING(
                    "⚠ No patients found."
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

        created_count = 0

        existing_count = Appointment.objects.count()

        if existing_count >= self.APPOINTMENT_TARGET:

            self.stdout.write(
                self.style.WARNING(
                    f"⚠ Appointment target already reached "
                    f"({existing_count})"
                )
            )

            return

        target = (
            self.APPOINTMENT_TARGET
            - existing_count
        )

        for offset in range(1, 90):

            if created_count >= target:
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
                    "doctor"
                ).filter(
                    day=day_name,
                    is_active=True,
                    doctor__is_available=True,
                )
            )

            if not schedules:
                continue

            attempts = 0

            while (
                created_count < target
                and attempts < 100
            ):

                attempts += 1

                patient = choice(patients)
                schedule = choice(schedules)
                doctor = schedule.doctor

                duplicate_exists = Appointment.objects.filter(
                    patient=patient,
                    doctor=doctor,
                    appointment_date=appointment_date,
                ).exclude(
                    status__in=[
                        "Cancelled",
                        "Rejected",
                    ]
                ).exists()

                if duplicate_exists:
                    continue

                available_slots = list(
                    TimeSlot.objects.filter(
                        schedule=schedule,
                        is_active=True,
                        booked_count__lt=models.F(
                            "max_patient"
                        ),
                    )
                )

                if not available_slots:
                    continue

                slot = choice(
                    available_slots
                )

                # Lock/update slot first
                updated = TimeSlot.objects.filter(
                    pk=slot.pk,
                    booked_count__lt=models.F(
                        "max_patient"
                    )
                ).update(
                    booked_count=models.F(
                        "booked_count"
                    ) + 1
                )

                if not updated:
                    continue

                # Create appointment after slot capacity confirmed
                Appointment.objects.create(
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
                    status=choice(
                        appointment_statuses
                    ),
                )

                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {created_count} New appointments created"
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

        appointments = Appointment.objects.select_related(
            "patient",
            "doctor"
        )

        for appointment in appointments:

            if appointment.status in [
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
                f"✓ {created_count} Payments created"
            )
        )

    # ==================================================
    # 9. DIAGNOSTIC CATEGORIES
    # ==================================================

    def seed_diagnostic_categories(self):

        categories = [

            ("Blood Test", "Blood related laboratory tests."),
            ("Urine Test", "Urine analysis and infection tests."),
            ("Imaging", "Radiology and medical imaging services."),
            ("Heart Checkup", "Cardiology diagnostic services."),
            ("Diabetes", "Blood glucose and diabetes monitoring tests."),
            ("Hormone", "Hormone and endocrine related tests."),
            ("Liver Function", "Liver health and function tests."),
            ("Kidney Function", "Kidney health and function tests."),
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
                f"✓ {len(categories)} Diagnostic categories ready"
            )
        )

    # ==================================================
    # 10. DIAGNOSTIC TESTS
    # ==================================================

    def seed_diagnostic_tests(self):

        test_data = [

            ("Blood Test", "Complete Blood Count (CBC)", "Measures different components of blood.", 600, "6 Hours"),
            ("Blood Test", "Blood Group and Rh Factor", "Determines blood group and Rh factor.", 300, "2 Hours"),
            ("Blood Test", "Hemoglobin", "Measures hemoglobin level in the blood.", 250, "2 Hours"),

            ("Urine Test", "Urine R/E", "Routine examination of urine.", 350, "4 Hours"),
            ("Urine Test", "Urine Culture", "Detects bacterial infection in urine.", 800, "24 Hours"),

            ("Imaging", "X-Ray Chest", "Chest radiographic examination.", 1000, "30 Minutes"),
            ("Imaging", "MRI Brain", "Detailed magnetic resonance imaging of the brain.", 6500, "2 Hours"),
            ("Imaging", "CT Scan", "Computed tomography scan.", 5000, "2 Hours"),

            ("Heart Checkup", "ECG", "Records electrical activity of the heart.", 700, "20 Minutes"),
            ("Heart Checkup", "Echocardiogram", "Ultrasound examination of the heart.", 2500, "45 Minutes"),

            ("Diabetes", "Random Blood Sugar", "Measures current blood glucose level.", 300, "1 Hour"),
            ("Diabetes", "HbA1c", "Measures average blood sugar level over three months.", 900, "6 Hours"),

            ("Hormone", "TSH", "Measures thyroid stimulating hormone level.", 900, "6 Hours"),

            ("Liver Function", "Liver Function Test (LFT)", "Evaluates liver health and function.", 1200, "6 Hours"),

            ("Kidney Function", "Kidney Function Test (KFT)", "Evaluates kidney health and function.", 1100, "6 Hours"),
        ]

        for (
            category_name,
            name,
            description,
            price,
            duration
        ) in test_data:

            category = TestCategory.objects.get(
                name=category_name
            )

            DiagnosticTest.objects.update_or_create(
                name=name,
                defaults={
                    "category": category,
                    "description": description,
                    "price": Decimal(str(price)),
                    "duration": duration,
                    "is_available": True,
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {len(test_data)} Diagnostic tests ready"
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
                    "⚠ No patients or tests found."
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
            time(14, 30),
            time(15, 0),
            time(15, 30),
            time(16, 0),
        ]

        created_count = 0

        existing_count = TestBooking.objects.count()

        if existing_count >= self.TEST_BOOKING_TARGET:

            self.stdout.write(
                self.style.WARNING(
                    f"⚠ Test booking target already reached "
                    f"({existing_count})"
                )
            )

            return

        target = (
            self.TEST_BOOKING_TARGET
            - existing_count
        )

        attempts = 0
        max_attempts = 500

        while (
            created_count < target
            and attempts < max_attempts
        ):

            attempts += 1

            patient = choice(patients)
            diagnostic_test = choice(tests)

            booking_date = (
                date.today()
                + timedelta(
                    days=choice(range(1, 40))
                )
            )

            booking_time = choice(
                booking_times
            )

            duplicate_exists = TestBooking.objects.filter(
                patient=patient,
                diagnostic_test=diagnostic_test,
                booking_date=booking_date,
                booking_time=booking_time,
            ).exists()

            if duplicate_exists:
                continue

            booking_number = (
                f"TEST-"
                f"{booking_date.strftime('%Y%m%d')}-"
                f"{uuid.uuid4().hex[:6].upper()}"
            )

            TestBooking.objects.create(
                booking_number=booking_number,
                patient=patient,
                diagnostic_test=diagnostic_test,
                booking_date=booking_date,
                booking_time=booking_time,
                status=choice(
                    booking_statuses
                ),
            )

            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {created_count} New test bookings created"
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
            "Take prescribed medication as directed.",
            "Continue current treatment and follow up after two weeks.",
            "Maintain a balanced diet and adequate rest.",
            "Monitor symptoms and return if the condition worsens.",
            "Continue medication according to the doctor's instructions.",
        ]

        remarks = [
            "Patient condition is stable.",
            "Follow-up consultation recommended.",
            "Further investigation may be required.",
            "Condition is improving gradually.",
            "Regular monitoring is recommended.",
        ]

        created_count = 0

        completed_appointments = Appointment.objects.filter(
            status="Completed"
        ).select_related(
            "patient",
            "doctor"
        )

        for appointment in completed_appointments:

            _, created = MedicalReport.objects.get_or_create(
                appointment=appointment,
                defaults={
                    "patient": appointment.patient,
                    "doctor": appointment.doctor,
                    "report_title": choice(report_titles),
                    "prescription": choice(prescriptions),
                    "remarks": choice(remarks),
                }
            )

            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {created_count} Medical reports created"
            )
        )

    # ==================================================
    # 13. NOTIFICATIONS
    # ==================================================

    def create_notification(
        self,
        user,
        title,
        message
    ):

        notification, created = (
            Notification.objects.get_or_create(
                user=user,
                title=title,
                message=message,
                defaults={
                    "is_read": False
                }
            )
        )

        return created

    def seed_notifications(self):

        created_count = 0

        # APPOINTMENT NOTIFICATIONS

        for appointment in Appointment.objects.select_related(
            "patient__user",
            "doctor__user",
            "slot"
        ):

            created = self.create_notification(

                user=appointment.patient.user,

                title=f"Appointment {appointment.status}",

                message=(
                    f"Your appointment with Dr. "
                    f"{appointment.doctor.user.get_full_name()} "
                    f"on {appointment.appointment_date} at "
                    f"{appointment.slot.slot_time.strftime('%I:%M %p')} "
                    f"is {appointment.status.lower()}."
                )
            )

            if created:
                created_count += 1

        # PAYMENT NOTIFICATIONS

        for payment in Payment.objects.select_related(
            "patient__user",
            "appointment"
        ):

            created = self.create_notification(

                user=payment.patient.user,

                title="Payment Update",

                message=(
                    f"Your payment of ৳{payment.amount} "
                    f"for appointment "
                    f"{payment.appointment.booking_number} "
                    f"is {payment.payment_status.lower()}."
                )
            )

            if created:
                created_count += 1

        # DIAGNOSTIC TEST NOTIFICATIONS

        for booking in TestBooking.objects.select_related(
            "patient__user",
            "diagnostic_test"
        ):

            created = self.create_notification(

                user=booking.patient.user,

                title="Diagnostic Test Booking",

                message=(
                    f"Your booking for "
                    f"{booking.diagnostic_test.name} "
                    f"on {booking.booking_date} "
                    f"is {booking.status.lower()}."
                )
            )

            if created:
                created_count += 1

        # MEDICAL REPORT NOTIFICATIONS

        for report in MedicalReport.objects.select_related(
            "patient__user"
        ):

            created = self.create_notification(

                user=report.patient.user,

                title="Medical Report Available",

                message=(
                    f"Your medical report "
                    f"'{report.report_title}' "
                    f"is now available."
                )
            )

            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {created_count} New notifications created"
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

        summary = {

            "Departments":
                Department.objects.count(),

            "Doctors":
                Doctor.objects.count(),

            "Available Doctors":
                Doctor.objects.filter(
                    is_available=True
                ).count(),

            "Patients":
                PatientProfile.objects.count(),

            "Doctor Schedules":
                DoctorSchedule.objects.count(),

            "Time Slots":
                TimeSlot.objects.count(),

            "Active Time Slots":
                TimeSlot.objects.filter(
                    is_active=True
                ).count(),

            "Appointments":
                Appointment.objects.count(),

            "Payments":
                Payment.objects.count(),

            "Diagnostic Categories":
                TestCategory.objects.count(),

            "Diagnostic Tests":
                DiagnosticTest.objects.count(),

            "Test Bookings":
                TestBooking.objects.count(),

            "Medical Reports":
                MedicalReport.objects.count(),

            "Notifications":
                Notification.objects.count(),
        }

        for name, count in summary.items():

            self.stdout.write(
                f"{name}: {count}"
            )

        self.stdout.write(
            self.style.SUCCESS(
                "==========================================\n"
            )
        )