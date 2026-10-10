from datetime import timedelta
from decimal import Decimal
from calendar import monthrange

from django.db.models import Case, Count, ExpressionWrapper, F, IntegerField, Q, Sum, Value, When
from django.utils import timezone

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
from accounts.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated

from doctors.models import Doctor, Department
from patients.models import PatientProfile, FamilyMember
from appointments.models import Appointment
from reports.models import MedicalReport
from payments.models import Payment
from diagnostics.models import DiagnosticTest, TestBooking
from notifications.models import Notification

from .serializers import (
    DashboardSerializer,
    AdminDashboardSerializer,
)


def ensure_receptionist_notification(title, message, notification_type="General"):
    """Create one notification for each active receptionist per state change."""
    recipients = CustomUser.objects.filter(
        role="receptionist",
        is_active=True,
    )
    for recipient in recipients:
        if not Notification.objects.filter(
            user=recipient,
            title=title,
            message=message,
        ).exists():
            Notification.objects.create(
                user=recipient,
                notification_type=notification_type,
                title=title,
                message=message,
            )


class AdminAnalyticsAPIView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):
        appointments = Appointment.objects.all()
        payments = Payment.objects.all()
        bookings = TestBooking.objects.all()
        diagnostic_status_order = ["Pending", "Confirmed", "Completed", "Cancelled"]

        appointment_status = list(
            appointments.values("status")
            .annotate(total=Count("id"))
            .order_by("status")
        )

        doctor_status = list(
            Doctor.objects.values("approval_status")
            .annotate(total=Count("id"))
            .order_by("approval_status")
        )

        doctor_by_department = list(
            Doctor.objects.values("department__name")
            .annotate(total=Count("id"))
            .order_by("department__name")
        )

        top_doctors = list(
            Doctor.objects.filter(approval_status="approved")
            .select_related("user", "department")
            .annotate(
                appointment_count=Count("appointments", distinct=True),
                refunded_appointment_count=Count(
                    "appointments",
                    filter=Q(appointments__payments__payment_status="Refunded"),
                    distinct=True,
                ),
            )
            .annotate(
                visible_appointment_count=ExpressionWrapper(
                    F("appointment_count") - F("refunded_appointment_count"),
                    output_field=IntegerField(),
                ),
            )
            .order_by("-visible_appointment_count", "user__first_name")
        )

        collected_revenue = Decimal("0.00")
        collected_by_mode = {
            "Full": Decimal("0.00"),
            "Partial": Decimal("0.00"),
        }
        for payment in payments.only(
            "amount", "payment_mode", "payment_status", "refunded_amount", "refund_retained_amount"
        ):
            if payment.payment_status in ["Paid", "Partially Paid"]:
                collected_revenue += payment.amount
                collected_by_mode[payment.payment_mode] += payment.amount
            elif payment.payment_status == "Refunded":
                retained_amount = payment.refund_breakdown[1]
                collected_revenue += retained_amount
                collected_by_mode[payment.payment_mode] += retained_amount

        return Response({
            "appointment_analytics": {
                "total": appointments.filter(
                    status__in=["Pending", "Confirmed"],
                ).count(),
                "by_status": appointment_status,
            },
            "doctor_statistics": {
                "total": Doctor.objects.count(),
                "by_status": doctor_status + [
                    {
                        "department": item["department__name"] or "Unassigned",
                        "total": item["total"],
                    }
                    for item in doctor_by_department
                ],
                "top_doctors": [
                    {
                        "name": str(doctor),
                        "department": doctor.department.name if doctor.department else "Unassigned",
                        "appointments": doctor.visible_appointment_count,
                    }
                    for doctor in top_doctors
                ],
            },
            "patient_statistics": {
                "total": PatientProfile.objects.count(),
                "active_accounts": PatientProfile.objects.filter(
                    user__is_active=True,
                ).count(),
                "by_gender": list(
                    PatientProfile.objects.annotate(
                        normalized_gender=Case(
                            When(gender__isnull=True, then=Value("Other")),
                            When(gender="", then=Value("Other")),
                            default="gender",
                        )
                    ).values("normalized_gender")
                    .annotate(total=Count("id"))
                    .order_by("normalized_gender")
                ),
            },
            "revenue_analytics": {
                "collected": collected_revenue,
                "pending": payments.filter(
                    payment_status="Pending",
                ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00"),
                "refunded": payments.filter(
                    payment_status="Refunded",
                ).aggregate(total=Sum("refunded_amount"))["total"] or Decimal("0.00"),
                "by_mode": [
                    {"payment_mode": mode, "total": total}
                    for mode, total in collected_by_mode.items()
                ],
            },
            "diagnostic_statistics": {
                "total_bookings": bookings.count(),
                "by_status": list(
                    {
                        "status": booking_status,
                        "total": bookings.filter(status=booking_status).count(),
                    }
                    for booking_status in diagnostic_status_order
                ),
                "available_tests": DiagnosticTest.objects.filter(
                    is_available=True,
                    category__is_active=True,
                ).count(),
            },
        }, status=status.HTTP_200_OK)


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
        Admin dashboard.

        Provides system-wide statistics for the
        authenticated administrator.
        """

        # ======================================================
        # SECURITY CHECK
        # ======================================================

        user = request.user

        if user.role != "admin" and not user.is_superuser:

            return Response(
                {
                    "success": False,
                    "message": "Admin access required.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ======================================================
        # CURRENT DATE
        # ======================================================

        today = timezone.localdate()
        month_end = today.replace(day=monthrange(today.year, today.month)[1])

        # ======================================================
        # PATIENTS
        # ======================================================

        total_patients = (
            PatientProfile.objects.count()
        )

        # ======================================================
        # DOCTORS
        # ======================================================

        total_doctors = (
            Doctor.objects.count()
        )

        pending_doctor_requests = (
            Doctor.objects
            .filter(
                approval_status__iexact="pending"
            )
            .count()
        )

        approved_doctors = (
            Doctor.objects
            .filter(
                approval_status__iexact="approved"
            )
            .count()
        )

        # ======================================================
        # APPOINTMENTS
        # ======================================================

        appointments = Appointment.objects.all()

        total_appointments = (
            appointments
            .filter(status__in=["Pending", "Confirmed"])
            .count()
        )

        today_appointments = (
            appointments
            .filter(
                appointment_date=today,
                status__in=["Pending", "Confirmed"],
            )
            .count()
        )

        upcoming_appointments_by_doctor = list(
            Doctor.objects
            .select_related("user")
            .annotate(
                upcoming_appointment_count=Count(
                    "appointments",
                    filter=Q(
                        appointments__appointment_date__gt=today,
                        appointments__appointment_date__lte=month_end,
                        appointments__status__in=["Pending", "Confirmed"],
                    ),
                )
            )
            .values(
                "id",
                "user__first_name",
                "user__last_name",
                "user__username",
                "upcoming_appointment_count",
            )
            .order_by("user__first_name", "user__last_name", "user__username")
        )

        upcoming_appointments = (
            appointments
            .filter(
                appointment_date__gt=today,
                appointment_date__lte=month_end,
                status__in=["Pending", "Confirmed"],
            )
            .count()
        )

        doctor_overview = []
        for doctor in Doctor.objects.select_related("user", "department").order_by(
            "user__first_name", "user__last_name", "user__username"
        ):
            doctor_appointments = appointments.filter(doctor_id=doctor.id)
            doctor_payment_total = (
                Payment.objects
                .filter(
                    appointment__doctor_id=doctor.id,
                    payment_status__in=["Paid", "Partially Paid"],
                )
                .aggregate(total=Sum("amount"))["total"]
                or Decimal("0.00")
            )
            doctor_overview.append({
                "id": doctor.id,
                "user__first_name": doctor.user.first_name,
                "user__last_name": doctor.user.last_name,
                "user__username": doctor.user.username,
                "department__name": doctor.department.name if doctor.department else None,
                "appointment_count": doctor_appointments.filter(
                    status__in=["Pending", "Confirmed"],
                ).count(),
                "today_appointment_count": doctor_appointments.filter(
                    appointment_date=today,
                    status__in=["Pending", "Confirmed"],
                ).count(),
                "upcoming_appointment_count": doctor_appointments.filter(
                    appointment_date__gt=today,
                    appointment_date__lte=month_end,
                    status__in=["Pending", "Confirmed"],
                ).count(),
                "appointment_payment_total": doctor_payment_total,
            })

        diagnostic_status_totals = {
            "total": TestBooking.objects.exclude(status="Cancelled").count(),
            "pending": TestBooking.objects.filter(status="Pending").count(),
            "confirmed": TestBooking.objects.filter(status="Confirmed").count(),
            "completed": TestBooking.objects.filter(status="Completed").count(),
            "cancelled": TestBooking.objects.filter(status="Cancelled").count(),
        }

        diagnostic_booking_history = [
            {
                "id": booking.id,
                "booking_number": booking.booking_number,
                "patient_name": booking.patient.user.get_full_name() or booking.patient.user.username,
                "booking_person_name": booking.family_member.name if booking.family_member else booking.patient.user.get_full_name() or booking.patient.user.username,
                "family_member_name": booking.family_member.name if booking.family_member else None,
                "test_name": booking.diagnostic_test.name,
                "category_name": booking.diagnostic_test.category.name,
                "booking_date": booking.booking_date.isoformat(),
                "booking_time": booking.booking_time.isoformat(),
                "status": booking.status,
            }
            for booking in TestBooking.objects
            .filter(status__in=["Pending", "Confirmed", "Completed"])
            .select_related("patient__user", "family_member", "diagnostic_test__category")
            .order_by("-booking_date", "-booking_time")
        ]

        # ======================================================
        # APPOINTMENT STATUS
        # ======================================================

        pending_appointments = (
            appointments
            .filter(
                status__iexact="Pending"
            )
            .count()
        )

        confirmed_appointments = (
            appointments
            .filter(
                status__iexact="Confirmed"
            )
            .count()
        )

        completed_appointments = (
            appointments
            .filter(
                status__iexact="Completed"
            )
            .count()
        )

        cancelled_appointments = (
            appointments
            .filter(
                status__iexact="Cancelled"
            )
            .count()
        )

        # ======================================================
        # PAYMENTS
        # ======================================================

        payments = Payment.objects.all()

        payment_history = []
        for payment in payments.select_related(
            "patient__user",
            "appointment__doctor__user",
            "test_booking",
        ).order_by("-payment_date"):
            payment_history.append({
                "id": payment.id,
                "patient_name": payment.patient.user.get_full_name() or payment.patient.user.username,
                "payment_type": payment.payment_type,
                "booking_number": (
                    payment.appointment.booking_number
                    if payment.appointment
                    else payment.test_booking.booking_number
                    if payment.test_booking
                    else None
                ),
                "doctor_name": (
                    payment.appointment.doctor.user.get_full_name()
                    or payment.appointment.doctor.user.username
                    if payment.appointment
                    else None
                ),
                "amount": str(payment.amount),
                "net_amount": str(
                    payment.refund_breakdown[1]
                    if payment.payment_status == "Refunded"
                    else payment.amount
                ),
                "payment_method": payment.payment_method,
                "transaction_id": payment.transaction_id,
                "payment_status": payment.payment_status,
                "payment_date": payment.payment_date.isoformat() if payment.payment_date else None,
            })

        total_revenue = Decimal("0.00")
        source_payment_amounts = {
            "appointment": Decimal("0.00"),
            "diagnostic": Decimal("0.00"),
        }
        for payment in payments.only(
            "amount",
            "payment_status",
            "refunded_amount",
            "refund_retained_amount",
            "appointment_id",
            "test_booking_id",
        ):
            if payment.payment_status not in ["Paid", "Partially Paid", "Refunded"]:
                continue
            amount = payment.amount
            if payment.payment_status == "Refunded":
                amount = payment.refund_breakdown[1]
            total_revenue += amount
            source = "appointment" if payment.appointment_id else "diagnostic" if payment.test_booking_id else None
            if source:
                source_payment_amounts[source] += amount

        successful_payment_statuses = ["Paid", "Partially Paid", "Refunded"]
        appointment_payment_queryset = payments.filter(
            appointment__isnull=False,
            payment_status__in=successful_payment_statuses,
        )
        diagnostic_payment_queryset = payments.filter(
            test_booking__isnull=False,
            payment_status__in=successful_payment_statuses,
        )
        payment_summary = {
            "total": payments.exclude(payment_status__in=["Cancelled", "Failed"]).count(),
            "all_records": payments.count(),
            "paid": payments.filter(payment_status="Paid").count(),
            "pending": payments.filter(payment_status="Pending").count(),
            "refunded": payments.filter(payment_status="Refunded").count(),
            "cancelled": payments.filter(payment_status="Cancelled").count(),
            "refundable": payments.filter(
                payment_status="Paid",
                payment_mode="Full",
                is_refundable=True,
                payment_date__gte=timezone.now() - timedelta(hours=24),
            ).count(),
            "appointment_count": appointment_payment_queryset.count(),
            "appointment_amount": source_payment_amounts["appointment"],
            "diagnostic_count": diagnostic_payment_queryset.count(),
            "diagnostic_amount": source_payment_amounts["diagnostic"],
        }

        pending_payments = (
            payments
            .filter(
                payment_status__iexact="Pending"
            )
            .count()
        )

        paid_payments = payments.filter(
            payment_status__iexact="Paid"
        ).count()
        refundable_payments = payments.filter(
            payment_status__iexact="Paid",
            payment_mode="Full",
            is_refundable=True,
            payment_date__gte=timezone.now() - timedelta(hours=24),
        ).count()

        # ======================================================
        # DIAGNOSTIC BOOKINGS
        # ======================================================

        total_diagnostic_bookings = DiagnosticTest.objects.filter(
            is_available=True,
            category__is_active=True,
        ).count()

        # ======================================================
        # MEDICAL REPORTS
        # ======================================================

        total_medical_reports = (
            MedicalReport.objects.count()
        )

        # ======================================================
        # NOTIFICATIONS
        # ======================================================

        total_notifications = (
            Notification.objects.filter(user=request.user).count()
        )

        unread_notifications = (
            Notification.objects
            .filter(
                user=request.user,
                is_read=False
            )
            .count()
        )

        # ======================================================
        # ADMIN DASHBOARD DATA
        # ======================================================

        data = {

            "total_patients": total_patients,

            "total_doctors": total_doctors,

            "pending_doctor_requests": (
                pending_doctor_requests
            ),

            "approved_doctors": (
                approved_doctors
            ),

            "total_appointments": (
                total_appointments
            ),

            "today_appointments": (
                today_appointments
            ),

            "upcoming_appointments_by_doctor": (
                upcoming_appointments_by_doctor
            ),

            "upcoming_appointments": (
                upcoming_appointments
            ),

            "doctor_overview": (
                doctor_overview
            ),

            "total_revenue": (
                total_revenue
            ),

            "payment_history": (
                payment_history
            ),

            "payment_summary": (
                payment_summary
            ),

            "pending_payments": (
                pending_payments
            ),

            "paid_payments": (
                paid_payments
            ),

            "refundable_payments": (
                refundable_payments
            ),

            "total_diagnostic_bookings": (
                total_diagnostic_bookings
            ),

            "diagnostic_status_totals": (
                diagnostic_status_totals
            ),

            "diagnostic_booking_history": (
                diagnostic_booking_history
            ),

            "total_medical_reports": (
                total_medical_reports
            ),

            "total_notifications": (
                total_notifications
            ),

            "unread_notifications": (
                unread_notifications
            ),

            "pending_appointments": (
                pending_appointments
            ),

            "confirmed_appointments": (
                confirmed_appointments
            ),

            "completed_appointments": (
                completed_appointments
            ),

            "cancelled_appointments": (
                cancelled_appointments
            ),

        }


        # ======================================================
        # SERIALIZE
        # ======================================================

        serializer = AdminDashboardSerializer(
            data=data
        )

        serializer.is_valid(
            raise_exception=True
        )

        # ======================================================
        # RESPONSE
        # ======================================================

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
            patient=patient,
        ).exclude(
            status="Cancelled",
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

        cancelled_appointments = Appointment.objects.filter(
            patient=patient,
            status="Cancelled",
        ).count()

        # ======================================================
        # DIAGNOSTICS
        # ======================================================

        diagnostic_bookings = TestBooking.objects.filter(
            patient=patient
        )

        total_diagnostic_bookings = diagnostic_bookings.exclude(
            status="Cancelled"
        ).count()

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
            patient=patient,
            payment_status__in=["Pending", "Paid", "Partially Paid", "Refunded"],
        )

        payment_totals = payments.aggregate(
            gross=Sum("amount"),
            refunded=Sum("refunded_amount"),
        )
        total_payments = (
            (payment_totals["gross"] or Decimal("0.00"))
            - (payment_totals["refunded"] or Decimal("0.00"))
        )

        paid_payments = (
            payments.filter(
                payment_status__in=["Paid", "Partially Paid"]
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
            doctor=doctor,
        ).exclude(
            payments__payment_status="Refunded",
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
                    "family_member_name": appointment.family_member.name if appointment.family_member else None,
                    "doctor_name": appointment.doctor.user.get_full_name().strip() or appointment.doctor.user.username,
                    "department_name": appointment.doctor.department.name if appointment.doctor.department else "Unassigned",
                    "appointment_date": appointment.appointment_date,
                    "slot_time": appointment.slot.slot_time,
                    "time_range": appointment.slot.time_range,
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
        today = timezone.localdate()
        appointments = Appointment.objects.select_related(
            "patient__user",
            "doctor__user",
            "doctor__department",
            "family_member",
            "slot",
        ).all()

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

        today_appointment_queryset = appointments.filter(
            appointment_date=today,
        ).exclude(status="Cancelled")
        today_appointment_count = today_appointment_queryset.count()
        today_pending_appointment_count = today_appointment_queryset.filter(
            status="Pending",
        ).count()
        today_appointments = today_appointment_queryset.order_by(
            "slot__slot_time", "id"
        )[:20]
        upcoming_appointments = appointments.filter(
            appointment_date__gt=today,
        ).exclude(status="Cancelled").order_by("appointment_date", "slot__slot_time", "id")[:10]
        diagnostic_bookings = TestBooking.objects.filter(
            booking_date=today,
        ).exclude(status="Cancelled")
        pending_payment_total = Payment.objects.filter(
            payment_status="Pending",
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        pending_payment_count = Payment.objects.filter(
            payment_status__iexact="Pending",
        ).count()
        receptionist_patients = PatientProfile.objects.select_related("user").order_by(
            "user__first_name", "user__last_name"
        )

        def appointment_row(appointment):
            return {
                "id": appointment.id,
                "booking_number": appointment.booking_number,
                "patient_name": appointment.patient.user.get_full_name() or appointment.patient.user.username,
                "patient_phone": appointment.patient.user.phone or "Not provided",
                "family_member": appointment.family_member.name if appointment.family_member else "Self",
                "doctor_name": appointment.doctor.user.get_full_name() or appointment.doctor.user.username,
                "department": appointment.doctor.department.name if appointment.doctor.department else "General",
                "appointment_date": appointment.appointment_date,
                "slot_time": appointment.slot.slot_time,
                "status": appointment.status,
                "payment_status": getattr(appointment, "payment_status", "Unpaid"),
            }

        patient_rows = [{
            "id": patient.id,
            "name": patient.user.get_full_name() or patient.user.username,
            "phone": patient.user.phone or "Not provided",
            "email": patient.user.email,
        } for patient in receptionist_patients]

        receptionist_doctors = Doctor.objects.select_related("user", "department").order_by(
            "user__first_name", "user__last_name", "user__username"
        )
        doctor_rows = [{
            "id": doctor.id,
            "name": doctor.user.get_full_name() or doctor.user.username,
            "phone": doctor.user.phone or "Not provided",
            "email": doctor.user.email,
            "department": doctor.department.name if doctor.department else "General",
            "specialization": doctor.specialization or "General practice",
            "status": doctor.approval_status,
        } for doctor in receptionist_doctors]

        upcoming_appointment_count = appointments.filter(
            appointment_date__gt=today,
            status__in=["Pending", "Confirmed"],
        ).count()
        payment_records = Payment.objects.select_related(
            "patient__user",
            "appointment",
            "test_booking",
        ).all()
        appointment_overview = {
            "pending": pending_appointments,
            "confirmed": confirmed_appointments,
            "completed": completed_appointments,
            "cancelled": cancelled_appointments,
        }
        payment_overview = {
            "all": payment_records.exclude(payment_status__in=["Cancelled", "Failed"]).count(),
            "paid": payment_records.filter(payment_status="Paid").count(),
            "pending": payment_records.filter(payment_status="Pending").count(),
            "refunded": payment_records.filter(payment_status="Refunded").count(),
        }
        total_revenue = Decimal("0.00")
        for payment in Payment.objects.only(
            "amount",
            "payment_status",
            "refunded_amount",
            "refund_retained_amount",
        ):
            if payment.payment_status not in ["Paid", "Partially Paid", "Refunded"]:
                continue
            total_revenue += (
                payment.refund_breakdown[1]
                if payment.payment_status == "Refunded"
                else payment.amount
            )
        payment_history_count = payment_overview["all"]
        payment_history_records = []
        pending_payment_records = []
        for payment in payment_records.exclude(
            payment_status__in=["Cancelled", "Failed"],
        ).order_by("-payment_date"):
            payment_row = {
                "id": payment.id,
                "patient_name": payment.patient.user.get_full_name() or payment.patient.user.username,
                "booking_number": (
                    payment.appointment.booking_number
                    if payment.appointment
                    else payment.test_booking.booking_number
                    if payment.test_booking
                    else "N/A"
                ),
                "amount": str(payment.amount),
                "payment_status": payment.payment_status,
                "payment_date": payment.payment_date,
            }
            payment_history_records.append(payment_row)
            if payment.payment_status == "Pending":
                pending_payment_records.append(payment_row)
        serial_counters = {}
        receptionist_appointment_serials = []
        serial_appointments = appointments.filter(
            appointment_date=today,
        ).exclude(
            status="Cancelled",
        ).order_by(
            "appointment_date",
            "doctor_id",
            "slot__slot_time",
            "created_at",
            "id",
        )
        for appointment in serial_appointments:
            serial_key = (appointment.doctor_id, appointment.appointment_date)
            serial_counters[serial_key] = serial_counters.get(serial_key, 0) + 1
            receptionist_appointment_serials.append({
                "id": appointment.id,
                "patient_name": appointment.family_member.name if appointment.family_member else appointment.patient.user.get_full_name() or appointment.patient.user.username,
                "doctor_name": appointment.doctor.user.get_full_name() or appointment.doctor.user.username,
                "booking_number": appointment.booking_number,
                "appointment_date": appointment.appointment_date,
                "slot_time": appointment.slot.slot_time,
                "status": appointment.status,
                "serial_number": serial_counters[serial_key],
            })
        if today_appointment_count:
            ensure_receptionist_notification(
                "Today's appointments",
                f"{today_appointment_count} appointment(s) are scheduled for today.",
                "Appointment",
            )
        if today_pending_appointment_count:
            ensure_receptionist_notification(
                "Waiting confirmation",
                f"{today_pending_appointment_count} appointment(s) are waiting for confirmation.",
                "Appointment",
            )
        if diagnostic_bookings.exists():
            ensure_receptionist_notification(
                "Diagnostic bookings today",
                f"{diagnostic_bookings.count()} diagnostic booking(s) are scheduled for today.",
                "Diagnostic",
            )
        ensure_receptionist_notification(
            "Patient directory updated",
            f"Patient directory currently has {PatientProfile.objects.count()} patient(s).",
            "General",
        )
        ensure_receptionist_notification(
            "Doctor directory updated",
            f"Doctor directory currently has {Doctor.objects.count()} doctor(s).",
            "General",
        )
        if pending_payment_count:
            ensure_receptionist_notification(
                "Pending payment added",
                f"{pending_payment_count} pending payment(s) totaling BDT {pending_payment_total} need review.",
                "Payment",
            )
        if upcoming_appointment_count:
            ensure_receptionist_notification(
                "Upcoming appointment added",
                f"{upcoming_appointment_count} upcoming appointment(s) are on the queue.",
                "Appointment",
            )

        data = {
            "total_patients": PatientProfile.objects.count(),
            "total_doctors": Doctor.objects.count(),

            "total_appointments": total_appointments,
            "pending_appointments": pending_appointments,
            "confirmed_appointments": confirmed_appointments,
            "completed_appointments": completed_appointments,
            "cancelled_appointments": cancelled_appointments,
            "today_appointments": [appointment_row(item) for item in today_appointments],
            "upcoming_appointments": [appointment_row(item) for item in upcoming_appointments],
            "receptionist_patients": patient_rows,
            "receptionist_doctors": doctor_rows,
            "pending_payment_total": pending_payment_total,
            "pending_payment_count": pending_payment_count,
            "today_diagnostic_bookings": diagnostic_bookings.count(),
            "today_appointment_count": today_appointment_count,
            "today_pending_appointment_count": today_pending_appointment_count,
            "appointment_overview": appointment_overview,
            "payment_overview": payment_overview,
            "total_revenue": total_revenue,
            "payment_history_count": payment_history_count,
            "payment_history_records": payment_history_records,
            "pending_payment_records": pending_payment_records,
            "receptionist_appointment_serials": receptionist_appointment_serials,
            "unread_notifications": Notification.objects.filter(
                user=request.user,
                is_read=False,
            ).count(),
        }

        serializer = DashboardSerializer(data)

        return Response(
            {
                "success": True,
                "role": "receptionist",
                "data": serializer.data,
            }
        )
