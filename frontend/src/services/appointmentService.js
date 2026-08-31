import api from "./api";

// ===========================================
// Book Appointment
// ===========================================

export const bookAppointment = async (data) => {
    return await api.post(
        "appointments/book/",
        data
    );
};


// ===========================================
// Get My Appointments - Patient
// ===========================================

export const getMyAppointments = async () => {
    return await api.get(
        "appointments/patient/"
    );
};


// ===========================================
// Get Appointment Details - Patient
// ===========================================

export const getAppointmentDetails = async (id) => {
    return await api.get(
        `appointments/${id}/`
    );
};


// ===========================================
// Update Appointment
// ===========================================

export const updateAppointment = async (id, data) => {
    return await api.put(
        `appointments/${id}/update/`,
        data
    );
};


// ===========================================
// Cancel Appointment - Patient
// ===========================================

export const cancelAppointment = async (id) => {
    return await api.patch(
        `appointments/${id}/cancel/`
    );
};


// ==========================================================
// DOCTOR APPOINTMENTS
// ==========================================================


// ===========================================
// Get Doctor Appointments
// ===========================================

export const getDoctorAppointments = async () => {
    return await api.get(
        "appointments/doctor/"
    );
};


// ===========================================
// Get Doctor Appointment Details
// ===========================================

export const getDoctorAppointmentDetails = async (id) => {
    return await api.get(
        `appointments/doctor/${id}/`
    );
};


// ===========================================
// Doctor Confirm Appointment
// ===========================================

export const confirmDoctorAppointment = async (id) => {
    return await api.patch(
        `appointments/doctor/${id}/confirm/`
    );
};


// ===========================================
// Doctor Reject Appointment
// ===========================================

export const rejectDoctorAppointment = async (id) => {
    return await api.patch(
        `appointments/doctor/${id}/reject/`
    );
};


// ===========================================
// Doctor Complete Appointment
// ===========================================

export const completeDoctorAppointment = async (id) => {
    return await api.patch(
        `appointments/doctor/${id}/complete/`
    );
};


// ===========================================
// Admin Appointments
// ===========================================

export const getAdminAppointments = async () => {
    return await api.get(
        "appointments/admin/"
    );
};


// ===========================================
// OLD GENERIC STATUS UPDATE
// ===========================================
//
// তোমার বর্তমান Django backend-এ
// appointments/<id>/status/ endpoint নেই।
//
// তাই আপাতত এই function ব্যবহার না করাই ভালো.
//
// ===========================================

// export const updateAppointmentStatus = async (id, status) => {
//     return await api.patch(
//         `appointments/${id}/status/`,
//         {
//             status,
//         }
//     );
// };