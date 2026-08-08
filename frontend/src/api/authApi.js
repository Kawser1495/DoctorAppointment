import api from "./axios";

// ==========================================================
// Register
// POST: /api/accounts/register/
// ==========================================================

export const registerApi = (data) => {

    return api.post(
        "accounts/register/",
        data
    );

};


// ==========================================================
// Login
// POST: /api/accounts/login/
// ==========================================================

export const loginApi = (data) => {

    return api.post(
        "accounts/login/",
        data
    );

};


// ==========================================================
// Refresh Token
// POST: /api/accounts/refresh/
// ==========================================================

export const refreshTokenApi = (refresh) => {

    return api.post(
        "accounts/refresh/",
        {
            refresh,
        }
    );

};