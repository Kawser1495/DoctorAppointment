from django.db.models import Avg
from rest_framework import serializers

from .models import (
    Doctor,
    Department,
    DoctorSchedule,
    TimeSlot,
    DoctorRating,
    HealthTip,
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
            "is_active",
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
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()

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

            "gender",
            "date_of_birth",
            "address",

            # Approval
            "doctor_status",
            "doctor_rejection_reason",

            # Department
            "department",
            "department_name",

            # Professional
            "specialization",
            "qualification",
            "license_number",
            "experience",
            "consultation_fee",
            "biography",

            # Image
            "profile_image",

            # Availability
            "is_available",

            # Schedule
            "schedule_count",
            "average_rating",
            "rating_count",

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

            "gender",
            "date_of_birth",
            "address",

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

    def get_average_rating(self, obj):
        result = obj.ratings.aggregate(average=Avg("rating"))
        return round(result["average"] or 0, 1)

    def get_rating_count(self, obj):
        return obj.ratings.count()


class DoctorRatingSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()
    doctor = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        required=False,
    )

    class Meta:
        model = DoctorRating
        fields = [
            "id",
            "doctor",
            "patient",
            "appointment",
            "patient_name",
            "rating",
            "review",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "patient",
            "patient_name",
            "created_at",
        ]

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name().strip() or obj.patient.user.username

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5 stars.")
        return value

    def validate(self, attrs):
        appointment = attrs.get("appointment")
        request = self.context.get("request")
        patient = getattr(request.user, "patient_profile", None) if request else None

        if not patient:
            raise serializers.ValidationError({
                "appointment": "Only patients can submit doctor ratings."
            })

        if appointment and appointment.patient_id != patient.id:
            raise serializers.ValidationError({
                "appointment": "You can only rate your own appointment."
            })

        doctor = attrs.get("doctor") or (appointment.doctor if appointment else None)
        if doctor is None:
            raise serializers.ValidationError({
                "doctor": "A doctor is required to submit a rating."
            })

        if appointment and appointment.status not in {"Pending", "Confirmed", "Completed"}:
            raise serializers.ValidationError({
                "appointment": "Cancelled, rejected, or missed appointments cannot be rated."
            })

        if appointment and DoctorRating.objects.filter(appointment=appointment).exists():
            raise serializers.ValidationError({
                "appointment": "This appointment has already been rated."
            })

        if DoctorRating.objects.filter(doctor=doctor, patient=patient).exists():
            raise serializers.ValidationError({
                "doctor": "You have already reviewed this doctor."
            })

        return attrs

    def validate_appointment(self, value):
        return value

    def create(self, validated_data):
        appointment = validated_data.get("appointment")
        request = self.context.get("request")
        patient = getattr(request.user, "patient_profile", None) if request else None

        validated_data["doctor"] = validated_data.get("doctor") or appointment.doctor
        validated_data["patient"] = patient

        return super().create(validated_data)


class HealthTipSerializer(serializers.ModelSerializer):

    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = HealthTip
        fields = ["id", "doctor", "doctor_name", "title", "content", "category", "is_published", "created_at", "updated_at"]
        read_only_fields = ["id", "doctor", "doctor_name", "created_at", "updated_at"]

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name().strip() or obj.doctor.user.username


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

    time_range = serializers.CharField(
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
            "time_range",
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


class DoctorTimeSlotUpdateSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = TimeSlot

        fields = [
            "max_patient",
            "is_active",
        ]

    def validate_max_patient(self, value):

        if not 1 <= value <= 100:

            raise serializers.ValidationError(
                "Maximum patients must be between 1 and 100."
            )

        booked_count = getattr(
            self.instance,
            "booked_count",
            0,
        )

        if value < booked_count:

            raise serializers.ValidationError(
                "Maximum patients cannot be lower than booked patients."
            )

        return value

    def validate(self, attrs):

        if (
            attrs.get("is_active") is True
            and not self.instance.schedule.is_active
        ):

            raise serializers.ValidationError({
                "is_active":
                    "Activate the parent schedule before enabling this slot."
            })

        return attrs


# ==========================================================
# Doctor Schedule Serializer
# ==========================================================

class DoctorScheduleSerializer(
    serializers.ModelSerializer
):

    doctor = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

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

    def validate(self, attrs):

        start_time = attrs.get(
            "start_time",
            getattr(self.instance, "start_time", None),
        )

        end_time = attrs.get(
            "end_time",
            getattr(self.instance, "end_time", None),
        )

        if start_time and end_time and start_time >= end_time:

            raise serializers.ValidationError({
                "end_time":
                    "End time must be later than start time."
            })

        duration = attrs.get(
            "slot_duration_minutes",
            getattr(self.instance, "slot_duration_minutes", None),
        )

        if duration is not None and not 5 <= duration <= 120:

            raise serializers.ValidationError({
                "slot_duration_minutes":
                    "Slot duration must be between 5 and 120 minutes."
            })

        max_patients = attrs.get(
            "max_patient_per_slot",
            getattr(self.instance, "max_patient_per_slot", None),
        )

        if max_patients is not None and not 1 <= max_patients <= 100:

            raise serializers.ValidationError({
                "max_patient_per_slot":
                    "Maximum patients per slot must be between 1 and 100."
            })

        request = self.context.get("request")
        doctor = getattr(request.user, "doctor_profile", None)
        day = attrs.get(
            "day",
            getattr(self.instance, "day", None),
        )

        if doctor and day:

            duplicate_query = DoctorSchedule.objects.filter(
                doctor=doctor,
                day=day,
            )

            if self.instance:
                duplicate_query = duplicate_query.exclude(
                    pk=self.instance.pk
                )

            if duplicate_query.exists():

                raise serializers.ValidationError({
                    "day":
                        "You already have a schedule for this day."
                })

        return attrs


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

            "gender",
            "date_of_birth",
            "address",

            # Doctor
            "department",
            "specialization",
            "qualification",
            "license_number",
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