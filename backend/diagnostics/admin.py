from django.contrib import admin

from .models import (
    TestCategory,
    DiagnosticTest,
    TestBooking,
)


@admin.register(TestCategory)
class TestCategoryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
    )


@admin.register(DiagnosticTest)
class DiagnosticTestAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "category",
        "price",
        "duration",
        "is_available",
    )

    list_filter = (
        "is_available",
        "category",
    )

    search_fields = (
        "name",
        "description",
    )


@admin.register(TestBooking)
class TestBookingAdmin(admin.ModelAdmin):

    list_display = (
        "booking_number",
        "patient",
        "family_member",
        "diagnostic_test",
        "booking_date",
        "booking_time",
        "status",
    )

    list_filter = (
        "status",
        "booking_date",
        "diagnostic_test",
    )

    search_fields = (
        "booking_number",
        "patient__user__username",
        "patient__user__first_name",
        "patient__user__last_name",
        "diagnostic_test__name",
    )

    readonly_fields = (
        "booking_number",
        "created_at",
        "updated_at",
    )