from django.db.models import Count, Q, Sum
from django.utils import timezone

from rest_framework import serializers

from .models import PatientProfile, FamilyMember

from appointments.models import Appointment
from payments.models import Payment
from doctors.models import Doctor


# ==========================================================
# Patient Profile Serializer
# ==========================================================

class PatientProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    full_name = serializers.SerializerMethodField()

    # Phone is stored in CustomUser
    phone = serializers.CharField(
        source="user.phone",
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    class Meta:
        model = PatientProfile

        fields = [
            "id",
            "user",
            "profile_image",
            "username",
            "email",
            "full_name",
            "phone",
            "gender",
            "date_of_birth",
            "blood_group",
            "address",
            "emergency_contact",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "username",
            "full_name",
            "created_at",
            "updated_at",
        ]

    # ======================================================
    # Full Name
    # ======================================================

    def get_full_name(self, obj):
        full_name = obj.user.get_full_name().strip()

        if full_name:
            return full_name

        return obj.user.username

    # ======================================================
    # Date of Birth Validation
    # ======================================================

    def validate_date_of_birth(self, value):
        if value is None:
            return value

        if value > timezone.localdate():
            raise serializers.ValidationError(
                "Date of birth cannot be in the future."
            )

        return value

    # ======================================================
    # Phone Validation
    # ======================================================

    def validate_phone(self, value):
        if value is None or value == "":
            return value

        value = value.strip()

        if not value.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError(
                "Phone number must contain 10 to 15 digits."
            )

        return value

    # ======================================================
    # Emergency Contact Validation
    # ======================================================

    def validate_emergency_contact(self, value):
        if value is None or value == "":
            return value

        value = value.strip()

        if not value.isdigit():
            raise serializers.ValidationError(
                "Emergency contact must contain only digits."
            )

        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError(
                "Emergency contact must contain 10 to 15 digits."
            )

        return value

    # ======================================================
    # Update Patient Profile and CustomUser Phone
    # ======================================================

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        # Update PatientProfile fields
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        # Update CustomUser fields
        user = instance.user

        user_update_fields = []
        for field in ("phone", "email"):
            if field in user_data:
                setattr(user, field, user_data[field])
                user_update_fields.append(field)

        if user_update_fields:
            user.save(update_fields=user_update_fields + ["updated_at"])

        return instance


# ==========================================================
# Family Member Serializer
# ==========================================================

class FamilyMemberSerializer(serializers.ModelSerializer):

    class Meta:
        model = FamilyMember

        fields = [
            "id",
            "patient",
            "name",
            "relation",
            "age",
            "gender",
            "blood_group",
            "phone_number",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "patient",
            "created_at",
        ]

    # ======================================================
    # Name Validation
    # ======================================================

    def validate_name(self, value):
        value = " ".join(value.strip().split())

        if not value:
            raise serializers.ValidationError(
                "Family member name cannot be empty."
            )

        return value

    # ======================================================
    # Age Validation
    # ======================================================

    def validate_age(self, value):
        if value < 0 or value > 130:
            raise serializers.ValidationError(
                "Please enter a valid age between 0 and 130."
            )

        return value

    # ======================================================
    # Phone Validation
    # ======================================================

    def validate_phone_number(self, value):
        if value is None or value == "":
            return value

        value = value.strip()

        if not value.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError(
                "Phone number must contain 10 to 15 digits."
            )

        return value


class AdminPatientSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    family_members = serializers.SerializerMethodField()
    appointment_history = serializers.SerializerMethodField()
    payment_history = serializers.SerializerMethodField()
    doctors = serializers.SerializerMethodField()
    active_appointment_count = serializers.SerializerMethodField()
    payment_count = serializers.SerializerMethodField()
    total_payment_amount = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = [
            "id", "full_name", "username", "email", "phone", "is_active",
            "gender", "date_of_birth", "blood_group", "address",
            "emergency_contact", "family_members", "appointment_history",
            "payment_history", "created_at", "updated_at",
            "doctors",
            "active_appointment_count", "payment_count", "total_payment_amount",
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name().strip() or obj.user.username

    def get_family_members(self, obj):
        return FamilyMemberSerializer(
            obj.family_members.all().order_by("name"),
            many=True,
        ).data

    def get_appointment_history(self, obj):
        appointments = Appointment.objects.filter(
            patient=obj,
        ).exclude(
            payments__payment_status="Refunded",
        ).select_related("doctor", "doctor__user", "family_member", "slot").order_by(
            "-appointment_date", "-created_at",
        )[:20]

        return [
            {
                "id": appointment.id,
                "booking_number": appointment.booking_number,
                "doctor_name": str(appointment.doctor),
                "appointment_date": appointment.appointment_date,
                "slot_time": appointment.slot.slot_time,
                "time_range": appointment.slot.time_range,
                "status": appointment.status,
                "reason": appointment.reason,
                "person_type": "Family member" if appointment.family_member else "Patient",
                "person_name": appointment.family_member.name if appointment.family_member else self.get_full_name(obj),
            }
            for appointment in appointments
        ]

    def get_payment_history(self, obj):
        payments = Payment.objects.filter(
            patient=obj,
        ).order_by("-payment_date")[:20]

        return [
            {
                "id": payment.id,
                "amount": payment.amount,
                "payment_status": payment.payment_status,
                "payment_date": payment.payment_date,
                "transaction_id": payment.transaction_id,
            }
            for payment in payments
        ]

    def get_active_appointment_count(self, obj):
        return Appointment.objects.filter(
            patient=obj,
            status__in=["Pending", "Confirmed", "Completed"],
        ).count()

    def get_payment_count(self, obj):
        return Payment.objects.filter(patient=obj).count()

    def get_total_payment_amount(self, obj):
        total = Payment.objects.filter(patient=obj).aggregate(
            total=Sum("amount"),
        )["total"]
        return total or 0

    def get_doctors(self, obj):
        doctors = Doctor.objects.filter(
            appointments__patient=obj,
        ).select_related("user", "department").annotate(
            patient_appointment_count=Count(
                "appointments",
                filter=Q(
                    appointments__patient=obj,
                    appointments__status__in=["Pending", "Confirmed", "Completed"],
                ),
            ),
        ).distinct().order_by("user__first_name", "user__username")

        return [
            {
                "id": doctor.id,
                "name": doctor.user.get_full_name().strip() or doctor.user.username,
                "department": doctor.department.name if doctor.department else "Unassigned",
                "appointment_count": doctor.patient_appointment_count,
            }
            for doctor in doctors
        ]