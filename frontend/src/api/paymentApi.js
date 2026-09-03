import api from "./axios";


// ==========================================================
// Create Payment
// ==========================================================

export const createPaymentApi = (data) => {

    return api.post(
        "/payments/create/",
        data
    );

};


// ==========================================================
// My Payments
// ==========================================================

export const getMyPaymentsApi = () => {

    return api.get(
        "/payments/"
    );

};


// ==========================================================
// Payment Details
// ==========================================================

export const getPaymentDetailsApi = (id) => {

    return api.get(
        `/payments/${id}/`
    );

};


// ==========================================================
// Admin Payments
// ==========================================================

export const getAdminPaymentsApi = () => {

    return api.get(
        "/payments/admin/"
    );

};


// ==========================================================
// Update Payment Status
// ==========================================================

export const updatePaymentStatusApi = (
    id,
    payment_status
) => {

    return api.patch(
        `/payments/${id}/status/`,
        {
            payment_status,
        }
    );

};


// ==========================================================
// Refund Payment
// Current backend endpoint
// PATCH /api/payments/:id/refund/
// ==========================================================

export const refundPaymentApi = (
    paymentId
) => {

    return api.patch(
        `/payments/${paymentId}/refund/`
    );

};