import re

from django.db import transaction

from rest_framework import serializers

from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
)

from .models import CustomUser

from doctors.models import (
    Doctor,
    Department,
    DoctorSchedule,
)
from notifications.models import Notification


# ==========================================================
# Common Name Validation
# ==========================================================

def validate_person_name(value, field_name):
    value = value.strip()

    if not value:
        raise serializers.ValidationError(
            f"{field_name} cannot be empty."
        )

    value = " ".join(value.split())

    if len(value) < 2:
        raise serializers.ValidationError(
            f"{field_name} must contain at least 2 characters."
        )

    if not re.match(
        r"^[A-Za-zÀ-ÖØ-öø-ÿ.\-_'\s]+$",
        value,
    ):
        raise serializers.ValidationError(
            f"{field_name} contains invalid characters."
        )

    return value


# ==========================================================
# Doctor Schedule Registration Serializer
#
# Used during doctor registration.
# ==========================================================

class DoctorScheduleRegistrationSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = DoctorSchedule

        fields = [
            "day",
            "start_time",
            "end_time",
            "slot_duration_minutes",
            "max_patient_per_slot",
        ]

        extra_kwargs = {
            "slot_duration_minutes": {
                "required": False,
                "default": 20,
            },
            "max_patient_per_slot": {
                "required": False,
                "default": 1,
            },
        }

    def validate(self, attrs):

        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        # --------------------------------------------------
        # Validate time range
        # --------------------------------------------------

        if start_time and end_time:

            if start_time >= end_time:
                raise serializers.ValidationError(
                    {
                        "end_time":
                        "End time must be later than start time."
                    }
                )

        # --------------------------------------------------
        # Validate slot duration
        # --------------------------------------------------

        slot_duration = attrs.get(
            "slot_duration_minutes",
            20,
        )

        if slot_duration <= 0:
            raise serializers.ValidationError(
                {
                    "slot_duration_minutes":
                    "Slot duration must be greater than zero."
                }
            )

        # --------------------------------------------------
        # Validate maximum patients
        # --------------------------------------------------

        max_patient = attrs.get(
            "max_patient_per_slot",
            1,
        )

        if max_patient <= 0:
            raise serializers.ValidationError(
                {
                    "max_patient_per_slot":
                    "Maximum patient per slot must be greater than zero."
                }
            )

        return attrs


# ==========================================================
# Register Serializer
#
# POST:
# /api/accounts/register/
#
# Creates:
# - CustomUser
# - Doctor
# - DoctorSchedule
#
# PatientProfile is created automatically by signal.
# ==========================================================

class RegisterSerializer(serializers.ModelSerializer):

    # ======================================================
    # Username
    #
    # User chooses username manually.
    # Username is NOT auto-generated.
    # ======================================================

    username = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False,
        trim_whitespace=True,
    )

    # ======================================================
    # Basic User Information
    # ======================================================

    first_name = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False,
        trim_whitespace=True,
    )

    last_name = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False,
        trim_whitespace=True,
    )

    email = serializers.EmailField(
        required=True,
        allow_blank=False,
    )

    phone = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )

    confirm_password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )

    # ======================================================
    # Role
    # ======================================================

    role = serializers.ChoiceField(
        choices=[
            ("patient", "Patient"),
            ("doctor", "Doctor"),
        ],
        default="patient",
        required=False,
    )

    # ======================================================
    # Patient Information
    # ======================================================

    gender = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    date_of_birth = serializers.DateField(
        required=False,
        allow_null=True,
    )

    blood_group = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    address = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    # ======================================================
    # Doctor Professional Information
    # ======================================================

    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False,
        allow_null=True,
    )

    specialization = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )

    qualification = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )

    experience = serializers.IntegerField(
        required=False,
        min_value=0,
        default=0,
    )

    consultation_fee = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        min_value=0,
        default=0,
    )

    biography = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    # ======================================================
    # Doctor Weekly Schedule
    # ======================================================

    schedules = DoctorScheduleRegistrationSerializer(
        many=True,
        required=False,
    )

    # ======================================================
    # Meta
    # ======================================================

    class Meta:
        model = CustomUser

        fields = [
            # User information
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "password",
            "confirm_password",
            "role",

            # Patient information
            "gender",
            "date_of_birth",
            "blood_group",
            "address",

            # Doctor information
            "department",
            "specialization",
            "qualification",
            "experience",
            "consultation_fee",
            "biography",
            "schedules",
        ]

    # ======================================================
    # Username Validation
    # ======================================================

    def validate_username(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        # Remove accidental multiple spaces
        value = " ".join(value.split())

        # Minimum length
        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must contain at least 3 characters."
            )

        # Maximum length
        if len(value) > 150:
            raise serializers.ValidationError(
                "Username cannot exceed 150 characters."
            )

        # Allowed characters
        if not re.match(
            r"^[A-Za-z0-9._-]+$",
            value,
        ):
            raise serializers.ValidationError(
                "Username can contain only letters, numbers, dot, underscore and hyphen."
            )

        # --------------------------------------------------
        # Duplicate username check
        #
        # Case-insensitive:
        # Kawser == kawser == KAWSER
        # --------------------------------------------------

        if CustomUser.objects.filter(
            username__iexact=value
        ).exists():

            raise serializers.ValidationError(
                "This username already exists. Please choose another username."
            )

        return value

    # ======================================================
    # First Name Validation
    # ======================================================

    def validate_first_name(self, value):

        return validate_person_name(
            value,
            "First name",
        )

    # ======================================================
    # Last Name Validation
    # ======================================================

    def validate_last_name(self, value):

        return validate_person_name(
            value,
            "Last name",
        )

    # ======================================================
    # Email Validation
    # ======================================================

    def validate_email(self, value):

        value = value.strip().lower()

        if not value:
            raise serializers.ValidationError(
                "Email cannot be empty."
            )

        if CustomUser.objects.filter(
            email__iexact=value
        ).exists():

            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    # ======================================================
    # Gender Validation
    # ======================================================

    def validate_gender(self, value):

        if value in [None, ""]:
            return value

        normalized_gender = value.strip().capitalize()

        valid_genders = {
            "Male",
            "Female",
            "Other",
        }

        if normalized_gender not in valid_genders:
            raise serializers.ValidationError(
                "Gender must be Male, Female or Other."
            )

        return normalized_gender

    # ======================================================
    # Phone Validation
    # ======================================================

    def validate_phone(self, value):

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

        if CustomUser.objects.filter(
            phone=value
        ).exists():

            raise serializers.ValidationError(
                "An account with this phone number already exists."
            )

        return value

    # ======================================================
    # Password and Role Validation
    # ======================================================

    def validate(self, attrs):

        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")
        role = attrs.get("role", "patient")

        # --------------------------------------------------
        # Password confirmation
        # --------------------------------------------------

        if password != confirm_password:

            raise serializers.ValidationError(
                {
                    "confirm_password":
                    "Passwords do not match."
                }
            )

        # ==================================================
        # Doctor Validation
        # ==================================================

        if role == "doctor":

            department = attrs.get("department")
            specialization = attrs.get("specialization")
            qualification = attrs.get("qualification")
            schedules = attrs.get("schedules", [])

            # --------------------------------------------------
            # Department
            # --------------------------------------------------

            if not department:

                raise serializers.ValidationError(
                    {
                        "department":
                        "Department is required for doctors."
                    }
                )

            # --------------------------------------------------
            # Specialization
            # --------------------------------------------------

            if (
                not specialization
                or not specialization.strip()
            ):

                raise serializers.ValidationError(
                    {
                        "specialization":
                        "Specialization is required for doctors."
                    }
                )

            # --------------------------------------------------
            # Qualification
            # --------------------------------------------------

            if (
                not qualification
                or not qualification.strip()
            ):

                raise serializers.ValidationError(
                    {
                        "qualification":
                        "Qualification is required for doctors."
                    }
                )

            # --------------------------------------------------
            # Schedule
            # --------------------------------------------------

            if not schedules:

                raise serializers.ValidationError(
                    {
                        "schedules":
                        "At least one weekly schedule is required."
                    }
                )

        return attrs

    # ======================================================
    # Create User / Doctor / Schedule
    # ======================================================

    @transaction.atomic
    def create(self, validated_data):

        # ==================================================
        # Get Role
        # ==================================================

        role = validated_data.pop(
            "role",
            "patient",
        )

        # ==================================================
        # Remove Confirm Password
        # ==================================================

        validated_data.pop(
            "confirm_password",
            None,
        )

        # ==================================================
        # Get Schedule Data
        # ==================================================

        schedules_data = validated_data.pop(
            "schedules",
            [],
        )

        # ==================================================
        # Patient Profile Data
        # ==================================================

        patient_profile_data = {
            "gender": validated_data.pop(
                "gender",
                None,
            ),

            "date_of_birth": validated_data.pop(
                "date_of_birth",
                None,
            ),

            "blood_group": validated_data.pop(
                "blood_group",
                None,
            ),

            "address": validated_data.pop(
                "address",
                None,
            ),
        }

        # ==================================================
        # Doctor Data
        # ==================================================

        doctor_data = {
            "department": validated_data.pop(
                "department",
                None,
            ),

            "specialization": validated_data.pop(
                "specialization",
                "",
            ),

            "qualification": validated_data.pop(
                "qualification",
                "",
            ),

            "experience": validated_data.pop(
                "experience",
                0,
            ),

            "consultation_fee": validated_data.pop(
                "consultation_fee",
                0,
            ),

            "biography": validated_data.pop(
                "biography",
                "",
            ),
        }

        # ==================================================
        # CREATE PATIENT
        # ==================================================

        if role == "patient":

            user = CustomUser.objects.create_user(
                **validated_data,

                # Role
                role="patient",

                # Patient account is active immediately
                is_active=True,

                # Patient is verified immediately
                is_verified=True,

                # Not applicable for patient
                doctor_status="not_applicable",
            )

            # --------------------------------------------------
            # Patient profile created by signal
            # --------------------------------------------------

            patient_profile = getattr(
                user,
                "patient_profile",
                None,
            )

            if patient_profile:

                for field, value in patient_profile_data.items():

                    if (
                        hasattr(patient_profile, field)
                        and value not in [None, ""]
                    ):

                        setattr(
                            patient_profile,
                            field,
                            value,
                        )

                patient_profile.save()

            return user

        # ==================================================
        # CREATE DOCTOR
        # ==================================================

        user = CustomUser.objects.create_user(
            **validated_data,

            # Role
            role="doctor",

            # Doctor can register but requires approval
            is_active=True,

            # Doctor is not verified before admin approval
            is_verified=False,

            # Initial doctor status
            doctor_status="pending",
        )

        for admin in CustomUser.objects.filter(
            role="admin",
            is_active=True,
        ):
            Notification.objects.create(
                user=admin,
                notification_type="Doctor Registration",
                title="New Doctor Registration",
                message=(
                    f"Dr. {user.get_full_name().strip() or user.username} "
                    "is awaiting approval."
                ),
            )

        # ==================================================
        # CREATE DOCTOR PROFILE
        # ==================================================

        doctor = Doctor.objects.create(
            user=user,

            approval_status="pending",

            department=doctor_data["department"],

            specialization=doctor_data[
                "specialization"
            ],

            qualification=doctor_data[
                "qualification"
            ],

            experience=doctor_data[
                "experience"
            ],

            consultation_fee=doctor_data[
                "consultation_fee"
            ],

            biography=doctor_data[
                "biography"
            ],
        )

        # ==================================================
        # CREATE WEEKLY SCHEDULES
        # ==================================================

        for schedule_data in schedules_data:

            DoctorSchedule.objects.create(
                doctor=doctor,
                **schedule_data,
            )

        return user


# ==========================================================
# User Settings Serializer
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

    def get_full_name(self, obj):

        full_name = obj.get_full_name()

        if full_name:
            return full_name

        return obj.username

    # ======================================================
    # Username Update Validation
    # ======================================================

    def validate_username(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        if len(value) < 3:

            raise serializers.ValidationError(
                "Username must contain at least 3 characters."
            )

        if len(value) > 150:

            raise serializers.ValidationError(
                "Username cannot exceed 150 characters."
            )

        if not re.match(
            r"^[A-Za-z0-9._-]+$",
            value,
        ):

            raise serializers.ValidationError(
                "Username can contain only letters, numbers, dot, underscore and hyphen."
            )

        # --------------------------------------------------
        # Exclude current user
        # --------------------------------------------------

        user = self.instance

        if CustomUser.objects.filter(
            username__iexact=value
        ).exclude(
            pk=user.pk
        ).exists():

            raise serializers.ValidationError(
                "This username already exists. Please choose another username."
            )

        return value

    # ======================================================
    # Email Update Validation
    # ======================================================

    def validate_email(self, value):

        value = value.strip().lower()

        if not value:

            raise serializers.ValidationError(
                "Email cannot be empty."
            )

        if CustomUser.objects.filter(
            email__iexact=value
        ).exclude(
            pk=self.instance.pk
        ).exists():

            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    # ======================================================
    # Phone Update Validation
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

        if CustomUser.objects.filter(
            phone=value
        ).exclude(
            pk=self.instance.pk
        ).exists():

            raise serializers.ValidationError(
                "An account with this phone number already exists."
            )

        return value


# ==========================================================
# Change Password Serializer
# ==========================================================

class ChangePasswordSerializer(serializers.Serializer):

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

    def validate(self, attrs):

        user = self.context["request"].user

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
        # Current password
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
        # Password confirmation
        # --------------------------------------------------

        if new_password != confirm_password:

            raise serializers.ValidationError(
                {
                    "confirm_password":
                    "New passwords do not match."
                }
            )

        # --------------------------------------------------
        # New password must be different
        # --------------------------------------------------

        if current_password == new_password:

            raise serializers.ValidationError(
                {
                    "new_password":
                    "New password must be different from your current password."
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

        token["user_id"] = user.id
        token["username"] = user.username
        token["role"] = user.role

        return token

    def validate(self, attrs):

        data = super().validate(attrs)

        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "email": self.user.email,
            "role": self.user.role,
        }

        return data


# ==========================================================
# Admin User Serializer
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

    def get_full_name(self, obj):

        full_name = obj.get_full_name()

        if full_name:
            return full_name

        return obj.username