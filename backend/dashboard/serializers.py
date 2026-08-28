from rest_framework import serializers


class DashboardSerializer(serializers.Serializer):

    # ==========================================================
    # Patient / Admin / General Statistics
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


    # ==========================================================
    # Appointment Statistics
    # ==========================================================

    total_appointments = serializers.IntegerField(
        required=False
    )

    pending_appointments = serializers.IntegerField(
        required=False
    )

    confirmed_appointments = serializers.IntegerField(
        required=False
    )

    completed_appointments = serializers.IntegerField(
        required=False
    )

    cancelled_appointments = serializers.IntegerField(
        required=False
    )


    # ==========================================================
    # Diagnostic Booking Statistics
    # ==========================================================

    total_diagnostic_bookings = serializers.IntegerField(
        required=False
    )

    pending_diagnostic_bookings = serializers.IntegerField(
        required=False
    )

    confirmed_diagnostic_bookings = serializers.IntegerField(
        required=False
    )

    completed_diagnostic_bookings = serializers.IntegerField(
        required=False
    )

    cancelled_diagnostic_bookings = serializers.IntegerField(
        required=False
    )


    # ==========================================================
    # Diagnostic Tests
    # ==========================================================

    total_diagnostic_tests = serializers.IntegerField(
        required=False
    )


    # ==========================================================
    # Payment Statistics
    # ==========================================================

    total_payments = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False
    )

    paid_payments = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False
    )

    pending_payments = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False
    )


    # ==========================================================
    # Other Statistics
    # ==========================================================

    total_reports = serializers.IntegerField(
        required=False
    )

    family_members = serializers.IntegerField(
        required=False
    )


    # ==========================================================
    # Notification Statistics
    # ==========================================================

    total_notifications = serializers.IntegerField(
        required=False
    )

    unread_notifications = serializers.IntegerField(
        required=False
    )


    # ==========================================================
    # Dashboard Objects / Lists
    # ==========================================================

    upcoming_appointment = serializers.JSONField(
        required=False,
        allow_null=True
    )

    recent_appointments = serializers.ListField(
        required=False
    )

    recent_diagnostic_bookings = serializers.ListField(
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

    upcoming_appointments = serializers.ListField(
        required=False
    )