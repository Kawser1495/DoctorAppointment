import api from "../services/api";

// ======================================
// Dashboard API
// ======================================

export const getDashboardData = async () => {

    return await api.get("dashboard/");

};