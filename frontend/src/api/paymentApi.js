import api from "./axios";


// ==========================================================
// Payment API
// ==========================================================


// ==========================================================
// Create Payment
// POST: /api/payments/create/
// ==========================================================

export const createPaymentApi = async (data) => {

    return await api.post(
        "payments/create/",
        data
    );

};


// ==========================================================
// My Payment History
// GET: /api/payments/
// ==========================================================

export const getMyPaymentsApi = async () => {

    return await api.get(
        "payments/"
    );

};


// ==========================================================
// Single Payment Details
// GET: /api/payments/:id/
// ==========================================================

export const getPaymentDetailsApi = async (id) => {

    return await api.get(
        `payments/${id}/`
    );

};


// ==========================================================
// Admin Payment Management
// GET: /api/payments/admin/
// ==========================================================

export const getAdminPaymentsApi = async () => {

    return await api.get(
        "payments/admin/"
    );

};


// ==========================================================
// Admin Update Payment Status
// PATCH: /api/payments/:id/status/
// ==========================================================

export const updatePaymentStatusApi = async (
    id,
    payment_status
) => {

    return await api.patch(

        `payments/${id}/status/`,

        {
            payment_status,
        }

    );

};