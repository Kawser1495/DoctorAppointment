from rest_framework import serializers


class DashboardSerializer(serializers.Serializer):

    # ==========================================================
    # Common Statistics
    # ==========================================================

    total_appointments = serializers.IntegerField()

    pending_appointments = serializers.IntegerField()

    confirmed_appointments = serializers.IntegerField()

    completed_appointments = serializers.IntegerField()

    cancelled_appointments = serializers.IntegerField()

    # ==========================================================
    # Patient Statistics
    # ==========================================================

    total_payments = serializers.DecimalField(
    max_digits=12,
    decimal_places=2,
    required=False,
    )

    paid_payments = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
    )

    pending_payments = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
    )

    total_reports = serializers.IntegerField()

    family_members = serializers.IntegerField()

    total_notifications = serializers.IntegerField()

    unread_notifications = serializers.IntegerField()

    # ==========================================================
    # Admin Statistics
    # ==========================================================

    total_patients = serializers.IntegerField(
        required=False
    )

    total_doctors = serializers.IntegerField(
        required=False
    )

    total_departments = serializers.IntegerField(
        required=False
    )

    total_diagnostic_tests = serializers.IntegerField(
        required=False
    )

    # ==========================================================
    # Recent / Upcoming Data
    # ==========================================================

    upcoming_appointment = serializers.JSONField(
        allow_null=True,
        required=False,
    )

    recent_appointments = serializers.ListField(
        required=False
    )

    recent_payments = serializers.ListField(
        required=False
    )

    recent_notifications = serializers.ListField(
        required=False
    )

    today_appointments = serializers.ListField(
        required=False
    )