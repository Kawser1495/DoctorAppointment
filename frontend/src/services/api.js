import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/";


// ======================================
// PRIVATE API
// For protected endpoints
// ======================================

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


// ======================================
// Attach JWT Token
// ======================================

api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("access") ||
            sessionStorage.getItem("access");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);


// ======================================
// PUBLIC API
// No JWT token
// ======================================

export const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


export default api;