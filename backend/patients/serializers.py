from django.utils import timezone

from rest_framework import serializers

from .models import (
    PatientProfile,
    FamilyMember,
)


# ==========================================================
# Patient Profile Serializer
# ==========================================================

class PatientProfileSerializer(
    serializers.ModelSerializer
):

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    full_name = serializers.SerializerMethodField()

    class Meta:

        model = PatientProfile

        fields = [
            "id",
            "user",
            "username",
            "email",
            "full_name",
            "phone_number",
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
            "email",
            "full_name",
            "created_at",
            "updated_at",
        ]

    # ======================================================
    # Full Name
    # ======================================================

    def get_full_name(self, obj):

        full_name = obj.user.get_full_name()

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


# ==========================================================
# Family Member Serializer
# ==========================================================

class FamilyMemberSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = FamilyMember

        fields = [
            "id",
            "patient",
            "name",
            "relation",
            "age",
            "gender",
            "phone_number",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "patient",
            "created_at",
        ]

    def validate_name(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Family member name cannot be empty."
            )

        return value

    def validate_age(self, value):

        if value < 0 or value > 130:

            raise serializers.ValidationError(
                "Please enter a valid age between 0 and 130."
            )

        return value

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