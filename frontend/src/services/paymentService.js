import {

    createPaymentApi,

    getMyPaymentsApi,

    getPaymentDetailsApi,

    getAdminPaymentsApi,

    updatePaymentStatusApi,

    refundPaymentApi,

} from "../api/paymentApi";


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