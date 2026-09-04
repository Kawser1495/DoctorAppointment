import re
import uuid

from django.db import transaction

from rest_framework import serializers

from .models import CustomUser

from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
)

from doctors.models import (
    Doctor,
    Department,
    DoctorSchedule,
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
# ==========================================================
# Doctor Schedule Registration Serializer
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

    # ======================================================
    # Validate Schedule Time
    # ======================================================

    def validate(self, attrs):

        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        if start_time and end_time:

            if start_time >= end_time:

                raise serializers.ValidationError(
                    {
                        "end_time":
                        "End time must be later than start time."
                    }
                )

        slot_duration = attrs.get(
            "slot_duration_minutes",
            20
        )

        max_patient = attrs.get(
            "max_patient_per_slot",
            1
        )

        if slot_duration <= 0:

            raise serializers.ValidationError(
                {
                    "slot_duration_minutes":
                    "Slot duration must be greater than zero."
                }
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

class RegisterSerializer(
    serializers.ModelSerializer
):

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
    #
    # These fields are not directly saved in CustomUser.
    # They are sent to PatientProfile if those fields exist.
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

    schedules = DoctorScheduleRegistrationSerializer(
        many=True,
        required=False,
    )

    class Meta:

        model = CustomUser

        fields = [

            # User information
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
    # Name Validation
    # ======================================================

    def validate_first_name(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "First name cannot be empty."
            )

        value = " ".join(value.split())

        if len(value) < 2:

            raise serializers.ValidationError(
                "First name must contain at least 2 characters."
            )

        if not re.match(
            r"^[A-Za-zÀ-ÖØ-öø-ÿ.\-_'\s]+$",
            value
        ):

            raise serializers.ValidationError(
                "First name contains invalid characters."
            )

        return value

    # ======================================================
    # Last Name Validation
    # ======================================================

    def validate_last_name(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Last name cannot be empty."
            )

        value = " ".join(value.split())

        if len(value) < 2:

            raise serializers.ValidationError(
                "Last name must contain at least 2 characters."
            )

        if not re.match(
            r"^[A-Za-zÀ-ÖØ-öø-ÿ.\-_'\s]+$",
            value
        ):

            raise serializers.ValidationError(
                "Last name contains invalid characters."
            )

        return value

    # ======================================================
    # Email Validation
    # ======================================================

    def validate_email(self, value):

        value = value.strip().lower()

        if CustomUser.objects.filter(
            email__iexact=value
        ).exists():

            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

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
    # Password Validation
    # ======================================================

    def validate(self, attrs):

        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")
        role = attrs.get("role", "patient")

        # --------------------------------------------------
        # Password Match
        # --------------------------------------------------

        if password != confirm_password:

            raise serializers.ValidationError(
                {
                    "confirm_password":
                    "Passwords do not match."
                }
            )

        # --------------------------------------------------
        # Doctor Required Information
        # --------------------------------------------------

        if role == "doctor":

            department = attrs.get("department")
            specialization = attrs.get("specialization")
            qualification = attrs.get("qualification")
            schedules = attrs.get("schedules", [])

            if not department:

                raise serializers.ValidationError(
                    {
                        "department":
                        "Department is required for doctors."
                    }
                )

            if not specialization:

                raise serializers.ValidationError(
                    {
                        "specialization":
                        "Specialization is required for doctors."
                    }
                )

            if not qualification:

                raise serializers.ValidationError(
                    {
                        "qualification":
                        "Qualification is required for doctors."
                    }
                )

            if not schedules:

                raise serializers.ValidationError(
                    {
                        "schedules":
                        "At least one weekly schedule is required."
                    }
                )

        return attrs

    # ======================================================
    # Generate Unique Username
    #
    # Same name is allowed.
    # Username is generated automatically.
    # ======================================================

    def generate_unique_username(self, role):

        prefix = (
            "doctor"
            if role == "doctor"
            else "patient"
        )

        while True:

            username = (
                f"{prefix}_"
                f"{uuid.uuid4().hex[:10]}"
            )

            if not CustomUser.objects.filter(
                username=username
            ).exists():

                return username

    # ======================================================
    # Create User / Doctor / Schedule
    # ======================================================

    @transaction.atomic
    def create(self, validated_data):

        # --------------------------------------------------
        # Extract Nested / Extra Data
        # --------------------------------------------------

        role = validated_data.pop(
            "role",
            "patient"
        )

        confirm_password = validated_data.pop(
            "confirm_password",
            None
        )

        schedules_data = validated_data.pop(
            "schedules",
            []
        )

        # --------------------------------------------------
        # Patient Profile Data
        # --------------------------------------------------

        patient_profile_data = {

            "gender": validated_data.pop(
                "gender",
                None
            ),

            "date_of_birth": validated_data.pop(
                "date_of_birth",
                None
            ),

            "blood_group": validated_data.pop(
                "blood_group",
                None
            ),

            "address": validated_data.pop(
                "address",
                None
            ),

        }

        # --------------------------------------------------
        # Doctor Data
        # --------------------------------------------------

        doctor_data = {

            "department": validated_data.pop(
                "department",
                None
            ),

            "specialization": validated_data.pop(
                "specialization",
                ""
            ),

            "qualification": validated_data.pop(
                "qualification",
                ""
            ),

            "experience": validated_data.pop(
                "experience",
                0
            ),

            "consultation_fee": validated_data.pop(
                "consultation_fee",
                0
            ),

            "biography": validated_data.pop(
                "biography",
                ""
            ),

        }

        # --------------------------------------------------
        # Generate System Username
        # --------------------------------------------------

        username = self.generate_unique_username(
            role
        )

        # --------------------------------------------------
        # Create Patient
        # --------------------------------------------------

        if role == "patient":

            user = CustomUser.objects.create_user(

                username=username,

                first_name=validated_data.pop(
                    "first_name"
                ),

                last_name=validated_data.pop(
                    "last_name"
                ),

                email=validated_data.pop(
                    "email"
                ),

                phone=validated_data.pop(
                    "phone"
                ),

                password=validated_data.pop(
                    "password"
                ),

                role="patient",

                is_active=True,

                is_verified=True,

                doctor_status="not_applicable",

            )

            # --------------------------------------------------
            # PatientProfile Signal
            # --------------------------------------------------
            #
            # patients/signals.py should automatically create
            # the PatientProfile after user creation.
            #
            # If the profile relation and fields exist,
            # update them safely.
            # --------------------------------------------------

            patient_profile = getattr(
                user,
                "patient_profile",
                None
            )

            if patient_profile:

                for field, value in patient_profile_data.items():

                    if hasattr(
                        patient_profile,
                        field
                    ) and value not in [None, ""]:

                        setattr(
                            patient_profile,
                            field,
                            value
                        )

                patient_profile.save()

            return user

        # --------------------------------------------------
        # Create Doctor
        # --------------------------------------------------

        user = CustomUser.objects.create_user(

            username=username,

            first_name=validated_data.pop(
                "first_name"
            ),

            last_name=validated_data.pop(
                "last_name"
            ),

            email=validated_data.pop(
                "email"
            ),

            phone=validated_data.pop(
                "phone"
            ),

            password=validated_data.pop(
                "password"
            ),

            role="doctor",

            # Pending doctor can log in and see
            # "Waiting for admin approval".
            is_active=True,

            is_verified=False,

            doctor_status="pending",

        )

        # --------------------------------------------------
        # Create Doctor Profile
        # --------------------------------------------------

        doctor = Doctor.objects.create(

            user=user,

            department=doctor_data["department"],

            specialization=doctor_data["specialization"],

            qualification=doctor_data["qualification"],

            experience=doctor_data["experience"],

            consultation_fee=doctor_data["consultation_fee"],

            biography=doctor_data["biography"],

        )

        # --------------------------------------------------
        # Create Weekly Schedules
        # --------------------------------------------------

        for schedule_data in schedules_data:

            DoctorSchedule.objects.create(

                doctor=doctor,

                **schedule_data

            )

        return user