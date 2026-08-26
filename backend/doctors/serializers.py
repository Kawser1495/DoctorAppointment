from rest_framework import serializers

from .models import (
    Doctor,
    Department,
    TimeSlot,
)


# ==========================================================
# Department Serializer
# ==========================================================

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:

        model = Department

        fields = [
            "id",
            "name",
            "description",
        ]


# ==========================================================
# Doctor Serializer
# ==========================================================

class DoctorSerializer(serializers.ModelSerializer):

    doctor_name = serializers.SerializerMethodField(
        read_only=True
    )

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    profile_image = serializers.ImageField(
        required=False,
        allow_null=True,
        use_url=True,
        read_only=True,
    )


    class Meta:

        model = Doctor

        fields = [
            "id",

            # Doctor Basic Information
            "doctor_name",

            # Department
            "department",
            "department_name",

            # Professional Information
            "specialization",
            "qualification",
            "experience",
            "consultation_fee",
            "biography",

            # Doctor Profile Image
            "profile_image",

            # Availability
            "is_available",
        ]


    # ======================================================
    # Doctor Full Name
    # ======================================================

    def get_doctor_name(self, obj):

        full_name = obj.user.get_full_name().strip()

        if full_name:

            return f"Dr. {full_name}"

        return f"Dr. {obj.user.username}"


# ==========================================================
# Time Slot Serializer
# ==========================================================

class TimeSlotSerializer(serializers.ModelSerializer):

    is_full = serializers.BooleanField(
        read_only=True
    )

    remaining_seats = serializers.SerializerMethodField(
        read_only=True
    )


    class Meta:

        model = TimeSlot

        fields = [
            "id",
            "slot_time",
            "booked_count",
            "max_patient",
            "remaining_seats",
            "is_full",
        ]


    # ======================================================
    # Remaining Seats
    # ======================================================

    def get_remaining_seats(self, obj):

        remaining = obj.max_patient - obj.booked_count

        return max(remaining, 0)