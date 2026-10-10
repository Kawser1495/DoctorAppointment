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

export const deleteAdminPaymentApi = (id) => (
    api.delete(`/payments/admin/${id}/`)
);

export const updateDiagnosticReportInfoApi = (id, data) => (
    api.patch(`/payments/admin/${id}/diagnostic-report/`, data)
);


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

export const createRefundRequestApi = (paymentId, reason) => {
    return api.post(`/payments/${paymentId}/refund-request/`, { reason });
};

export const getRefundRequestsApi = () => {
    return api.get("/payments/refund-requests/");
};

export const updateRefundRequestApi = (requestId, refund_status, admin_note = "") => {
    return api.patch(`/payments/refund-requests/${requestId}/status/`, {
        refund_status,
        admin_note,
    });
};

export const createSSLCommerzPaymentApi = (data) => (
    api.post("/payments/sslcommerz/create/", data)
);

export const createSSLCommerzAIReportPaymentApi = (data) => (
    api.post("/payments/sslcommerz/ai-report/create/", data)
);