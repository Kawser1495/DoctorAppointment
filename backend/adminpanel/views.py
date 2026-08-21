from decimal import Decimal

from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from accounts.models import CustomUser
from patients.models import PatientProfile
from doctors.models import Doctor
from appointments.models import Appointment
from diagnostics.models import (
    TestCategory,
    DiagnosticTest,
    TestBooking,
)
from payments.models import Payment
from reports.models import MedicalReport
from notifications.models import Notification

from .permissions import IsAdminUserRole
from .serializers import AdminDashboardSerializer


# ==========================================================
# Admin Dashboard
# GET: /api/admin/dashboard/
# ==========================================================

class AdminDashboardAPIView(APIView):

    permission_classes = [
        IsAdminUserRole
    ]

    def get(self, request):

        # ==================================================
        # Users
        # ==================================================

        total_patients = PatientProfile.objects.count()

        total_doctors = Doctor.objects.count()

        total_receptionists = CustomUser.objects.filter(
            role="receptionist"
        ).count()

        total_users = CustomUser.objects.count()

        # ==================================================
        # Appointments
        # ==================================================

        total_appointments = Appointment.objects.count()

        pending_appointments = Appointment.objects.filter(
            status="Pending"
        ).count()

        confirmed_appointments = Appointment.objects.filter(
            status="Confirmed"
        ).count()

        completed_appointments = Appointment.objects.filter(
            status="Completed"
        ).count()

        cancelled_appointments = Appointment.objects.filter(
            status="Cancelled"
        ).count()

        rejected_appointments = Appointment.objects.filter(
            status="Rejected"
        ).count()

        no_show_appointments = Appointment.objects.filter(
            status="No Show"
        ).count()

        # ==================================================
        # Diagnostic Tests
        # ==================================================

        total_test_categories = TestCategory.objects.count()

        total_diagnostic_tests = DiagnosticTest.objects.count()

        total_test_bookings = TestBooking.objects.count()

        pending_test_bookings = TestBooking.objects.filter(
            status="Pending"
        ).count()

        confirmed_test_bookings = TestBooking.objects.filter(
            status="Confirmed"
        ).count()

        completed_test_bookings = TestBooking.objects.filter(
            status="Completed"
        ).count()

        cancelled_test_bookings = TestBooking.objects.filter(
            status="Cancelled"
        ).count()

        # ==================================================
        # Payments
        # ==================================================

        total_payments = Payment.objects.count()

        paid_payments = Payment.objects.filter(
            payment_status="Paid"
        ).count()

        pending_payments = Payment.objects.filter(
            payment_status="Pending"
        ).count()

        failed_payments = Payment.objects.filter(
            payment_status="Failed"
        ).count()

        refunded_payments = Payment.objects.filter(
            payment_status="Refunded"
        ).count()

        # Only successful payments count as revenue

        total_revenue = (
            Payment.objects.filter(
                payment_status="Paid"
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # ==================================================
        # Medical Reports
        # ==================================================

        total_reports = MedicalReport.objects.count()

        # ==================================================
        # Notifications
        # ==================================================

        total_notifications = Notification.objects.count()

        unread_notifications = Notification.objects.filter(
            is_read=False
        ).count()

        # ==================================================
        # Response Data
        # ==================================================

        data = {

            # Users

            "total_patients":
            total_patients,

            "total_doctors":
            total_doctors,

            "total_receptionists":
            total_receptionists,

            "total_users":
            total_users,

            # Appointments

            "total_appointments":
            total_appointments,

            "pending_appointments":
            pending_appointments,

            "confirmed_appointments":
            confirmed_appointments,

            "completed_appointments":
            completed_appointments,

            "cancelled_appointments":
            cancelled_appointments,

            "rejected_appointments":
            rejected_appointments,

            "no_show_appointments":
            no_show_appointments,

            # Diagnostic

            "total_test_categories":
            total_test_categories,

            "total_diagnostic_tests":
            total_diagnostic_tests,

            "total_test_bookings":
            total_test_bookings,

            "pending_test_bookings":
            pending_test_bookings,

            "confirmed_test_bookings":
            confirmed_test_bookings,

            "completed_test_bookings":
            completed_test_bookings,

            "cancelled_test_bookings":
            cancelled_test_bookings,

            # Payments

            "total_payments":
            total_payments,

            "paid_payments":
            paid_payments,

            "pending_payments":
            pending_payments,

            "failed_payments":
            failed_payments,

            "refunded_payments":
            refunded_payments,

            "total_revenue":
            total_revenue,

            # Reports

            "total_reports":
            total_reports,

            # Notifications

            "total_notifications":
            total_notifications,

            "unread_notifications":
            unread_notifications,
        }

        serializer = AdminDashboardSerializer(data)

        return Response(
            {
                "success": True,
                "message": "Admin dashboard data retrieved successfully.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )
