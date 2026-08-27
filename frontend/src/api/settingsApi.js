import axios from "axios";


const API_URL =
    "http://127.0.0.1:8000/api/accounts/settings/";


const getAuthHeaders = () => {

    const token =
        localStorage.getItem("access_token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

};


// ==========================================================
// Get User Settings
// GET /api/accounts/settings/
// ==========================================================

export const getUserSettingsApi = async () => {

    const response = await axios.get(
        API_URL,
        getAuthHeaders()
    );

    return response.data;

};


// ==========================================================
// Update User Settings
// PATCH /api/accounts/settings/
// ==========================================================

export const updateUserSettingsApi = async (
    data
) => {

    const response = await axios.patch(
        API_URL,
        data,
        getAuthHeaders()
    );

    return response.data;

};
