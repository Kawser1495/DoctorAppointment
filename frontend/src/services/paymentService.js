import {
    createPaymentApi,
    getMyPaymentsApi,
    getPaymentDetailsApi,
    getAdminPaymentsApi,
    updatePaymentStatusApi,
} from "../api/paymentApi";


// ==========================================================
// Create Payment
// ==========================================================

export const createPayment = async (data) => {

    return await createPaymentApi(data);

};


// ==========================================================
// My Payment History
// ==========================================================

export const getMyPayments = async () => {

    return await getMyPaymentsApi();

};


// ==========================================================
// Single Payment Details
// ==========================================================

export const getPaymentDetails = async (id) => {

    return await getPaymentDetailsApi(id);

};


// ==========================================================
// Admin Payment Management
// ==========================================================

export const getAdminPayments = async () => {

    return await getAdminPaymentsApi();

};


// ==========================================================
// Admin Update Payment Status
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