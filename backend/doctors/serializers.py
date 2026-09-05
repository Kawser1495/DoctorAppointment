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

    def get_doctor_count(self, obj):

        return obj.doctors.filter(
            is_available=True,
            user__is_active=True,
            user__role="doctor",
            approval_status="approved",
        ).count()


# ==========================================================
# Doctor Serializer
# ==========================================================

class DoctorSerializer(
    serializers.ModelSerializer
):

    doctor_name = serializers.SerializerMethodField()

    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True,
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

    # ======================================================
    # Approval Information
    # ======================================================

    doctor_status = serializers.CharField(
        source="approval_status",
        read_only=True,
    )

    doctor_rejection_reason = serializers.CharField(
        source="rejection_reason",
        read_only=True,
        allow_null=True,
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

    schedule_count = serializers.SerializerMethodField()

    class Meta:

        model = Doctor

        fields = [

            "id",

            # User
            "doctor_name",
            "first_name",
            "last_name",
            "username",
            "email",
            "phone",

            # Approval
            "doctor_status",
            "doctor_rejection_reason",

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

            # Schedule
            "schedule_count",

            # Timestamp
            "created_at",
            "updated_at",

        ]

        read_only_fields = [

            "id",

            "doctor_name",
            "first_name",
            "last_name",
            "username",
            "email",
            "phone",

            "doctor_status",
            "doctor_rejection_reason",

            "department_name",
            "profile_image",
            "schedule_count",

            "created_at",
            "updated_at",

        ]

    # ======================================================
    # Doctor Full Name
    # ======================================================

    def get_doctor_name(self, obj):

        full_name = (
            obj.user
            .get_full_name()
            .strip()
        )

        if full_name:

            if full_name.lower().startswith("dr."):

                return full_name

            return f"Dr. {full_name}"

        username = obj.user.username

        if username.lower().startswith("dr."):

            return username

        return f"Dr. {username}"

    # ======================================================
    # Schedule Count
    # ======================================================

    def get_schedule_count(self, obj):

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

    remaining_seats = serializers.IntegerField(
        read_only=True
    )

    doctor_name = serializers.SerializerMethodField()

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

        read_only_fields = [

            "id",
            "doctor_name",
            "day",
            "booked_count",
            "remaining_seats",
            "is_full",

        ]

    # ======================================================
    # Doctor Name
    # ======================================================

    def get_doctor_name(self, obj):

        full_name = (
            obj.schedule.doctor.user
            .get_full_name()
            .strip()
        )

        if full_name:

            if full_name.lower().startswith("dr."):

                return full_name

            return f"Dr. {full_name}"

        return obj.schedule.doctor.user.username


# ==========================================================
# Doctor Schedule Serializer
# ==========================================================

class DoctorScheduleSerializer(
    serializers.ModelSerializer
):

    doctor_name = serializers.SerializerMethodField()

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

        read_only_fields = [

            "id",
            "doctor_name",
            "slots",

        ]

    # ======================================================
    # Doctor Name
    # ======================================================

    def get_doctor_name(self, obj):

        full_name = (
            obj.doctor.user
            .get_full_name()
            .strip()
        )

        if full_name:

            if full_name.lower().startswith("dr."):

                return full_name

            return f"Dr. {full_name}"

        return obj.doctor.user.username


# ==========================================================
# Doctor Profile Update Serializer
# ==========================================================

class DoctorProfileUpdateSerializer(
    serializers.ModelSerializer
):

    first_name = serializers.CharField(
        source="user.first_name",
        required=False,
        allow_blank=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        required=False,
        allow_blank=True,
    )

    email = serializers.EmailField(
        source="user.email",
        required=False,
    )

    phone = serializers.CharField(
        source="user.phone",
        required=False,
        allow_blank=True,
    )

    class Meta:

        model = Doctor

        fields = [

            # User
            "first_name",
            "last_name",
            "email",
            "phone",

            # Doctor
            "department",
            "specialization",
            "qualification",
            "experience",
            "consultation_fee",
            "biography",
            "profile_image",
            "is_available",

        ]

    # ======================================================
    # Experience Validation
    # ======================================================

    def validate_experience(self, value):

        if value < 0:

            raise serializers.ValidationError(
                "Experience cannot be negative."
            )

        return value

    # ======================================================
    # Consultation Fee Validation
    # ======================================================

    def validate_consultation_fee(self, value):

        if value < 0:

            raise serializers.ValidationError(
                "Consultation fee cannot be negative."
            )

        return value

    # ======================================================
    # Update Doctor Profile
    # ======================================================

    def update(self, instance, validated_data):

        user = instance.user

        user_data = validated_data.pop(
            "user",
            {}
        )

        for attr, value in user_data.items():

            setattr(
                user,
                attr,
                value
            )

        user.save()

        for attr, value in validated_data.items():

            setattr(
                instance,
                attr,
                value
            )

        instance.save()

        return instance