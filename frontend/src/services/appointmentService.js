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

export const shareAppointmentAIReport = async (id, report) => {
    return await api.patch(`appointments/${id}/ai-report/`, report);
};

export const shareStandaloneAIReport = async (doctorId, report) => {
    return await api.post("appointments/ai-reports/", {
        doctor: doctorId,
        ...report,
    });
};

export const analyzeSymptomsWithAI = async (data) => {
    return await api.post("appointments/symptom-analysis/", data);
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

export const getDoctorRatings = async () => {
    return await api.get("doctors/ratings/");
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
        id,
        rejectionReason
    ) => {

        return await api.patch(

            `appointments/doctor/${id}/reject/`,

            {
                rejection_reason: rejectionReason,
            }

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
    async (params = {}) => {

        return await api.get(

            "appointments/admin/",
            { params }

        );

    };

export const getReceptionistAppointments = async (params = {}) => (
    api.get("appointments/receptionist/", { params })
);

export const updateReceptionistAppointmentStatus = async (id, status) => (
    api.patch(`appointments/receptionist/${id}/status/`, { status })
);

export const updateAdminAppointmentStatus = async (id, status) => {
    return await api.patch(`appointments/admin/${id}/status/`, { status });
};

export const deleteAdminAppointment = async (id) => {
    return await api.delete(`appointments/admin/${id}/delete/`);
};

export const getDoctorAIReports = async () => {
    return await api.get("appointments/ai-reports/");
};

export const getPatientAIReports = async () => {
    return await api.get("appointments/ai-reports/");
};

export const updateDoctorAIReport = async (id, doctorAssessment) => {
    return await api.patch(`appointments/ai-reports/${id}/`, { doctor_assessment: doctorAssessment });
};