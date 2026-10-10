import {

    createPaymentApi,

    getMyPaymentsApi,

    getPaymentDetailsApi,

    getAdminPaymentsApi,
    deleteAdminPaymentApi,
    updateDiagnosticReportInfoApi,

    updatePaymentStatusApi,

    refundPaymentApi,
    createRefundRequestApi,
    getRefundRequestsApi,
    updateRefundRequestApi,
    createSSLCommerzPaymentApi,
    createSSLCommerzAIReportPaymentApi,

} from "../api/paymentApi";
import api from "../api/axios";


// ==========================================================
// Create Payment
// ==========================================================

export const createPayment = async (
    data
) => {

    return await createPaymentApi(
        data
    );

};

export const createSSLCommerzPayment = async (data) => (
    createSSLCommerzPaymentApi(data)
);

export const createSSLCommerzAIReportPayment = async (data) => (
    createSSLCommerzAIReportPaymentApi(data)
);


// ==========================================================
// My Payments
// ==========================================================

export const getMyPayments = async () => {

    return await getMyPaymentsApi();

};


// ==========================================================
// Payment Details
// ==========================================================

export const getPaymentDetails = async (
    id
) => {

    return await getPaymentDetailsApi(
        id
    );

};


// ==========================================================
// Admin Payments
// ==========================================================

export const getAdminPayments = async () => {

    return await getAdminPaymentsApi();

};

export const deleteAdminPayment = async (id) => (
    deleteAdminPaymentApi(id)
);

export const updateDiagnosticReportInfo = async (id, data) => (
    updateDiagnosticReportInfoApi(id, data)
);


// ==========================================================
// Update Payment Status
// ==========================================================

export const updatePaymentStatus = async (
    id,
    payment_status
) => {

    return await updatePaymentStatusApi(
        id,
        payment_status
    );

};


// ==========================================================
// Refund Payment
// ==========================================================

export const refundPayment = async (
    paymentId
) => {

    return await refundPaymentApi(
        paymentId
    );

};

export const getDoctorPayments = async () => {
    return await api.get("payments/doctor/");
};

export const refundDoctorPayment = async (paymentId, reason) => {
    return await api.patch(`payments/doctor/${paymentId}/refund/`, { reason });
};

export const createRefundRequest = async (paymentId, reason) => (
    createRefundRequestApi(paymentId, reason)
);

export const getRefundRequests = async () => getRefundRequestsApi();

export const updateRefundRequest = async (requestId, refundStatus, adminNote = "") => (
    updateRefundRequestApi(requestId, refundStatus, adminNote)
);