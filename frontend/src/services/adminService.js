import api from "./api";


// ==========================================================
// Admin User Management
// ==========================================================

// Get all users
export const getAdminUsers = async (params = {}) => {

    return await api.get(
        "accounts/admin/users/",
        {
            params,
        }
    );

};


// ==========================================================
// Get Admin Users with Filters
// ==========================================================

export const searchAdminUsers = async ({
    search = "",
    role = "all",
    is_active = "all",
} = {}) => {

    const params = {};

    if (search.trim()) {
        params.search = search.trim();
    }

    if (role && role !== "all") {
        params.role = role;
    }

    if (
        is_active &&
        is_active !== "all"
    ) {

        params.is_active = is_active;

    }

    return await api.get(
        "accounts/admin/users/",
        {
            params,
        }
    );

};

export const getAdminPatients = async () => {
    return await api.get("patients/admin/");
};

export const getAdminPatientDetails = async (patientId) => {
    return await api.get(`patients/admin/${patientId}/`);
};