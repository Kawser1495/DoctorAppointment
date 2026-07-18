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
// Get My Appointments
// ===========================================

export const getMyAppointments = async () => {

    return await api.get(

        "appointments/list/"

    );

};

// ===========================================
// Get Appointment Details
// ===========================================

export const getAppointmentDetails = async (id) => {

    return await api.get(

        `appointments/details/${id}/`

    );

};

// ===========================================
// Update Appointment
// ===========================================

export const updateAppointment = async (id, data) => {

    return await api.put(

        `appointments/update/${id}/`,

        data

    );

};

// ===========================================
// Cancel Appointment
// ===========================================

export const cancelAppointment = async (id) => {

    return await api.patch(

        `appointments/cancel/${id}/`

    );

};

// ===========================================
// Doctor Appointments
// ===========================================

export const getDoctorAppointments = async () => {

    return await api.get(

        "appointments/doctor/"

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
// Update Appointment Status
// ===========================================

export const updateAppointmentStatus = async (id, status) => {

    return await api.patch(

        `appointments/status/${id}/`,

        {
            status: status
        }

    );

};