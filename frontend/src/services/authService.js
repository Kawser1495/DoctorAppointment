import {
    loginApi,
    registerApi,
    refreshTokenApi,
} from "../api/authApi";


// ==========================================================
// Login
// ==========================================================

export const loginUser = async (data) => {

    return await loginApi(data);

};


// ==========================================================
// Register
// ==========================================================

export const registerUser = async (data) => {

    return await registerApi(data);

};


// ==========================================================
// Refresh Access Token
// ==========================================================

export const refreshAccessToken = async (refresh) => {

    return await refreshTokenApi(refresh);

};