from decimal import Decimal

from rest_framework import serializers

from .models import Payment


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

    doctor_name = serializers.SerializerMethodField(
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
            "doctor_name",

            # Diagnostic
            "test_booking",

            # Type
            "payment_type",

            # Payment
            "payment_mode",
            "amount",
            "expected_amount",
            "remaining_amount",

            # Payment Information
            "payment_method",
            "transaction_id",

            # Status
            "payment_status",

            # Refund
            "is_refundable",

            # Dates
            "payment_date",

        ]

        read_only_fields = [

            "id",

            "patient",
            "patient_name",

            "appointment_booking",
            "doctor_name",

            "payment_type",

            "amount",
            "expected_amount",
            "remaining_amount",

            "payment_status",

            "is_refundable",

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

                payment_status="Paid",

            )

        elif obj.test_booking:

            total = (
                obj.test_booking
                .diagnostic_test
                .price
            )

            payments = Payment.objects.filter(

                test_booking=obj.test_booking,

                payment_status="Paid",

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

                    payment_status="Paid",

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

                    payment_status="Paid",

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