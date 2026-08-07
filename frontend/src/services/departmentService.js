import api from "./api";

// ==========================================
// Get All Departments
// GET: /api/doctors/departments/
// ==========================================

export const getDepartments = async () => {
    return await api.get("doctors/departments/");
};