import api from "./api";


// ==========================================
// Get All Departments
// ==========================================

export const getDepartments = async () => {

    return await api.get(
        "doctors/departments/"
    );

};