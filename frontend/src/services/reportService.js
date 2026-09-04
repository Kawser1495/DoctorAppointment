import api from "../api/axios";


// ==========================================================
// Patient Medical Reports
// ==========================================================

export const getMedicalReports =
    async () => {

        return await api.get(
            "reports/patient/"
        );

    };


// ==========================================================
// Doctor Medical Reports
// ==========================================================

export const getDoctorReports =
    async () => {

        return await api.get(
            "reports/doctor/"
        );

    };


// ==========================================================
// Get Single Report
// ==========================================================

export const getMedicalReport =
    async (
        id
    ) => {

        return await api.get(

            `reports/${id}/`

        );

    };


// ==========================================================
// Create Medical Report
// ==========================================================

export const createMedicalReport =
    async (
        formData
    ) => {

        // IMPORTANT:
        // Do not set Content-Type here.
        //
        // Axios/browser will automatically set
        // multipart/form-data with boundary.

        return await api.post(

            "reports/doctor/create/",

            formData

        );

    };


// ==========================================================
// Update Medical Report
// ==========================================================

export const updateMedicalReport =
    async (
        id,
        formData
    ) => {

        return await api.patch(

            `reports/doctor/${id}/`,

            formData

        );

    };


// ==========================================================
// Delete Medical Report
// ==========================================================

export const deleteMedicalReport =
    async (
        id
    ) => {

        return await api.delete(

            `reports/doctor/${id}/`

        );

    };