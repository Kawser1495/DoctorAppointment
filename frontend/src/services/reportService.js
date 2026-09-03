import api from "../api/axios";

// ==========================================================
// Get My Medical Reports
//
// GET:
// /api/reports/patient/
// ==========================================================

export const getMedicalReports = async () => {
    return await api.get(
        "reports/patient/"
    );
};


// ==========================================================
// Alias
// Get My Medical Reports
// ==========================================================

export const getMyReports = getMedicalReports;


// ==========================================================
// Get Medical Report Details
//
// GET:
// /api/reports/<id>/
// ==========================================================

export const getMedicalReport = async (id) => {
    return await api.get(
        `reports/${id}/`
    );
};


// ==========================================================
// Alias
// Get Medical Report Details
// ==========================================================

export const getReportDetails = getMedicalReport;


// ==========================================================
// Get Doctor Medical Reports
//
// GET:
// /api/reports/doctor/
// ==========================================================

export const getDoctorReports = async () => {
    return await api.get(
        "reports/doctor/"
    );
};