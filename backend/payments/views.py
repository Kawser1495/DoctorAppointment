from django.db import (
    IntegrityError,
    transaction,
)
from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from decimal import Decimal
import logging
import re

from django.shortcuts import (
    get_object_or_404,
)
from rest_framework import (
    generics,
    status,
)

from rest_framework.exceptions import (
    ValidationError,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import (
    Response,
)

from rest_framework.views import (
    APIView,
)

from accounts.permissions import IsAdmin, IsDoctor
from doctors.models import TimeSlot
from doctors.models import Doctor
from appointments.models import AISymptomReport
from reports.models import MedicalReport
from notifications.models import Notification

from .models import (
    Payment,
    RefundRequest,
)

from .serializers import (
    PaymentSerializer,
    RefundRequestSerializer,
)

from notifications.models import (
    Notification,
)
from notifications.utils import create_admin_notification
from django.conf import settings
from django.http import HttpResponseRedirect
from django.urls import reverse

from .sslcommerz import create_session, is_valid_payment, validate_transaction


logger = logging.getLogger(__name__)


# ==========================================================
# Helper Function
# Payment Success Notification
# ==========================================================

def create_payment_notification(
    payment
):

    # ======================================================
    # Prevent Duplicate Notification
    # ======================================================

    if payment.payment_notification_sent:

        return False


    # ======================================================
    # Payment Source
    # ======================================================

    if payment.appointment:

        service_name = (
            "doctor appointment"
        )

    elif payment.test_booking:

        service_name = (
            "diagnostic test"
        )

    else:

        service_name = (
            "healthcare service"
        )


    # ======================================================
    # Create Notification
    # ======================================================

    Notification.objects.create(

        user=payment.patient.user,

        notification_type="Payment",

        title="Payment Successful",

        message=(
            f"Your payment of BDT "
            f"{payment.amount} "
            f"for {service_name} "
            f"has been completed successfully."
        ),

        is_read=False,

    )

    create_admin_notification(
        notification_type="Payment",
        title="Payment successful",
        message=(
            f"A payment of BDT {payment.amount} was completed for "
            f"{service_name}."
        ),
    )


    return True


def confirm_paid_appointment(payment):
    appointment = payment.appointment
    if not appointment or appointment.status != "Pending":
        return False

    appointment.status = "Confirmed"
    appointment.save(update_fields=["status", "updated_at"])
    Notification.objects.create(
        user=appointment.doctor.user,
        notification_type="Appointment",
        title="Appointment confirmed after payment",
        message=(
            f"Payment was completed for appointment {appointment.booking_number}. "
            "The appointment is now confirmed."
        ),
        is_read=False,
    )

    return True


def confirm_paid_test_booking(payment):
    booking = payment.test_booking
    if not booking:
        return False

    booking_changed = booking.status == "Pending"
    if booking_changed:
        booking.status = "Confirmed"
        booking.save(update_fields=["status", "updated_at"])

    doctor = booking.appointment.doctor if booking.appointment else None
    report = MedicalReport.objects.filter(test_booking=booking).first()
    if not report:
        report = MedicalReport.objects.filter(
            patient=booking.patient,
            appointment=booking.appointment,
            report_type="Diagnostic",
            test_booking__isnull=True,
        ).order_by("-uploaded_at").first()
    if report:
        if report.test_booking_id != booking.id:
            report.test_booking = booking
            report.save(update_fields=["test_booking"])
    else:
        MedicalReport.objects.create(
            report_type="Diagnostic",
            patient=booking.patient,
            doctor=doctor,
            appointment=booking.appointment,
            test_booking=booking,
            report_title=f"Diagnostic Report: {booking.diagnostic_test.name}",
            report_status="Draft",
        )

    if not booking_changed:
        return False

    Notification.objects.create(
        user=booking.patient.user,
        notification_type="Diagnostic",
        title="Diagnostic booking confirmed",
        message=(
            f"Payment was completed for diagnostic booking "
            f"{booking.booking_number}. The booking is now confirmed."
        ),
        is_read=False,
    )
    return True


def confirm_paid_ai_report(payment):
    report = payment.ai_symptom_report
    if not report or report.payment_status == "Paid":
        return False

    report.payment_status = "Paid"
    report.payment_transaction_id = payment.transaction_id
    report.paid_at = timezone.now()
    report.save(update_fields=["payment_status", "payment_transaction_id", "paid_at", "updated_at"])
    Notification.objects.create(
        user=report.doctor.user,
        notification_type="Report",
        title="New paid AI symptom report",
        message="A patient paid BDT 100 and shared an AI symptom report with you.",
        is_read=False,
    )
    return True


def is_admin_user(user):
    return bool(user.role == "admin" or user.is_superuser)


def can_refund_payment(user, payment):
    if payment.ai_symptom_report_id:
        return False
    if is_admin_user(user):
        return True
    return bool(
        payment.appointment
        and payment.appointment.doctor
        and payment.appointment.doctor.user_id == user.id
    )


def _sslcommerz_redirect(status_value, payment_id=None):
    url = f"{settings.SSLCOMMERZ_FRONTEND_URL.rstrip('/')}/payment-result"
    query = f"?status={status_value}"
    if payment_id:
        query += f"&payment_id={payment_id}"
    return HttpResponseRedirect(url + query)


class SSLCommerzCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, "patient_profile"):
            return Response({"detail": "Patient profile not found."}, status=status.HTTP_403_FORBIDDEN)

        payload = request.data.copy()
        payload["payment_method"] = "SSLCOMMERZ"
        payload["transaction_id"] = f"SSL-{timezone.now().strftime('%Y%m%d%H%M%S%f')}"
        serializer = PaymentSerializer(data=payload, context={"request": request})
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(
            patient=request.user.patient_profile,
            payment_status="Pending",
        )
        try:
            gateway_data = create_session(payment, request)
        except Exception as exc:
            payment.delete()
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({
            "payment_id": payment.id,
            "transaction_id": payment.transaction_id,
            "gateway_url": gateway_data["GatewayPageURL"],
        }, status=status.HTTP_201_CREATED)


class SSLCommerzAIReportCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        patient = getattr(request.user, "patient_profile", None)
        if getattr(request.user, "role", None) != "patient" or not patient:
            return Response({"detail": "Only patients can pay for AI consultations."}, status=status.HTTP_403_FORBIDDEN)

        doctor = get_object_or_404(
            Doctor,
            id=request.data.get("doctor"),
            is_available=True,
            approval_status="approved",
        )
        specialist = str(request.data.get("ai_specialist", "")).lower()
        matched_specialists = request.data.get("matched_specialists", [])
        if not isinstance(matched_specialists, list):
            matched_specialists = []
        specialties = [specialist, *matched_specialists]
        doctor_profile = f"{doctor.specialization or ''} {doctor.department.name if doctor.department else ''}".lower()

        def specialty_stems(value):
            words = re.findall(r"[a-z]+", str(value).lower())
            return {
                re.sub(r"(ist|ian|ics|y)$", "", word)
                for word in words
                if len(word) > 3
            }

        doctor_stems = specialty_stems(doctor_profile)
        requested_stems = set().union(*(specialty_stems(item) for item in specialties))
        if requested_stems and not requested_stems.intersection(doctor_stems):
            return Response({"doctor": "You can only pay for a recommended doctor."}, status=status.HTTP_400_BAD_REQUEST)

        transaction_id = f"AI-{timezone.now().strftime('%Y%m%d%H%M%S%f')}"
        possible_conditions = request.data.get("possible_conditions", "")
        if isinstance(possible_conditions, (list, tuple)):
            possible_conditions = ", ".join(str(item) for item in possible_conditions)
        with transaction.atomic():
            report = AISymptomReport.objects.create(
                patient=patient,
                doctor=doctor,
                symptoms=request.data.get("symptoms", ""),
                duration=request.data.get("duration", ""),
                severity=request.data.get("severity", ""),
                ai_category=request.data.get("ai_category", ""),
                possible_conditions=possible_conditions,
                ai_urgency=request.data.get("ai_urgency", ""),
                ai_specialist=request.data.get("ai_specialist", ""),
                ai_guidance=request.data.get("ai_guidance", ""),
                consultation_fee=100,
                payment_status="Pending",
                payment_transaction_id=transaction_id,
            )
            payment = Payment.objects.create(
                ai_symptom_report=report,
                patient=patient,
                amount=Decimal("100.00"),
                payment_mode="Full",
                payment_method="SSLCOMMERZ",
                transaction_id=transaction_id,
                payment_status="Pending",
            )
        try:
            gateway_data = create_session(payment, request)
        except Exception as exc:
            report.delete()
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({
            "payment_id": payment.id,
            "report_id": report.id,
            "transaction_id": transaction_id,
            "gateway_url": gateway_data["GatewayPageURL"],
        }, status=status.HTTP_201_CREATED)


class SSLCommerzCallbackView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, callback_status):
        return self._complete(request.data, callback_status)

    def get(self, request, callback_status):
        return self._complete(request.query_params, callback_status)

    def _complete(self, data, callback_status):
        transaction_id = data.get("tran_id")
        payment = Payment.objects.filter(transaction_id=transaction_id).first()
        if not payment:
            return _sslcommerz_redirect("failed")
        if callback_status != "success":
            payment.payment_status = "Cancelled" if callback_status == "cancel" else "Failed"
            payment.save(update_fields=["payment_status", "updated_at"])
            if payment.ai_symptom_report:
                payment.ai_symptom_report.payment_status = payment.payment_status
                payment.ai_symptom_report.save(update_fields=["payment_status", "updated_at"])
            return _sslcommerz_redirect(callback_status, payment.id)
        try:
            validation = validate_transaction(data.get("val_id"))
        except Exception:
            return _sslcommerz_redirect("failed", payment.id)
        if not is_valid_payment(validation, payment):
            payment.payment_status = "Failed"
            payment.save(update_fields=["payment_status", "updated_at"])
            if payment.ai_symptom_report:
                payment.ai_symptom_report.payment_status = "Failed"
                payment.ai_symptom_report.save(update_fields=["payment_status", "updated_at"])
            return _sslcommerz_redirect("failed", payment.id)
        with transaction.atomic():
            payment.payment_status = "Paid" if payment.payment_mode == "Full" else "Partially Paid"
            payment.is_refundable = payment.payment_mode == "Full"
            payment.save(update_fields=["payment_status", "is_refundable", "updated_at"])
            confirm_paid_appointment(payment)
            confirm_paid_test_booking(payment)
            confirm_paid_ai_report(payment)
            if create_payment_notification(payment):
                payment.payment_notification_sent = True
                payment.save(update_fields=["payment_notification_sent", "updated_at"])
        return _sslcommerz_redirect("success", payment.id)


# ==========================================================
# Helper Function
# Payment Refund Notification
# ==========================================================

def create_refund_notification(payment, reason=""):

    if payment.appointment:

        service_name = (
            "doctor appointment"
        )

    elif payment.test_booking:

        service_name = (
            "diagnostic test"
        )

    else:

        service_name = (
            "healthcare service"
        )


    refund_amount, retained_amount = payment.refund_breakdown

    Notification.objects.create(

        user=payment.patient.user,

        notification_type="Payment",

        title="Payment Refunded",

        message=(
            f"BDT {refund_amount} has been refunded from your "
            f"BDT {payment.amount} payment for {service_name}. "
            f"BDT {retained_amount} was retained as the cancellation fee."
            + (f" Reason: {reason}" if reason else "")
        ),

        is_read=False,

    )


def apply_refund_breakdown(payment):
    payment.refunded_amount = (
        payment.amount * Decimal("0.80")
    ).quantize(Decimal("0.01"))
    payment.refund_retained_amount = (
        payment.amount - payment.refunded_amount
    ).quantize(Decimal("0.01"))


def complete_refund(payment, reason=""):
    """Record the policy refund and automatically cancel the appointment."""
    payment.payment_status = "Refunded"
    apply_refund_breakdown(payment)
    payment.is_refundable = False
    payment.save(update_fields=[
        "payment_status", "refunded_amount", "refund_retained_amount",
        "is_refundable", "updated_at",
    ])

    appointment = payment.appointment
    if appointment and appointment.status != "Cancelled":
        appointment.status = "Cancelled"
        appointment.save(update_fields=["status", "updated_at"])

    create_refund_notification(payment, reason)


def notify_refund_request(request):
    payment = request.payment
    appointment = payment.appointment
    recipients = []
    if appointment and appointment.doctor:
        recipients.append(appointment.doctor.user)

    booking_number = (
        appointment.booking_number if appointment
        else payment.test_booking.booking_number if payment.test_booking
        else payment.id
    )
    for user in {recipient.id: recipient for recipient in recipients}.values():
        Notification.objects.create(
            user=user,
            notification_type="Payment",
            title="Refund request received",
            message=(
                f"Refund request for booking {booking_number} "
                f"requires your review. Requested amount: BDT {request.refund_amount}."
            ),
            is_read=False,
        )

    create_admin_notification(
        notification_type="Payment",
        title="Refund request received",
        message=(
            f"Refund request for booking {booking_number} requires review. "
            f"Requested amount: BDT {request.refund_amount}."
        ),
    )


class PatientRefundRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        patient = getattr(request.user, "patient_profile", None)
        if not patient:
            return Response({"detail": "Patient profile not found."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            payment = get_object_or_404(
                Payment.objects.select_for_update(),
                pk=pk,
                patient=patient,
            )
            if payment.payment_status != "Paid" or payment.payment_mode != "Full":
                return Response({"detail": "Only full payments can be refunded."}, status=status.HTTP_400_BAD_REQUEST)
            if not payment.can_be_refunded:
                return Response({"detail": "This payment is outside the refund policy."}, status=status.HTTP_400_BAD_REQUEST)
            if payment.refund_requests.filter(refund_status__in=["Pending", "Approved", "Completed"]).exists():
                return Response({"detail": "A refund request already exists for this payment."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                refund_request = RefundRequest.objects.create(
                    payment=payment,
                    patient=patient,
                    refund_amount=payment.refund_breakdown[0],
                    reason=str(request.data.get("reason", "Patient requested refund")).strip() or "Patient requested refund",
                )
            except IntegrityError:
                return Response(
                    {"detail": "A refund request already exists for this payment."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            notify_refund_request(refund_request)
        except Exception:
            logger.exception(
                "Refund request notification failed for payment %s",
                payment.id,
            )

        return Response(
            {
                "id": refund_request.id,
                "payment": payment.id,
                "patient": patient.id,
                "refund_amount": str(refund_request.refund_amount),
                "reason": refund_request.reason,
                "refund_status": refund_request.refund_status,
                "requested_at": refund_request.requested_at,
            },
            status=status.HTTP_201_CREATED,
        )


class RefundRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = RefundRequest.objects.select_related(
            "payment", "payment__appointment", "payment__appointment__doctor__user", "patient__user",
        )
        if is_admin_user(self.request.user):
            return queryset
        if getattr(self.request.user, "role", None) == "doctor":
            return queryset.filter(payment__appointment__doctor__user=self.request.user)
        return queryset.none()

    def get(self, request):
        return Response(RefundRequestSerializer(self.get_queryset(), many=True).data)


class RefundRequestStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        next_status = request.data.get("refund_status")
        if next_status not in {"Approved", "Rejected"}:
            return Response({"detail": "Refund status must be Approved or Rejected."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            refund_request = get_object_or_404(
                RefundRequest.objects.select_for_update(),
                pk=pk,
            )
            payment = get_object_or_404(
                Payment.objects.select_for_update(),
                pk=refund_request.payment_id,
            )
            payment = Payment.objects.select_related(
                "appointment",
                "appointment__doctor__user",
                "test_booking",
                "patient",
                "patient__user",
            ).get(pk=payment.pk)
            appointment = payment.appointment
            is_doctor = (
                getattr(request.user, "role", None) == "doctor"
                and appointment
                and appointment.doctor.user_id == request.user.id
            )
            if not is_admin_user(request.user) and not is_doctor:
                return Response({"detail": "Only the assigned doctor or an admin can process this request."}, status=status.HTTP_403_FORBIDDEN)
            if refund_request.refund_status != "Pending":
                return Response({"detail": "This refund request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

            if next_status == "Approved":
                can_process_refund = (
                    payment.payment_status == "Paid"
                    and payment.payment_mode == "Full"
                    and payment.is_refundable
                    and (
                        payment.test_booking_id
                        or payment.can_be_refunded
                    )
                )
                if not can_process_refund:
                    return Response({"detail": "This payment is no longer refundable under policy."}, status=status.HTTP_400_BAD_REQUEST)
                complete_refund(payment, refund_request.reason)
                refund_request.refund_status = "Completed"
                booking_label = (
                    appointment.booking_number
                    if appointment
                    else payment.test_booking.booking_number
                    if payment.test_booking
                    else ""
                )
                notification_type = "Appointment" if appointment else "Payment"
                notification_message = (
                    f"Your refund was approved. Cancel appointment {booking_label} from your appointments."
                    if appointment
                    else f"Your diagnostic refund was approved for booking {booking_label}."
                )
                Notification.objects.create(
                    user=payment.patient.user,
                    notification_type=notification_type,
                    title="Refund approved",
                    message=notification_message,
                    is_read=False,
                )
            else:
                refund_request.refund_status = "Rejected"
                refund_request.admin_note = str(request.data.get("admin_note", "Refund request was rejected.")).strip()
                Notification.objects.create(
                    user=payment.patient.user,
                    notification_type="Payment",
                    title="Refund request rejected",
                    message=refund_request.admin_note or "Your refund request was rejected.",
                    is_read=False,
                )
            refund_request.processed_at = timezone.now()
            refund_request.save(update_fields=["refund_status", "admin_note", "processed_at", "updated_at"])

        return Response(RefundRequestSerializer(refund_request).data)


# ==========================================================
# Create Payment
#
# POST:
# /api/payments/create/
# ==========================================================

class PaymentCreateView(
    generics.CreateAPIView
):

    serializer_class = PaymentSerializer

    permission_classes = [
        IsAuthenticated
    ]


    # ======================================================
    # Create Payment
    # ======================================================

    def perform_create(
        self,
        serializer
    ):

        # ==================================================
        # Patient Profile Check
        # ==================================================

        if not hasattr(
            self.request.user,
            "patient_profile"
        ):

            raise ValidationError({

                "patient":
                "Patient profile not found."

            })


        # ==================================================
        # Create Payment Directly As Paid
        #
        # Because this project currently uses
        # Transaction ID based simulated payment.
        # ==================================================

        payment = serializer.save(

            patient=(
                self.request.user
                .patient_profile
            ),

            payment_status=(
                "Paid"
                if serializer.validated_data.get("payment_mode") == "Full"
                else "Partially Paid"
            ),

        )

        # Both partial and full successful payments confirm the appointment.
        confirm_paid_appointment(payment)
        confirm_paid_test_booking(payment)


        # ==================================================
        # Payment Notification
        # ==================================================

        notification_created = (
            create_payment_notification(
                payment
            )
        )


        # ==================================================
        # Mark Notification As Sent
        # ==================================================

        if notification_created:

            payment.payment_notification_sent = (
                True
            )

            payment.save(

                update_fields=[

                    "payment_notification_sent",

                    "updated_at",

                ]

            )


    # ======================================================
    # Create Response
    # ======================================================

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        # ==================================================
        # Patient Profile Check
        # ==================================================

        if not hasattr(
            request.user,
            "patient_profile"
        ):

            return Response(

                {

                    "success": False,

                    "message":
                    "Patient profile not found."

                },

                status=(
                    status.HTTP_403_FORBIDDEN
                )

            )


        try:

            with transaction.atomic():

                response = super().create(

                    request,
                    *args,
                    **kwargs

                )


            return Response(

                {

                    "success": True,

                    "message":
                    "Payment completed successfully.",

                    "data":
                    response.data,

                },

                status=(
                    status.HTTP_201_CREATED
                )

            )


        except IntegrityError:

            return Response(

                {

                    "success": False,

                    "message":
                    (
                        "Transaction ID already exists."
                    ),

                },

                status=(
                    status.HTTP_400_BAD_REQUEST
                )

            )


# ==========================================================
# My Payment History
#
# GET:
# /api/payments/
# ==========================================================

class PaymentListView(
    generics.ListAPIView
):

    serializer_class = (
        PaymentSerializer
    )

    # Patient dashboard calculates totals from this response, so it must
    # receive the complete payment history instead of the global first page.
    pagination_class = None

    permission_classes = [

        IsAuthenticated,

    ]


    def get_queryset(
        self
    ):

        user = (
            self.request.user
        )


        # ==================================================
        # Patient Profile Check
        # ==================================================

        if not hasattr(
            user,
            "patient_profile",
        ):

            return (
                Payment.objects.none()
            )


        # ==================================================
        # Patient Payments
        # ==================================================

        return Payment.objects.select_related(
            "patient",
            "patient__user",
            "appointment",
            "appointment__doctor",
            "appointment__doctor__user",
            "test_booking",
            "test_booking__family_member",
            "test_booking__diagnostic_test",
        ).filter(
            patient=user.patient_profile,
            payment_status__in=["Pending", "Paid", "Partially Paid", "Refunded"],
        ).order_by("-payment_date")


# ==========================================================
# Payment Details
#
# GET:
# /api/payments/<id>/
# ==========================================================

class PaymentDetailView(
    generics.RetrieveAPIView
):

    serializer_class = (
        PaymentSerializer
    )

    permission_classes = [

        IsAuthenticated,

    ]


    def get_queryset(
        self
    ):

        user = (
            self.request.user
        )


        # ==================================================
        # Patient Profile Check
        # ==================================================

        if not hasattr(
            user,
            "patient_profile",
        ):

            return (
                Payment.objects.none()
            )


        return (

            Payment.objects

            .select_related(

                "patient",

                "patient__user",

                "appointment",

                "appointment__doctor",

                "appointment__doctor__user",

                "test_booking",

                "test_booking__family_member",

                "test_booking__diagnostic_test",

            )

            .filter(

                patient=(
                    user.patient_profile
                )

            )

        )


# ==========================================================
# Admin Payment List
#
# GET:
# /api/payments/admin/
# ==========================================================

class AdminPaymentListView(
    generics.ListAPIView
):

    serializer_class = (
        PaymentSerializer
    )

    pagination_class = None

    permission_classes = [

        IsAuthenticated,
        IsAdmin,

    ]


    def get_queryset(
        self
    ):

        # ==================================================
        # Admin Check
        # ==================================================

        if not (
            self.request.user.role == "admin"
            or self.request.user.is_superuser
        ):

            return (
                Payment.objects.none()
            )


        # ==================================================
        # All Payments
        # ==================================================

        return (

            Payment.objects

            .select_related(

                "patient",

                "patient__user",

                "appointment",

                "appointment__doctor",

                "appointment__doctor__user",

                "test_booking",

            )

            .order_by(

                "-payment_date"

            )

        )


class AdminPaymentDeleteView(
    generics.DestroyAPIView
):

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    queryset = Payment.objects.all()


class AdminDiagnosticReportInfoView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        payment = get_object_or_404(
            Payment.objects.select_related("test_booking"),
            pk=pk,
        )
        if not payment.test_booking:
            return Response(
                {"detail": "This payment is not linked to a diagnostic booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking = payment.test_booking
        value = request.data.get("report_available_at")
        if value:
            value = parse_datetime(value)
            if value is None:
                return Response(
                    {"report_available_at": "Use a valid date and time."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if timezone.is_naive(value):
                value = timezone.make_aware(value)
        else:
            value = None

        booking.report_available_at = value
        booking.report_available_note = request.data.get("report_available_note", "")
        booking.save(update_fields=["report_available_at", "report_available_note", "updated_at"])

        report_time = (
            timezone.localtime(value).strftime("%d %b %Y at %I:%M %p")
            if value else "after the diagnostic centre updates the schedule"
        )
        note = booking.report_available_note.strip()
        message = (
            f"Your {booking.diagnostic_test.name} report is expected on {report_time}."
        )
        if note:
            message = f"{message} {note}"
        Notification.objects.create(
            user=booking.patient.user,
            notification_type="Diagnostic",
            title="Diagnostic Report Availability Updated",
            message=message,
            is_read=False,
        )
        if booking.appointment and booking.appointment.doctor:
            Notification.objects.create(
                user=booking.appointment.doctor.user,
                notification_type="Diagnostic",
                title="Patient Diagnostic Report Updated",
                message=(
                    f"The diagnostic report schedule for {booking.patient.user.get_full_name() or booking.patient.user.username} "
                    f"({booking.diagnostic_test.name}) was updated by admin."
                ),
                is_read=False,
            )
        return Response({
            "report_available_at": booking.report_available_at,
            "report_available_note": booking.report_available_note,
        })


# ==========================================================
# Update Payment Status
#
# PATCH:
# /api/payments/<id>/status/
#
# Only Admin
# ==========================================================

class PaymentStatusUpdateView(
    APIView
):

    permission_classes = [

        IsAuthenticated,
        IsAdmin,

    ]


    # ======================================================
    # Valid Status
    # ======================================================

    VALID_STATUS = [

        "Pending",

        "Paid",

        "Partially Paid",

        "Failed",

        "Cancelled",

    ]


    # ======================================================
    # Status Transitions
    # ======================================================

    STATUS_TRANSITIONS = {

        "Pending": [

            "Paid",

            "Partially Paid",

            "Failed",

            "Cancelled",

        ],

        "Failed": [

            "Pending",

            "Paid",

            "Partially Paid",

        ],

        "Cancelled": [

            "Pending",

            "Paid",

            "Partially Paid",

        ],

        "Partially Paid": [],

        "Paid": [],

        "Refunded": [],

    }


    # ======================================================
    # Update Status
    # ======================================================

    def patch(
        self,
        request,
        pk
    ):

        # ==================================================
        # Admin Check
        # ==================================================

        if not (
            request.user.role == "admin"
            or request.user.is_superuser
        ):

            return Response(

                {

                    "success": False,

                    "message":
                    "Admin access required.",

                },

                status=(
                    status.HTTP_403_FORBIDDEN
                ),

            )


        # ==================================================
        # New Status
        # ==================================================

        new_status = (
            request.data.get(
                "payment_status"
            )
        )


        # ==================================================
        # Validate Status
        # ==================================================

        if new_status not in self.VALID_STATUS:

            return Response(

                {

                    "success": False,

                    "message":
                    "Invalid payment status.",

                    "valid_statuses":
                    self.VALID_STATUS,

                },

                status=(
                    status.HTTP_400_BAD_REQUEST
                ),

            )


        # ==================================================
        # Database Transaction
        # ==================================================

        with transaction.atomic():

            payment = (
                get_object_or_404(

                    Payment.objects

                    .select_related(

                        "patient",

                        "patient__user",

                        "appointment",

                        "test_booking",

                    )

                    .select_for_update(),

                    pk=pk,

                )
            )


            previous_status = (
                payment.payment_status
            )


            # ==================================================
            # Same Status
            # ==================================================

            if previous_status == new_status:

                if new_status in {"Paid", "Partially Paid"}:
                    confirm_paid_appointment(payment)
                    confirm_paid_test_booking(payment)

                return Response(

                    {

                        "success": True,

                        "message":
                        "Payment already has this status.",

                        "payment":
                        PaymentSerializer(
                            payment
                        ).data,

                    },

                    status=(
                        status.HTTP_200_OK
                    ),

                )


            # ==================================================
            # Refunded Protection
            # ==================================================

            if previous_status == "Refunded":

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "Refunded payment cannot "
                            "be modified."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Paid Protection
            # ==================================================

            if previous_status == "Paid":

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "Paid payment cannot be "
                            "modified from this endpoint. "
                            "Use the refund endpoint "
                            "for refunds."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Validate Transition
            # ==================================================

            allowed_statuses = (

                self.STATUS_TRANSITIONS.get(

                    previous_status,

                    []

                )

            )


            if new_status not in allowed_statuses:

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            f"Cannot change payment "
                            f"status from "
                            f"{previous_status} "
                            f"to "
                            f"{new_status}."
                        ),

                        "allowed_statuses":
                        allowed_statuses,

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Update Status
            # ==================================================

            payment.payment_status = (
                new_status
            )

            if new_status in {"Paid", "Partially Paid"}:
                confirm_paid_appointment(payment)
                confirm_paid_test_booking(payment)


            # ==================================================
            # Payment Notification
            #
            # This is useful for old Pending payments
            # which admin later marks as Paid.
            # ==================================================

            if (

                new_status == "Paid"

                and

                previous_status != "Paid"

            ):

                notification_created = (

                    create_payment_notification(
                        payment
                    )

                )


                if notification_created:

                    payment.payment_notification_sent = (
                        True
                    )


            # ==================================================
            # Save
            # ==================================================

            payment.save(

                update_fields=[

                    "payment_status",

                    "payment_notification_sent",

                    "updated_at",

                ]

            )


        # ==================================================
        # Success Response
        # ==================================================

        return Response(

            {

                "success": True,

                "message":
                (
                    "Payment status updated "
                    "successfully."
                ),

                "payment":
                PaymentSerializer(
                    payment
                ).data,

            },

            status=(
                status.HTTP_200_OK
            ),

        )


# ==========================================================
# Doctor Refund Payment
# ==========================================================

class DoctorPaymentRefundView(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]

    def patch(self, request, pk):
        with transaction.atomic():
            payment = get_object_or_404(
                Payment.objects.select_related("patient__user", "appointment__doctor", "appointment__doctor__user").select_for_update(),
                pk=pk,
                appointment__doctor__user=request.user,
            )

            if payment.payment_status != "Paid":
                return Response({"detail": "Only paid appointment payments can be refunded."}, status=status.HTTP_400_BAD_REQUEST)
            if payment.payment_mode == "Partial":
                return Response({"detail": "Partial payments cannot be refunded."}, status=status.HTTP_400_BAD_REQUEST)
            if not payment.can_be_refunded:
                return Response({"detail": "This payment is not eligible for refund."}, status=status.HTTP_400_BAD_REQUEST)
            if payment.appointment.status in {"Completed", "Cancelled", "Rejected", "No Show"}:
                return Response({"detail": "Payments cannot be refunded after the appointment is closed."}, status=status.HTTP_400_BAD_REQUEST)

            appointment = payment.appointment
            appointment = type(appointment).objects.select_for_update().get(pk=appointment.pk)
            refund_reason = str(request.data.get("reason", "Doctor-approved cancellation")).strip()
            complete_refund(payment, refund_reason)
            Notification.objects.create(
                user=appointment.doctor.user,
                notification_type="Payment",
                title="Appointment payment refunded",
                message=(
                    f"Payment for appointment {appointment.booking_number} was refunded and the appointment was cancelled."
                    f" Reason: {refund_reason}"
                ),
                is_read=False,
            )

        refund_amount, retained_amount = payment.refund_breakdown
        return Response({"success": True, "message": f"BDT {refund_amount} refunded; BDT {retained_amount} retained as the cancellation fee.", "payment": PaymentSerializer(payment).data})


# ==========================================================
# Refund Payment
#
# PATCH:
# /api/payments/<id>/refund/
# ==========================================================

class PaymentRefundView(
    APIView
):

    permission_classes = [

        IsAuthenticated,

    ]


    # ======================================================
    # Refund Payment
    # ======================================================

    def patch(
        self,
        request,
        pk
    ):
        # ==================================================
        # Admin Check
        # ==================================================

        # ==================================================
        # Database Transaction
        # ==================================================

        with transaction.atomic():

            payment = (
                get_object_or_404(

                    Payment.objects

                    .select_related(

                        "patient",

                        "patient__user",

                        "appointment",

                        "test_booking",

                    )

                    .select_for_update(),

                    pk=pk,

                )
            )

            if payment.ai_symptom_report_id:
                return Response(
                    {
                        "success": False,
                        "message": "AI symptom consultation payments are direct and non-refundable.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not can_refund_payment(request.user, payment):
                return Response(
                    {
                        "success": False,
                        "message": (
                            "Only an administrator or the appointment's "
                            "doctor can refund this payment."
                        ),
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )


            # ==================================================
            # Already Refunded
            # ==================================================

            if payment.payment_status == "Refunded":

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "This payment has already "
                            "been refunded."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Payment Must Be Paid
            # ==================================================

            if payment.payment_status != "Paid":

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "Only successfully paid "
                            "payments can be refunded."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Partial Payment Cannot Be Refunded
            # ==================================================

            if payment.payment_mode == "Partial":

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "Partial payments are "
                            "non-refundable."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Refund Eligibility
            # ==================================================

            if not payment.can_be_refunded:

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "This payment is not "
                            "eligible for refund."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )

            # ==================================================
            # Update Payment Status
            # ==================================================

            payment.payment_status = (
                "Refunded"
            )
            apply_refund_breakdown(payment)


            payment.save(

                update_fields=[

                    "payment_status",

                    "refunded_amount",

                    "refund_retained_amount",

                    "updated_at",

                ]

            )


            # ==================================================
            # Refund Notification
            # ==================================================

            create_refund_notification(
                payment
            )


        # ==================================================
        # Success Response
        # ==================================================

        return Response(

            {

                "success": True,

                "message":
                (
                    f"BDT {payment.refunded_amount} refunded; "
                    f"BDT {payment.refund_retained_amount} retained "
                    "as the cancellation fee."
                ),

                "payment":
                PaymentSerializer(
                    payment
                ).data,

            },

            status=(
                status.HTTP_200_OK
            ),

        )


class DoctorPaymentListView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsDoctor]
    pagination_class = None

    def get_queryset(self):
        return Payment.objects.select_related(
            "patient", "patient__user", "appointment", "appointment__doctor",
            "appointment__doctor__user", "test_booking",
        ).filter(
            appointment__doctor__user=self.request.user,
            payment_status__in=["Pending", "Paid", "Partially Paid", "Refunded"],
        ).order_by("-payment_date")