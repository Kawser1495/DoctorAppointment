from decimal import Decimal

from rest_framework import serializers

from .models import Payment, RefundRequest


class RefundRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    booking_number = serializers.SerializerMethodField()
    appointment_date = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = RefundRequest
        fields = [
            "id", "payment", "patient", "patient_name", "booking_number", "appointment_date",
            "doctor_name", "refund_amount", "reason", "refund_status",
            "admin_note", "requested_at", "updated_at", "processed_at",
        ]
        read_only_fields = [
            "id", "patient", "patient_name", "booking_number", "appointment_date", "doctor_name",
            "refund_amount", "refund_status", "admin_note", "requested_at",
            "updated_at", "processed_at",
        ]

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username

    def get_booking_number(self, obj):
        if obj.payment.appointment:
            return obj.payment.appointment.booking_number
        if obj.payment.test_booking:
            return obj.payment.test_booking.booking_number
        return None

    def get_appointment_date(self, obj):
        if obj.payment.appointment:
            return obj.payment.appointment.appointment_date
        if obj.payment.test_booking:
            return obj.payment.test_booking.booking_date
        return None

    def get_doctor_name(self, obj):
        appointment = obj.payment.appointment
        if not appointment:
            return None
        return appointment.doctor.user.get_full_name() or appointment.doctor.user.username


class PaymentSerializer(
    serializers.ModelSerializer
):

    # ==========================================================
    # Read Only Fields
    # ==========================================================

    patient_name = serializers.SerializerMethodField(
        read_only=True
    )

    appointment_booking = serializers.SerializerMethodField(
        read_only=True
    )

    appointment_date = serializers.SerializerMethodField(
        read_only=True
    )

    doctor_name = serializers.SerializerMethodField(
        read_only=True
    )

    diagnostic_booking_number = serializers.SerializerMethodField(
        read_only=True
    )

    diagnostic_test_name = serializers.SerializerMethodField(
        read_only=True
    )

    ai_report_title = serializers.SerializerMethodField(read_only=True)

    booking_person_name = serializers.SerializerMethodField(
        read_only=True
    )

    payment_type = serializers.CharField(
        read_only=True
    )

    expected_amount = serializers.SerializerMethodField(
        read_only=True
    )

    remaining_amount = serializers.SerializerMethodField(
        read_only=True
    )

    net_amount = serializers.SerializerMethodField(
        read_only=True
    )

    is_refundable = serializers.SerializerMethodField()

    refund_amount = serializers.SerializerMethodField()

    refund_retained_amount = serializers.SerializerMethodField()

    refund_request_status = serializers.SerializerMethodField()

    can_request_refund = serializers.SerializerMethodField()

    report_available_at = serializers.SerializerMethodField(read_only=True)

    report_available_note = serializers.SerializerMethodField(read_only=True)


    # ==========================================================
    # Meta
    # ==========================================================

    class Meta:

        model = Payment

        fields = [

            "id",

            # Patient
            "patient",
            "patient_name",

            # Appointment
            "appointment",
            "appointment_booking",
            "appointment_date",
            "doctor_name",

            # Diagnostic
            "test_booking",
            "ai_symptom_report",
            "diagnostic_booking_number",
            "diagnostic_test_name",
            "ai_report_title",
            "booking_person_name",

            # Type
            "payment_type",

            # Payment
            "payment_mode",
            "amount",
            "net_amount",
            "expected_amount",
            "remaining_amount",

            # Payment Information
            "payment_method",
            "transaction_id",

            # Status
            "payment_status",

            # Refund
            "is_refundable",

            "refund_amount",
            "refund_retained_amount",
            "refund_request_status",
            "can_request_refund",
            "report_available_at",
            "report_available_note",

            # Dates
            "payment_date",

        ]

        read_only_fields = [

            "id",

            "patient",
            "patient_name",

            "appointment_booking",
            "appointment_date",
            "doctor_name",

            "diagnostic_booking_number",
            "diagnostic_test_name",
            "ai_report_title",
            "booking_person_name",

            "payment_type",

            "amount",
            "net_amount",
            "expected_amount",
            "remaining_amount",

            "payment_status",

            "is_refundable",

            "refund_amount",
            "refund_retained_amount",
            "refund_request_status",
            "can_request_refund",

            "payment_date",

        ]


    # ==========================================================
    # Patient Name
    # ==========================================================

    def get_patient_name(
        self,
        obj
    ):

        if not obj.patient:

            return "N/A"

        full_name = (
            obj.patient.user.get_full_name()
        )

        return (
            full_name
            or
            obj.patient.user.username
        )

    def get_report_available_at(self, obj):
        return obj.test_booking.report_available_at if obj.test_booking else None

    def get_report_available_note(self, obj):
        return obj.test_booking.report_available_note if obj.test_booking else ""


    # ==========================================================
    # Appointment Booking
    # ==========================================================

    def get_appointment_booking(
        self,
        obj
    ):

        if obj.appointment:

            return (
                obj.appointment.booking_number
            )

        return None

    def get_diagnostic_booking_number(self, obj):
        return obj.test_booking.booking_number if obj.test_booking else None

    def get_diagnostic_test_name(self, obj):
        return obj.test_booking.diagnostic_test.name if obj.test_booking else None

    def get_ai_report_title(self, obj):
        if not obj.ai_symptom_report:
            return None
        return obj.ai_symptom_report.ai_category or "AI Symptom Consultation"

    def get_booking_person_name(self, obj):
        if not obj.test_booking:
            return None
        if obj.test_booking.family_member:
            return obj.test_booking.family_member.name
        return self.get_patient_name(obj)

    def get_net_amount(self, obj):
        """Amount still retained by the payment after any refund."""
        if obj.payment_status == "Refunded":
            return obj.refund_breakdown[1]
        return obj.amount

    def get_appointment_date(self, obj):
        return obj.appointment.appointment_date if obj.appointment else None


    # ==========================================================
    # Doctor Name
    # ==========================================================

    def get_doctor_name(
        self,
        obj
    ):

        if obj.appointment:

            doctor_user = (
                obj.appointment
                .doctor
                .user
            )

            full_name = (
                doctor_user.get_full_name()
            )

            return (
                full_name
                or
                doctor_user.username
            )

        return None


    # ==========================================================
    # Expected Amount
    # ==========================================================

    def get_expected_amount(
        self,
        obj
    ):

        if obj.appointment:

            return (
                obj.appointment
                .doctor
                .consultation_fee
            )

        if obj.test_booking:

            return (
                obj.test_booking
                .diagnostic_test
                .price
            )

        if obj.ai_symptom_report:
            return obj.ai_symptom_report.consultation_fee

        return Decimal("0.00")


    # ==========================================================
    # Remaining Amount
    # ==========================================================

    def get_remaining_amount(
        self,
        obj
    ):

        if obj.appointment:

            total = (
                obj.appointment
                .doctor
                .consultation_fee
            )

            payments = Payment.objects.filter(

                appointment=obj.appointment,

                payment_status__in=["Paid", "Partially Paid"],

            )

        elif obj.test_booking:

            total = (
                obj.test_booking
                .diagnostic_test
                .price
            )

            payments = Payment.objects.filter(

                test_booking=obj.test_booking,

                payment_status__in=["Paid", "Partially Paid"],

            )

        else:

            return Decimal("0.00")


        paid_amount = sum(

            (
                payment.amount
                for payment in payments
            ),

            Decimal("0.00")

        )


        remaining = (
            Decimal(total)
            -
            paid_amount
        )


        return max(

            remaining,

            Decimal("0.00")

        )

    def get_is_refundable(self, obj):
        return obj.can_be_refunded

    def get_refund_amount(self, obj):
        return obj.refund_breakdown[0] if obj.payment_status == "Refunded" else None

    def get_refund_retained_amount(self, obj):
        return obj.refund_breakdown[1] if obj.payment_status == "Refunded" else None

    def get_refund_request_status(self, obj):
        request = obj.refund_requests.order_by("-requested_at").first()
        return request.refund_status if request else None

    def get_can_request_refund(self, obj):
        return obj.can_be_refunded and not obj.refund_requests.filter(
            refund_status__in=["Pending", "Approved", "Completed"]
        ).exists()


    # ==========================================================
    # Transaction Validation
    # ==========================================================

    def validate_transaction_id(
        self,
        value
    ):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Transaction ID is required."
            )


        if len(value) < 4:

            raise serializers.ValidationError(
                "Transaction ID is too short."
            )


        existing_payment = (
            Payment.objects.filter(
                transaction_id__iexact=value
            )
        )


        if self.instance:

            existing_payment = (
                existing_payment.exclude(
                    pk=self.instance.pk
                )
            )


        if existing_payment.exists():

            raise serializers.ValidationError(
                "This Transaction ID has already been used."
            )


        return value


    # ==========================================================
    # Main Validation
    # ==========================================================

    def validate(
        self,
        attrs
    ):

        request = self.context.get(
            "request"
        )


        if (
            not request
            or
            not request.user.is_authenticated
        ):

            raise serializers.ValidationError({

                "authentication":
                "Authentication is required."

            })


        # ======================================================
        # Patient Profile
        # ======================================================

        if not hasattr(

            request.user,

            "patient_profile"

        ):

            raise serializers.ValidationError({

                "patient":
                "Patient profile not found."

            })


        patient = (
            request.user.patient_profile
        )


        appointment = attrs.get(
            "appointment"
        )


        test_booking = attrs.get(
            "test_booking"
        )


        payment_mode = attrs.get(
            "payment_mode"
        )


        # ======================================================
        # Exactly One Payment Source
        # ======================================================

        if (
            appointment is None
            and
            test_booking is None
        ):

            raise serializers.ValidationError({

                "payment_for":
                (
                    "Either appointment or "
                    "test booking is required."
                )

            })


        if (
            appointment is not None
            and
            test_booking is not None
        ):

            raise serializers.ValidationError({

                "payment_for":
                (
                    "Payment can belong to "
                    "only one source."
                )

            })


        # ======================================================
        # Appointment Payment
        # ======================================================

        if appointment:

            if appointment.patient_id != patient.id:

                raise serializers.ValidationError({

                    "appointment":
                    (
                        "You cannot pay for another "
                        "patient's appointment."
                    )

                })


            if appointment.status in [

                "Cancelled",

                "Rejected",

                "No Show",

            ]:

                raise serializers.ValidationError({

                    "appointment":
                    (
                        "Payment cannot be made "
                        "for this appointment."
                    )

                })


            total_amount = Decimal(

                appointment
                .doctor
                .consultation_fee

            )


            already_paid = sum(

                Payment.objects.filter(

                    appointment=appointment,

                    payment_status__in=["Paid", "Partially Paid"],

                ).values_list(

                    "amount",

                    flat=True

                ),

                Decimal("0.00")

            )


        # ======================================================
        # Diagnostic Payment
        # ======================================================

        else:

            if test_booking.patient_id != patient.id:

                raise serializers.ValidationError({

                    "test_booking":
                    (
                        "You cannot pay for another "
                        "patient's diagnostic booking."
                    )

                })


            if test_booking.status == "Cancelled":

                raise serializers.ValidationError({

                    "test_booking":
                    (
                        "Payment cannot be made "
                        "for a cancelled diagnostic booking."
                    )

                })


            total_amount = Decimal(

                test_booking
                .diagnostic_test
                .price

            )


            already_paid = sum(

                Payment.objects.filter(

                    test_booking=test_booking,

                    payment_status__in=["Paid", "Partially Paid"],

                ).values_list(

                    "amount",

                    flat=True

                ),

                Decimal("0.00")

            )


        # ======================================================
        # Remaining Amount
        # ======================================================

        remaining_amount = (

            total_amount
            -
            already_paid

        )


        if remaining_amount <= Decimal("0.00"):

            raise serializers.ValidationError({

                "payment":
                "This service has already been fully paid."

            })


        # ======================================================
        # Full Payment
        # ======================================================

        if payment_mode == "Full":

            calculated_amount = (
                remaining_amount
            )


        # ======================================================
        # Partial Payment
        # ======================================================

        elif payment_mode == "Partial":

            minimum_partial = (

                total_amount
                *
                Decimal("0.20")

            )


            calculated_amount = min(

                minimum_partial,

                remaining_amount

            )


        else:

            raise serializers.ValidationError({

                "payment_mode":
                "Invalid payment mode."

            })


        attrs["calculated_amount"] = (
            calculated_amount
        )


        return attrs


    # ==========================================================
    # Create Payment
    # ==========================================================

    def create(
        self,
        validated_data
    ):

        amount = validated_data.pop(
            "calculated_amount"
        )


        validated_data["amount"] = (
            amount
        )


        validated_data["is_refundable"] = (

            validated_data.get(
                "payment_mode"
            )
            ==
            "Full"

        )


        return super().create(
            validated_data
        )