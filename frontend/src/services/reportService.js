import api from "./api";


// ==========================================================
// Get My Medical Reports
// GET: /api/reports/patient/
// ==========================================================

export const getMedicalReports = async () => {

    const response = await api.get(
        "reports/patient/"
    );

    return response.data;

};


// ==========================================================
// Get Single Medical Report
// GET: /api/reports/<id>/
// ==========================================================

export const getMedicalReportDetails = async (
    reportId
) => {

    const response = await api.get(
        `reports/${reportId}/`
    );

    return response.data;

};