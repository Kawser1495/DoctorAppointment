import {

    getPatientProfile,
    createPatientProfile,
    updatePatientProfile,
    getFamilyMembers,
    createFamilyMember,
    getFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,

} from "../api/patientApi";


// ==========================================================
// Payment API
// ==========================================================

import api from "../api/axios";


// ==========================================================
// Patient Profile
// ==========================================================

export const fetchPatientProfile = async () => {

    return await getPatientProfile();

};


export const createProfile = async (data) => {

    return await createPatientProfile(data);

};


export const updateProfile = async (data) => {

    return await updatePatientProfile(data);

};


// ==========================================================
// Family Members
// ==========================================================

export const fetchFamilyMembers = async () => {

    return await getFamilyMembers();

};


export const addFamilyMember = async (data) => {

    return await createFamilyMember(data);

};


export const fetchFamilyMember = async (id) => {

    return await getFamilyMember(id);

};


export const editFamilyMember = async (id, data) => {

    return await updateFamilyMember(id, data);

};


export const removeFamilyMember = async (id) => {

    return await deleteFamilyMember(id);

};


// ==========================================================
// PAYMENT
// ==========================================================

// Appointment Payment
// OR
// Diagnostic Test Payment

export const createPayment = async (data) => {

    return await api.post(
        "/payments/create/",
        data
    );

};


// ==========================================================
// Payment History
// ==========================================================

export const getPaymentHistory = async () => {

    return await api.get(
        "/payments/"
    );

};


// ==========================================================
// Payment Details
// ==========================================================

export const getPaymentDetails = async (id) => {

    return await api.get(
        `/payments/${id}/`
    );

};


// ==========================================================
// Admin Payment List
// ==========================================================

export const getAdminPayments = async () => {

    return await api.get(
        "/payments/admin/"
    );

};


// ==========================================================
// Update Payment Status
// ==========================================================

export const updatePaymentStatus = async (
    id,
    payment_status
) => {

    return await api.patch(
        `/payments/${id}/status/`,
        {
            payment_status
        }
    );

};