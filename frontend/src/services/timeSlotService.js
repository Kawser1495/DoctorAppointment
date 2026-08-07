import api from "./api";

// ==========================================
// Create Payment
// POST: /api/payments/create/
// ==========================================

export const createPayment = async (data) => {
    return await api.post(
        "payments/create/",
        data
    );
};

// ==========================================
// My Payment History
// GET: /api/payments/my/
// ==========================================

export const getMyPayments = async () => {
    return await api.get(
        "payments/my/"
    );
};

// ==========================================
// Payment Details
// GET: /api/payments/:id/
// ==========================================

export const getPaymentDetails = async (id) => {
    return await api.get(
        `payments/${id}/`
    );
};

// ==========================================
// Update Payment Status (Admin)
// PATCH
// ==========================================

export const updatePaymentStatus = async (
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