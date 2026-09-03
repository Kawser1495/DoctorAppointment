import api from "../api/axios";


// ==========================================================
// Get My Medical Reports
//
// GET:
// /api/reports/patient/
// ==========================================================

export const getMyReports = async () => {

    return await api.get(
        "reports/patient/"
    );

};


// ==========================================================
// Get Medical Report Details
//
// GET:
// /api/reports/<id>/
// ==========================================================

export const getReportDetails = async (
    id
) => {

    return await api.get(
        `reports/${id}/`
    );

};


// ==========================================================
// Get Doctor Medical Reports
//
// GET:
// /api/reports/doctor/
// ==========================================================

export const getDoctorReports =
    async () => {

        return await api.get(
            "reports/doctor/"
        );

    };