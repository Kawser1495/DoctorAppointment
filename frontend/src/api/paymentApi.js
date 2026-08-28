import api from "./axios";


// ==========================================================
// Create Payment
// POST /api/payments/create/
// ==========================================================

export const createPaymentApi = (data) => {

    return api.post(
        "/payments/create/",
        data
    );

};


// ==========================================================
// My Payments
// GET /api/payments/
// ==========================================================

export const getMyPaymentsApi = () => {

    return api.get(
        "/payments/"
    );

};


// ==========================================================
// Payment Details
// GET /api/payments/:id/
// ==========================================================

export const getPaymentDetailsApi = (id) => {

    return api.get(
        `/payments/${id}/`
    );

};


// ==========================================================
// Admin Payments
// GET /api/payments/admin/
// ==========================================================

export const getAdminPaymentsApi = () => {

    return api.get(
        "/payments/admin/"
    );

};


// ==========================================================
// Update Payment Status
// PATCH /api/payments/:id/status/
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