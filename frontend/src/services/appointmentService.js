import api from "./api";


// ==========================================================
// Book Appointment
// ==========================================================

export const bookAppointment = async (
    data
) => {

    return await api.post(

        "appointments/book/",

        data

    );

};


// ==========================================================
// Get My Appointments
// ==========================================================

export const getMyAppointments =
    async () => {

        return await api.get(

            "appointments/patient/"

        );

    };


// ==========================================================
// Get Appointment Details
// ==========================================================

export const getAppointmentDetails =
    async (
        id
    ) => {

        return await api.get(

            `appointments/${id}/`

        );

    };


// ==========================================================
// Update Appointment
// ==========================================================

export const updateAppointment =
    async (
        id,
        data
    ) => {

        return await api.put(

            `appointments/${id}/update/`,

            data

        );

    };


// ==========================================================
// Cancel Appointment
// ==========================================================

export const cancelAppointment =
    async (
        id
    ) => {

        return await api.patch(

            `appointments/${id}/cancel/`

        );

    };


// ==========================================================
// Doctor Appointments
// ==========================================================

export const getDoctorAppointments =
    async () => {

        return await api.get(

            "appointments/doctor/"

        );

    };


// ==========================================================
// Doctor Appointment Details
// ==========================================================

export const getDoctorAppointmentDetails =
    async (
        id
    ) => {

        return await api.get(

            `appointments/doctor/${id}/`

        );

    };


// ==========================================================
// Confirm Appointment
// ==========================================================

export const confirmDoctorAppointment =
    async (
        id
    ) => {

        return await api.patch(

            `appointments/doctor/${id}/confirm/`

        );

    };


// ==========================================================
// Reject Appointment
// ==========================================================

export const rejectDoctorAppointment =
    async (
        id
    ) => {

        return await api.patch(

            `appointments/doctor/${id}/reject/`

        );

    };


// ==========================================================
// Complete Appointment
// ==========================================================

export const completeDoctorAppointment =
    async (
        id
    ) => {

        return await api.patch(

            `appointments/doctor/${id}/complete/`

        );

    };


// ==========================================================
// Admin Appointments
// ==========================================================

export const getAdminAppointments =
    async () => {

        return await api.get(

            "appointments/admin/"

        );

    };

export const updateAdminAppointmentStatus = async (id, status) => {
    return await api.patch(`appointments/admin/${id}/status/`, { status });
};

export const getReceptionistAppointments = async () => {
    return await api.get("appointments/receptionist/");
};

export const updateReceptionistAppointmentStatus = async (id, status) => {
    return await api.patch(
        `appointments/receptionist/${id}/status/`,
        { status },
    );
};