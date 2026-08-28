import api from "./api";


export const getMedicalReports = async () => {

    const response = await api.get(
        "reports/patient/"
    );

    return response.data;

};


export const getMedicalReportDetails = async (
    reportId
) => {

    const response = await api.get(
        `reports/${reportId}/`
    );

    return response.data;

};


export const getDoctorMedicalReports = async () => {

    const response = await api.get(
        "reports/doctor/"
    );

    return response.data;

};