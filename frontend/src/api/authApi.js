import api from "./axios";


// ==========================================================
// Register
// POST /api/accounts/register/
// ==========================================================

export const registerApi = async (data) => {

    return await api.post(
        "accounts/register/",
        data
    );

};


// ==========================================================
// Login
// POST /api/accounts/login/
// ==========================================================

export const loginApi = async (data) => {

    return await api.post(
        "accounts/login/",
        data
    );

};


// ==========================================================
// Refresh Token
// POST /api/accounts/refresh/
// ==========================================================

export const refreshTokenApi = async (
    refresh
) => {

    return await api.post(

        "accounts/refresh/",

        {
            refresh,
        }

    );

};