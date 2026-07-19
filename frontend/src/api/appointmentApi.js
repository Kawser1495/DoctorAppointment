import api from "../services/api";

// =========================
// Department API
// =========================
export const getDepartments = async () => {
    return await api.get("doctors/departments/");
};

// =========================
// Doctor API
// =========================
export const getDoctors = async (departmentId) => {
    return await api.get(
        `doctors/departments/${departmentId}/doctors/`
    );
};