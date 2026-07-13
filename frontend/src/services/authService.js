import axios from "axios";

const API = "http://127.0.0.1:8000/api/accounts/";

// Register User
export const registerUser = (data) => {
    return axios.post(API + "register/", data);
};

// Login User
export const loginUser = (data) => {
    return axios.post(API + "login/", data);
};