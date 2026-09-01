import api from "./api";

// ==========================================================
// Dashboard API
// ==========================================================

export const getDashboardData = async () => {
    try {
        const response = await api.get("/dashboard/");

        return response.data;

    } catch (error) {

        console.error(
            "Dashboard API Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};