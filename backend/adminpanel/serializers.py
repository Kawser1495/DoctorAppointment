from rest_framework import serializers


class AdminDashboardSerializer(serializers.Serializer):

    # ==========================================
    # Users
    # ==========================================

    total_patients = serializers.IntegerField()

    total_doctors = serializers.IntegerField()

    total_receptionists = serializers.IntegerField()

    total_users = serializers.IntegerField()

    # ==========================================
    # Appointments
    # ==========================================

    total_appointments = serializers.IntegerField()

    pending_appointments = serializers.IntegerField()

    confirmed_appointments = serializers.IntegerField()

    completed_appointments = serializers.IntegerField()

    cancelled_appointments = serializers.IntegerField()

    rejected_appointments = serializers.IntegerField()

    no_show_appointments = serializers.IntegerField()

    # ==========================================
    # Diagnostic Tests
    # ==========================================

    total_test_categories = serializers.IntegerField()

    total_diagnostic_tests = serializers.IntegerField()

    total_test_bookings = serializers.IntegerField()

    pending_test_bookings = serializers.IntegerField()

    confirmed_test_bookings = serializers.IntegerField()

    completed_test_bookings = serializers.IntegerField()

    cancelled_test_bookings = serializers.IntegerField()

    # ==========================================
    # Payments
    # ==========================================

    total_payments = serializers.IntegerField()

    paid_payments = serializers.IntegerField()

    pending_payments = serializers.IntegerField()

    failed_payments = serializers.IntegerField()

    refunded_payments = serializers.IntegerField()

    total_revenue = serializers.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    # ==========================================
    # Reports
    # ==========================================

    total_reports = serializers.IntegerField()

    # ==========================================
    # Notifications
    # ==========================================

    total_notifications = serializers.IntegerField()

    unread_notifications = serializers.IntegerField()