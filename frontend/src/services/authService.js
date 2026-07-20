import api from "./api";

// ======================================
// Register User
// ======================================

export const registerUser = async (data) => {

    return await api.post("accounts/register/", data);

};

// ======================================
// Login User
// ======================================

export const loginUser = async (data) => {

    return await api.post("accounts/login/", data);

};