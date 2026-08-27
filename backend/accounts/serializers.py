from rest_framework import serializers

from .models import CustomUser


# ==========================================================
# Register Serializer
# ==========================================================

class RegisterSerializer(
    serializers.ModelSerializer
):

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
# User profile information
#
# PATCH:
# Update user profile information
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
                    "New password must be different from your current password."

                }

            )


        return attrs
