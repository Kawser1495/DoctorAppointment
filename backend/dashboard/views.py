from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin

from doctors.models import Doctor, Department
from patients.models import PatientProfile, FamilyMember
from appointments.models import Appointment
from reports.models import MedicalReport
from payments.models import Payment
from diagnostics.models import DiagnosticTest, TestBooking
from notifications.models import Notification

from .serializers import DashboardSerializer


class DashboardAPIView(APIView):
    """
    Main dashboard API.

    Dashboard access is determined by the authenticated
    user's role.

    Admin:
        /api/dashboard/

    Patient:
        /api/dashboard/

    Doctor:
        /api/dashboard/

    Receptionist:
        /api/dashboard/
    """

    permission_classes = [IsAuthenticated]

    # ==========================================================
    # GET DASHBOARD
    # ==========================================================

    def get(self, request):

        user = request.user

        # ------------------------------------------------------
        # ADMIN
        # ------------------------------------------------------

        if user.role == "admin" or user.is_superuser:
            return self.admin_dashboard(request)

        # ------------------------------------------------------
        # PATIENT
        # ------------------------------------------------------

        if user.role == "patient":
            return self.patient_dashboard(request)

        # ------------------------------------------------------
        # DOCTOR
        # ------------------------------------------------------

        if user.role == "doctor":
            return self.doctor_dashboard(request)

        # ------------------------------------------------------
        # RECEPTIONIST
        # ------------------------------------------------------

        if user.role == "receptionist":
            return self.receptionist_dashboard(request)

        # ------------------------------------------------------
        # Invalid Role
        # ------------------------------------------------------

        return Response(
            {
                "success": False,
                "message": "Invalid user role.",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # ==========================================================
    # ADMIN DASHBOARD
    # ==========================================================

    def admin_dashboard(self, request):
        """
        Admin-only dashboard.

        Admin can see system-wide statistics:
        - Users
        - Patients
        - Doctors
        - Departments
        - Appointments
        - Payments
        - Reports
        - Diagnostics
        - Family members
        - Notifications
        """

        # ======================================================
        # APPOINTMENTS
        # ======================================================

        appointments = Appointment.objects.all()

        total_appointments = appointments.count()

        pending_appointments = appointments.filter(
            status="Pending"
        ).count()

        confirmed_appointments = appointments.filter(
            status="Confirmed"
        ).count()

        completed_appointments = appointments.filter(
            status="Completed"
        ).count()

        cancelled_appointments = appointments.filter(
            status="Cancelled"
        ).count()

        # ======================================================
        # PAYMENTS
        # ======================================================

        total_payments = (
            Payment.objects.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        paid_payments = (
            Payment.objects.filter(
                payment_status="Paid"
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        pending_payments = (
            Payment.objects.filter(
                payment_status="Pending"
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # ======================================================
        # USERS
        # ======================================================

        from accounts.models import CustomUser

        total_users = CustomUser.objects.count()

        active_users = CustomUser.objects.filter(
            is_active=True
        ).count()

        inactive_users = CustomUser.objects.filter(
            is_active=False
        ).count()

        verified_users = CustomUser.objects.filter(
            is_verified=True
        ).count()

        # ======================================================
        # ROLE STATISTICS
        # ======================================================

        total_admins = CustomUser.objects.filter(
            role="admin"
        ).count()

        total_patients = CustomUser.objects.filter(
            role="patient"
        ).count()

        total_doctors_users = CustomUser.objects.filter(
            role="doctor"
        ).count()

        total_receptionists = CustomUser.objects.filter(
            role="receptionist"
        ).count()

        # ======================================================
        # PATIENT / DOCTOR
        # ======================================================

        total_patients_profiles = PatientProfile.objects.count()

        total_doctors = Doctor.objects.count()

        total_departments = Department.objects.count()

        total_family_members = FamilyMember.objects.count()

        # ======================================================
        # MEDICAL DATA
        # ======================================================

        total_reports = MedicalReport.objects.count()

        total_diagnostic_tests = DiagnosticTest.objects.count()

        total_diagnostic_bookings = TestBooking.objects.count()

        # ======================================================
        # NOTIFICATIONS
        # ======================================================

        total_notifications = Notification.objects.count()

        unread_notifications = Notification.objects.filter(
            is_read=False
        ).count()

        # ======================================================
        # TODAY'S APPOINTMENTS
        # ======================================================

        today = timezone.now().date()

        today_appointments = appointments.filter(
            appointment_date=today
        ).count()

        # ======================================================
        # UPCOMING APPOINTMENTS
        # ======================================================

        upcoming_appointments = appointments.filter(
            appointment_date__gte=today,
            status__in=[
                "Pending",
                "Confirmed",
            ],
        ).count()

        # ======================================================
        # DASHBOARD DATA
        # ======================================================

        data = {

            # --------------------------------------------------
            # User Statistics
            # --------------------------------------------------

            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "verified_users": verified_users,

            "total_admins": total_admins,
            "total_patients": total_patients,
            "total_doctors_users": total_doctors_users,
            "total_receptionists": total_receptionists,

            # --------------------------------------------------
            # Patient / Doctor
            # --------------------------------------------------

            "total_patients_profiles": total_patients_profiles,
            "total_doctors": total_doctors,
            "total_departments": total_departments,
            "family_members": total_family_members,

            # --------------------------------------------------
            # Appointment Statistics
            # --------------------------------------------------

            "total_appointments": total_appointments,
            "pending_appointments": pending_appointments,
            "confirmed_appointments": confirmed_appointments,
            "completed_appointments": completed_appointments,
            "cancelled_appointments": cancelled_appointments,

            "today_appointments": today_appointments,
            "upcoming_appointments": upcoming_appointments,

            # --------------------------------------------------
            # Payment Statistics
            # --------------------------------------------------

            "total_payments": total_payments,
            "paid_payments": paid_payments,
            "pending_payments": pending_payments,

            # --------------------------------------------------
            # Medical Statistics
            # --------------------------------------------------

            "total_reports": total_reports,
            "total_diagnostic_tests": total_diagnostic_tests,
            "total_diagnostic_bookings": (
                total_diagnostic_bookings
            ),

            # --------------------------------------------------
            # Notification Statistics
            # --------------------------------------------------

            "total_notifications": total_notifications,
            "unread_notifications": unread_notifications,
        }

        serializer = DashboardSerializer(data)

        return Response(
            {
                "success": True,
                "role": "admin",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # ==========================================================
    # PATIENT DASHBOARD
    # ==========================================================

    def patient_dashboard(self, request):

        user = request.user

        if not hasattr(user, "patient_profile"):

            return Response(
                {
                    "success": False,
                    "message": "Patient profile not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        patient = user.patient_profile

        # ======================================================
        # APPOINTMENTS
        # ======================================================

        appointments = Appointment.objects.filter(
            patient=patient
        )

        total_appointments = appointments.count()

        pending_appointments = appointments.filter(
            status="Pending"
        ).count()

        confirmed_appointments = appointments.filter(
            status="Confirmed"
        ).count()

        completed_appointments = appointments.filter(
            status="Completed"
        ).count()

        cancelled_appointments = appointments.filter(
            status="Cancelled"
        ).count()

        # ======================================================
        # DIAGNOSTICS
        # ======================================================

        diagnostic_bookings = TestBooking.objects.filter(
            patient=patient
        )

        total_diagnostic_bookings = diagnostic_bookings.count()

        pending_diagnostic_bookings = diagnostic_bookings.filter(
            status="Pending"
        ).count()

        confirmed_diagnostic_bookings = diagnostic_bookings.filter(
            status="Confirmed"
        ).count()

        completed_diagnostic_bookings = diagnostic_bookings.filter(
            status="Completed"
        ).count()

        cancelled_diagnostic_bookings = diagnostic_bookings.filter(
            status="Cancelled"
        ).count()

        # ======================================================
        # PAYMENTS
        # ======================================================

        payments = Payment.objects.filter(
            patient=patient
        )

        total_payments = (
            payments.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        paid_payments = (
            payments.filter(
                payment_status="Paid"
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        pending_payments = (
            payments.filter(
                payment_status="Pending"
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # ======================================================
        # REPORTS
        # ======================================================

        total_reports = MedicalReport.objects.filter(
            patient=patient
        ).count()

        # ======================================================
        # FAMILY MEMBERS
        # ======================================================

        family_members = FamilyMember.objects.filter(
            patient=patient
        ).count()

        # ======================================================
        # NOTIFICATIONS
        # ======================================================

        notifications = Notification.objects.filter(
            user=user
        ).order_by(
            "-created_at"
        )

        total_notifications = notifications.count()

        unread_notifications = notifications.filter(
            is_read=False
        ).count()

        # ======================================================
        # UPCOMING APPOINTMENT
        # ======================================================

        today = timezone.now().date()

        upcoming = (
            appointments
            .filter(
                appointment_date__gte=today,
                status__in=[
                    "Pending",
                    "Confirmed",
                ],
            )
            .select_related(
                "doctor",
                "doctor__user",
                "doctor__department",
                "slot",
            )
            .order_by(
                "appointment_date",
                "slot__slot_time",
            )
            .first()
        )

        upcoming_appointment = None

        if upcoming:

            upcoming_appointment = {
                "id": upcoming.id,
                "booking_number": upcoming.booking_number,
                "doctor_name": (
                    f"Dr. {upcoming.doctor.user.get_full_name()}"
                ),
                "department": (
                    upcoming.doctor.department.name
                    if upcoming.doctor.department
                    else None
                ),
                "appointment_date": upcoming.appointment_date,
                "slot_time": upcoming.slot.slot_time,
                "status": upcoming.status,
            }

        # ======================================================
        # RECENT APPOINTMENTS
        # ======================================================

        recent_appointments = []

        recent = (
            appointments
            .select_related(
                "doctor",
                "doctor__user",
                "slot",
            )
            .order_by(
                "-appointment_date",
                "-created_at",
            )[:5]
        )

        for appointment in recent:

            recent_appointments.append(
                {
                    "id": appointment.id,
                    "booking_number": appointment.booking_number,
                    "doctor_name": (
                        f"Dr. {appointment.doctor.user.get_full_name()}"
                    ),
                    "appointment_date": appointment.appointment_date,
                    "slot_time": appointment.slot.slot_time,
                    "status": appointment.status,
                }
            )

        # ======================================================
        # RECENT DIAGNOSTIC BOOKINGS
        # ======================================================

        recent_diagnostic_bookings = []

        recent_diagnostics = (
            diagnostic_bookings
            .select_related(
                "diagnostic_test",
                "diagnostic_test__category",
                "family_member",
            )
            .order_by(
                "-booking_date",
                "-booking_time",
                "-created_at",
            )[:10]
        )

        for booking in recent_diagnostics:

            recent_diagnostic_bookings.append(
                {
                    "id": booking.id,
                    "booking_number": booking.booking_number,
                    "test_name": (
                        booking.diagnostic_test.name
                        if booking.diagnostic_test
                        else None
                    ),
                    "category_name": (
                        booking.diagnostic_test.category.name
                        if (
                            booking.diagnostic_test
                            and booking.diagnostic_test.category
                        )
                        else None
                    ),
                    "booking_date": booking.booking_date,
                    "booking_time": booking.booking_time,
                    "status": booking.status,
                    "family_member_name": (
                        booking.family_member.name
                        if booking.family_member
                        else "Self"
                    ),
                }
            )

        # ======================================================
        # RECENT PAYMENTS
        # ======================================================

        recent_payments = []

        for payment in payments.order_by(
            "-payment_date"
        )[:5]:

            recent_payments.append(
                {
                    "id": payment.id,
                    "amount": payment.amount,
                    "payment_method": payment.payment_method,
                    "transaction_id": payment.transaction_id,
                    "payment_status": payment.payment_status,
                    "payment_date": payment.payment_date,
                }
            )

        # ======================================================
        # RECENT NOTIFICATIONS
        # ======================================================

        recent_notifications = []

        for notification in notifications[:5]:

            recent_notifications.append(
                {
                    "id": notification.id,
                    "notification_type": notification.notification_type,
                    "title": notification.title,
                    "message": notification.message,
                    "is_read": notification.is_read,
                    "created_at": notification.created_at,
                }
            )

        # ======================================================
        # DATA
        # ======================================================

        data = {
            "total_appointments": total_appointments,
            "pending_appointments": pending_appointments,
            "confirmed_appointments": confirmed_appointments,
            "completed_appointments": completed_appointments,
            "cancelled_appointments": cancelled_appointments,

            "total_diagnostic_bookings": total_diagnostic_bookings,
            "pending_diagnostic_bookings": pending_diagnostic_bookings,
            "confirmed_diagnostic_bookings": confirmed_diagnostic_bookings,
            "completed_diagnostic_bookings": completed_diagnostic_bookings,
            "cancelled_diagnostic_bookings": cancelled_diagnostic_bookings,

            "total_payments": total_payments,
            "paid_payments": paid_payments,
            "pending_payments": pending_payments,

            "total_reports": total_reports,
            "family_members": family_members,

            "total_notifications": total_notifications,
            "unread_notifications": unread_notifications,

            "upcoming_appointment": upcoming_appointment,
            "recent_appointments": recent_appointments,
            "recent_diagnostic_bookings": recent_diagnostic_bookings,
            "recent_payments": recent_payments,
            "recent_notifications": recent_notifications,
        }

        serializer = DashboardSerializer(data)

        return Response(
            {
                "success": True,
                "role": "patient",
                "data": serializer.data,
            }
        )

    # ==========================================================
    # DOCTOR DASHBOARD
    # ==========================================================

    def doctor_dashboard(self, request):

        user = request.user

        if not hasattr(user, "doctor_profile"):

            return Response(
                {
                    "success": False,
                    "message": "Doctor profile not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        doctor = user.doctor_profile

        appointments = Appointment.objects.filter(
            doctor=doctor
        )

        total_appointments = appointments.count()

        pending_appointments = appointments.filter(
            status="Pending"
        ).count()

        confirmed_appointments = appointments.filter(
            status="Confirmed"
        ).count()

        completed_appointments = appointments.filter(
            status="Completed"
        ).count()

        cancelled_appointments = appointments.filter(
            status="Cancelled"
        ).count()

        today = timezone.now().date()

        # ======================================================
        # TODAY
        # ======================================================

        today_appointments = []

        today_list = (
            appointments
            .filter(
                appointment_date=today,
                status__in=[
                    "Pending",
                    "Confirmed",
                ],
            )
            .select_related(
                "patient",
                "patient__user",
                "family_member",
                "slot",
            )
            .order_by(
                "slot__slot_time"
            )
        )

        for appointment in today_list:

            if appointment.family_member:

                patient_name = (
                    appointment.family_member.name
                )

            else:

                patient_name = (
                    appointment.patient.user.get_full_name()
                )

            today_appointments.append(
                {
                    "id": appointment.id,
                    "booking_number": appointment.booking_number,
                    "patient_name": patient_name,
                    "appointment_date": appointment.appointment_date,
                    "slot_time": appointment.slot.slot_time,
                    "status": appointment.status,
                    "reason": appointment.reason,
                }
            )

        # ======================================================
        # UPCOMING
        # ======================================================

        upcoming_appointments = []

        upcoming = (
            appointments
            .filter(
                appointment_date__gte=today,
                status__in=[
                    "Pending",
                    "Confirmed",
                ],
            )
            .select_related(
                "patient",
                "patient__user",
                "family_member",
                "slot",
            )
            .order_by(
                "appointment_date",
                "slot__slot_time",
            )[:5]
        )

        for appointment in upcoming:

            if appointment.family_member:

                patient_name = (
                    appointment.family_member.name
                )

            else:

                patient_name = (
                    appointment.patient.user.get_full_name()
                )

            upcoming_appointments.append(
                {
                    "id": appointment.id,
                    "booking_number": appointment.booking_number,
                    "patient_name": patient_name,
                    "appointment_date": appointment.appointment_date,
                    "slot_time": appointment.slot.slot_time,
                    "status": appointment.status,
                }
            )

        # ======================================================
        # DATA
        # ======================================================

        data = {
            "total_appointments": total_appointments,
            "pending_appointments": pending_appointments,
            "confirmed_appointments": confirmed_appointments,
            "completed_appointments": completed_appointments,
            "cancelled_appointments": cancelled_appointments,
            "today_appointments": today_appointments,
            "upcoming_appointments": upcoming_appointments,
        }

        serializer = DashboardSerializer(data)

        return Response(
            {
                "success": True,
                "role": "doctor",
                "data": serializer.data,
            }
        )

    # ==========================================================
    # RECEPTIONIST DASHBOARD
    # ==========================================================

    def receptionist_dashboard(self, request):

        appointments = Appointment.objects.all()

        total_appointments = appointments.count()

        pending_appointments = appointments.filter(
            status="Pending"
        ).count()

        confirmed_appointments = appointments.filter(
            status="Confirmed"
        ).count()

        completed_appointments = appointments.filter(
            status="Completed"
        ).count()

        cancelled_appointments = appointments.filter(
            status="Cancelled"
        ).count()

        data = {
            "total_patients": PatientProfile.objects.count(),
            "total_doctors": Doctor.objects.count(),

            "total_appointments": total_appointments,
            "pending_appointments": pending_appointments,
            "confirmed_appointments": confirmed_appointments,
            "completed_appointments": completed_appointments,
            "cancelled_appointments": cancelled_appointments,
        }

        serializer = DashboardSerializer(data)

        return Response(
            {
                "success": True,
                "role": "receptionist",
                "data": serializer.data,
            }
        )