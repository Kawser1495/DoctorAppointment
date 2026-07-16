from rest_framework import serializers
from .models import Doctor, Department, TimeSlot


# ==========================================
# Department Serializer
# ==========================================

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = [
            "id",
            "name",
            "description"
        ]


# ==========================================
# Doctor Serializer
# ==========================================

class DoctorSerializer(serializers.ModelSerializer):

    doctor_name = serializers.SerializerMethodField()

    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    class Meta:
        model = Doctor
        fields = [
            "id",
            "doctor_name",
            "department",
            "department_name",
            "specialization",
            "qualification",
            "experience",
            "consultation_fee",
            "biography",
            "profile_image",
            "is_available",
        ]

    def get_doctor_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"


# ==========================================
# Time Slot Serializer
# ==========================================

class TimeSlotSerializer(serializers.ModelSerializer):

    class Meta:
        model = TimeSlot
        fields = [
            "id",
            "slot_time",
            "booked_count",
            "max_patient",
            "is_full",
        ]