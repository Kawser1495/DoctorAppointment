import {
    loginApi,
    registerApi,
    refreshTokenApi,
} from "../api/authApi";


// ==========================================================
// Login User
// ==========================================================

export const loginUser = async (data) => {

    return await loginApi(data);

};


// ==========================================================
// Register User
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