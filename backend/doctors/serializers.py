from rest_framework import serializers

from .models import (
    Doctor,
    Department,
    DoctorSchedule,
    TimeSlot,
)


# ==========================================================
# Department Serializer
# ==========================================================

class DepartmentSerializer(
    serializers.ModelSerializer
):

    doctor_count = serializers.SerializerMethodField()

    class Meta:

        model = Department

        fields = [
            "id",
            "name",
            "description",
            "doctor_count",
        ]

    def get_doctor_count(
        self,
        obj
    ):

        return obj.doctors.filter(
            is_available=True,
            user__is_active=True,
            user__role="doctor",
        ).count()


# ==========================================================
# Doctor Serializer
# ==========================================================

class DoctorSerializer(
    serializers.ModelSerializer
):

    doctor_name = (
        serializers.SerializerMethodField()
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    phone = serializers.CharField(
        source="user.phone",
        read_only=True,
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

    schedule_count = (
        serializers.SerializerMethodField()
    )

    class Meta:

        model = Doctor

        fields = [

            "id",

            # User
            "doctor_name",
            "username",
            "email",
            "phone",

            # Department
            "department",
            "department_name",

            # Professional
            "specialization",
            "qualification",
            "experience",
            "consultation_fee",
            "biography",

            # Image
            "profile_image",

            # Availability
            "is_available",

            # Schedule Info
            "schedule_count",

            # Timestamp
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    # ======================================================
    # Doctor Full Name
    # ======================================================

    def get_doctor_name(
        self,
        obj
    ):

        full_name = (
            obj.user
            .get_full_name()
            .strip()
        )

        if full_name:

            # Prevent Dr. Dr. Name

            if full_name.lower().startswith(
                "dr."
            ):

                return full_name

            return f"Dr. {full_name}"

        username = obj.user.username

        if username.lower().startswith(
            "dr."
        ):

            return username

        return f"Dr. {username}"

    # ======================================================
    # Schedule Count
    # ======================================================

    def get_schedule_count(
        self,
        obj
    ):

        return obj.schedules.filter(
            is_active=True
        ).count()


# ==========================================================
# Time Slot Serializer
# ==========================================================

class TimeSlotSerializer(
    serializers.ModelSerializer
):

    is_full = serializers.BooleanField(
        read_only=True
    )

    remaining_seats = (
        serializers.IntegerField(
            read_only=True
        )
    )

    doctor_name = serializers.CharField(
        source="schedule.doctor",
        read_only=True,
    )

    day = serializers.CharField(
        source="schedule.day",
        read_only=True,
    )

    class Meta:

        model = TimeSlot

        fields = [
            "id",
            "doctor_name",
            "day",
            "slot_time",
            "booked_count",
            "max_patient",
            "remaining_seats",
            "is_full",
            "is_active",
        ]


# ==========================================================
# Doctor Schedule Serializer
# ==========================================================

class DoctorScheduleSerializer(
    serializers.ModelSerializer
):

    doctor_name = serializers.CharField(
        source="doctor",
        read_only=True,
    )

    slots = TimeSlotSerializer(
        many=True,
        read_only=True,
    )

    class Meta:

        model = DoctorSchedule

        fields = [
            "id",
            "doctor",
            "doctor_name",
            "day",
            "start_time",
            "end_time",
            "slot_duration_minutes",
            "max_patient_per_slot",
            "is_active",
            "slots",
        ]