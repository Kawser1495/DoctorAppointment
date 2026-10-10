from rest_framework import serializers


class DashboardSerializer(serializers.Serializer):

    # ==================================================
    # Appointment Statistics
    # ==================================================

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


    # ==================================================
    # Diagnostic Booking Statistics
    # ==================================================

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


    # ==================================================
    # Payment Statistics
    # ==================================================

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


    # ==================================================
    # Other Statistics
    # ==================================================

    total_reports = serializers.IntegerField(
        required=False
    )

    family_members = serializers.IntegerField(
        required=False
    )

    total_notifications = serializers.IntegerField(
        required=False
    )

    unread_notifications = serializers.IntegerField(
        required=False
    )


    # ==================================================
    # Dashboard Lists
    # ==================================================

    upcoming_appointment = serializers.DictField(
        required=False,
        allow_null=True
    )

    recent_appointments = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    # গুরুত্বপূর্ণ: Diagnostic Booking List
    recent_diagnostic_bookings = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    recent_payments = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    recent_notifications = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )


    # ==================================================
    # Doctor Dashboard
    # ==================================================

    today_appointments = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    upcoming_appointments = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    today_appointments = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    receptionist_patients = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    receptionist_doctors = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    pending_payment_total = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False
    )

    pending_payment_count = serializers.IntegerField(required=False)

    today_diagnostic_bookings = serializers.IntegerField(required=False)
    today_appointment_count = serializers.IntegerField(required=False)
    today_pending_appointment_count = serializers.IntegerField(required=False)
    appointment_overview = serializers.DictField(required=False)
    payment_overview = serializers.DictField(required=False)
    total_revenue = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        required=False,
    )
    payment_history_count = serializers.IntegerField(required=False)
    payment_history_records = serializers.ListField(
        child=serializers.DictField(),
        required=False,
    )
    pending_payment_records = serializers.ListField(
        child=serializers.DictField(),
        required=False,
    )
    receptionist_appointment_serials = serializers.ListField(
        child=serializers.DictField(),
        required=False,
    )
    unread_notifications = serializers.IntegerField(required=False)


    # ==================================================
    # Admin Dashboard
    # ==================================================

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
    
    # ==================================================
# Admin Dashboard Serializer
# ==================================================

class AdminDashboardSerializer(serializers.Serializer):

    # ==================================================
    # Patient & Doctor Statistics
    # ==================================================

    total_patients = serializers.IntegerField(
        required=False,
        default=0
    )

    total_doctors = serializers.IntegerField(
        required=False,
        default=0
    )

    pending_doctor_requests = serializers.IntegerField(
        required=False,
        default=0
    )

    approved_doctors = serializers.IntegerField(
        required=False,
        default=0
    )


    # ==================================================
    # Appointment Statistics
    # ==================================================

    total_appointments = serializers.IntegerField(
        required=False,
        default=0
    )

    today_appointments = serializers.IntegerField(
        required=False,
        default=0
    )

    upcoming_appointments_by_doctor = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
    )

    upcoming_appointments = serializers.IntegerField(
        required=False,
        default=0
    )

    doctor_overview = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
    )

    pending_appointments = serializers.IntegerField(
        required=False,
        default=0
    )

    confirmed_appointments = serializers.IntegerField(
        required=False,
        default=0
    )

    completed_appointments = serializers.IntegerField(
        required=False,
        default=0
    )

    cancelled_appointments = serializers.IntegerField(
        required=False,
        default=0
    )

    # ==================================================
    # Payment Statistics
    # ==================================================

    total_revenue = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        default=0
    )

    pending_payments = serializers.IntegerField(
        required=False,
        default=0
    )

    paid_payments = serializers.IntegerField(
        required=False,
        default=0
    )

    refundable_payments = serializers.IntegerField(
        required=False,
        default=0
    )

    payment_history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
    )

    payment_summary = serializers.DictField(
        required=False,
        default=dict,
    )


    # ==================================================
    # Diagnostic Statistics
    # ==================================================

    total_diagnostic_bookings = serializers.IntegerField(
        required=False,
        default=0
    )

    diagnostic_status_totals = serializers.DictField(
        required=False,
        default=dict,
    )

    diagnostic_booking_history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
    )


    # ==================================================
    # Medical Report Statistics
    # ==================================================

    total_medical_reports = serializers.IntegerField(
        required=False,
        default=0
    )


    # ==================================================
    # Notification Statistics
    # ==================================================

    total_notifications = serializers.IntegerField(
        required=False,
        default=0
    )

    unread_notifications = serializers.IntegerField(
        required=False,
        default=0
    )