from decimal import Decimal

import requests
from django.conf import settings


SANDBOX_INIT_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
LIVE_INIT_URL = "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
SANDBOX_VALIDATE_URL = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
LIVE_VALIDATE_URL = "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"


def _setting_ready():
    return bool(settings.SSLCOMMERZ_STORE_ID and settings.SSLCOMMERZ_STORE_PASSWORD)


def _init_url():
    return SANDBOX_INIT_URL if settings.SSLCOMMERZ_IS_SANDBOX else LIVE_INIT_URL


def _validate_url():
    return SANDBOX_VALIDATE_URL if settings.SSLCOMMERZ_IS_SANDBOX else LIVE_VALIDATE_URL


def create_session(payment, request):
    if not _setting_ready():
        raise ValueError("SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD are required.")

    backend_url = settings.SSLCOMMERZ_BACKEND_URL.rstrip("/")
    frontend_url = settings.SSLCOMMERZ_FRONTEND_URL.rstrip("/")
    user = payment.patient.user
    payload = {
        "store_id": settings.SSLCOMMERZ_STORE_ID,
        "store_passwd": settings.SSLCOMMERZ_STORE_PASSWORD,
        "total_amount": str(payment.amount),
        "currency": "BDT",
        "tran_id": payment.transaction_id,
        "success_url": f"{backend_url}/api/payments/sslcommerz/success/",
        "fail_url": f"{backend_url}/api/payments/sslcommerz/fail/",
        "cancel_url": f"{backend_url}/api/payments/sslcommerz/cancel/",
        "ipn_url": f"{backend_url}/api/payments/sslcommerz/ipn/",
        "cus_name": user.get_full_name() or user.username,
        "cus_email": user.email or "customer@example.com",
        "cus_add1": "Dhaka",
        "cus_city": "Dhaka",
        "cus_postcode": "1200",
        "cus_country": "Bangladesh",
        "cus_phone": user.phone or "01700000000",
        "product_name": payment.payment_type,
        "product_category": "Healthcare",
        "shipping_method": "NO",
        "product_profile": "general",
    }
    response = requests.post(_init_url(), data=payload, timeout=20)
    response.raise_for_status()
    data = response.json()
    if data.get("status") != "SUCCESS" or not data.get("GatewayPageURL"):
        raise ValueError(data.get("failedreason") or "SSLCOMMERZ session creation failed.")
    return data


def validate_transaction(val_id):
    if not _setting_ready() or not val_id:
        return {}
    response = requests.get(
        _validate_url(),
        params={
            "val_id": val_id,
            "store_id": settings.SSLCOMMERZ_STORE_ID,
            "store_passwd": settings.SSLCOMMERZ_STORE_PASSWORD,
            "format": "json",
        },
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


def is_valid_payment(data, payment):
    status = str(data.get("status", "")).upper()
    try:
        amount = Decimal(str(data.get("amount")))
    except (TypeError, ValueError):
        return False
    return (
        status in {"VALID", "VALIDATED"}
        and data.get("tran_id") == payment.transaction_id
        and data.get("currency") == "BDT"
        and amount == payment.amount
    )