from rest_framework import serializers

from .models import CustomUser

from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
)


# ==========================================================
# Register Serializer
#
# POST:
# /api/accounts/register/
#
# Creates:
# - CustomUser
#
# PatientProfile is automatically created by:
# patients/signals.py
# ==========================================================

class RegisterSerializer(
    serializers.ModelSerializer
):

    # ======================================================
    # Username / Name
    #
    # Examples:
    # Dr. Sohan
    # Md. Kawser Talukder
    # Abdul Karim
    # Sohan Ahmed
    # ======================================================

    username = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False,
        trim_whitespace=True,
    )

    # ======================================================
    # Password
    # ======================================================

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:

        model = CustomUser

        fields = [
            "username",
            "email",
            "phone",
            "password",
        ]

        extra_kwargs = {

            "email": {
                "required": True,
            },

            "phone": {
                "required": True,
            },

        }

    # ======================================================
    # Username Validation
    # ======================================================

    def validate_username(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Name cannot be empty."
            )

        # --------------------------------------------------
        # Multiple spaces → single space
        # --------------------------------------------------

        value = " ".join(
            value.split()
        )

        # --------------------------------------------------
        # Minimum length
        # --------------------------------------------------

        if len(value) < 2:

            raise serializers.ValidationError(
                "Name must contain at least 2 characters."
            )

        # --------------------------------------------------
        # Allowed characters
        #
        # Letters
        # Spaces
        # Dot
        # Hyphen
        # Underscore
        # Apostrophe
        # --------------------------------------------------

        import re

        if not re.match(
            r"^[A-Za-zÀ-ÖØ-öø-ÿ.\-_'\s]+$",
            value
        ):

            raise serializers.ValidationError(
                "Name can contain letters, spaces, "
                "dot, hyphen, underscore and apostrophe only."
            )

        return value

    # ======================================================
    # Email Validation
    # ======================================================

    def validate_email(self, value):

        value = value.strip().lower()

        if not value:

            raise serializers.ValidationError(
                "Email cannot be empty."
            )

        return value

    # ======================================================
    # Phone Validation
    # ======================================================

    def validate_phone(self, value):

        if value is None:

            return value

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Phone number cannot be empty."
            )

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
    # Create User
    #
    # PatientProfile is NOT created here.
    #
    # patients/signals.py automatically creates it
    # after CustomUser is successfully created.
    # ======================================================

    def create(self, validated_data):

        user = CustomUser.objects.create_user(
            **validated_data,
            role="patient",
        )

        return user


# ==========================================================
# User Settings Serializer
#
# GET:
# /api/accounts/settings/
#
# PATCH:
# /api/accounts/settings/
# ==========================================================

class UserSettingsSerializer(
    serializers.ModelSerializer
):

    full_name = serializers.SerializerMethodField()

    class Meta:

        model = CustomUser

        fields = [

            "id",

            "username",

            "email",

            "phone",

            "first_name",

            "last_name",

            "full_name",

            "role",

            "is_verified",

            "created_at",

            "updated_at",

        ]

        read_only_fields = [

            "id",

            "full_name",

            "role",

            "is_verified",

            "created_at",

            "updated_at",

        ]

    # ======================================================
    # Full Name
    # ======================================================

    def get_full_name(self, obj):

        full_name = obj.get_full_name()

        if full_name:

            return full_name

        return obj.username

    # ======================================================
    # Username Validation
    # ======================================================

    def validate_username(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        return value

    # ======================================================
    # Email Validation
    # ======================================================

    def validate_email(self, value):

        value = value.strip().lower()

        if not value:

            raise serializers.ValidationError(
                "Email cannot be empty."
            )

        return value

    # ======================================================
    # Phone Validation
    # ======================================================

    def validate_phone(self, value):

        if value is None:

            return value

        value = value.strip()

        if not value:

            return None

        if not value.isdigit():

            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(value) < 10 or len(value) > 15:

            raise serializers.ValidationError(
                "Phone number must contain 10 to 15 digits."
            )

        return value


# ==========================================================
# Change Password Serializer
#
# POST:
# /api/accounts/change-password/
# ==========================================================

class ChangePasswordSerializer(
    serializers.Serializer
):

    current_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )

    confirm_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    # ======================================================
    # Validate Password
    # ======================================================

    def validate(self, attrs):

        user = self.context[
            "request"
        ].user

        current_password = attrs.get(
            "current_password"
        )

        new_password = attrs.get(
            "new_password"
        )

        confirm_password = attrs.get(
            "confirm_password"
        )

        # --------------------------------------------------
        # Check Current Password
        # --------------------------------------------------

        if not user.check_password(
            current_password
        ):

            raise serializers.ValidationError(
                {
                    "current_password":
                    "Current password is incorrect."
                }
            )

        # --------------------------------------------------
        # Check New Password Match
        # --------------------------------------------------

        if new_password != confirm_password:

            raise serializers.ValidationError(
                {
                    "confirm_password":
                    "New passwords do not match."
                }
            )

        # --------------------------------------------------
        # Same Password Check
        # --------------------------------------------------

        if current_password == new_password:

            raise serializers.ValidationError(
                {
                    "new_password":
                    "New password must be different "
                    "from your current password."
                }
            )

        return attrs


# ==========================================================
# Custom Login Token Serializer
# ==========================================================

class CustomTokenObtainPairSerializer(
    TokenObtainPairSerializer
):

    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        # --------------------------------------------------
        # Add User Information to JWT
        # --------------------------------------------------

        token["user_id"] = user.id

        token["username"] = user.username

        token["role"] = user.role

        return token

    # ======================================================
    # Login Response
    # ======================================================

    def validate(self, attrs):

        data = super().validate(attrs)

        # --------------------------------------------------
        # Return User Information
        # --------------------------------------------------

        data["user"] = {

            "id":
                self.user.id,

            "username":
                self.user.username,

            "first_name":
                self.user.first_name,

            "last_name":
                self.user.last_name,

            "email":
                self.user.email,

            "role":
                self.user.role,

        }

        return data


# ==========================================================
# Admin User Serializer
#
# Used by:
# - Admin User Management
# - Admin User List
# - User Details
# ==========================================================

class AdminUserSerializer(
    serializers.ModelSerializer
):

    full_name = serializers.SerializerMethodField()

    class Meta:

        model = CustomUser

        fields = [

            "id",

            "username",

            "first_name",

            "last_name",

            "full_name",

            "email",

            "phone",

            "role",

            "is_active",

            "is_verified",

            "date_joined",

            "created_at",

            "updated_at",

        ]

        read_only_fields = [

            "id",

            "full_name",

            "date_joined",

            "created_at",

            "updated_at",

        ]

    # ======================================================
    # Full Name
    # ======================================================

    def get_full_name(self, obj):

        full_name = obj.get_full_name()

        if full_name:

            return full_name

        return obj.username