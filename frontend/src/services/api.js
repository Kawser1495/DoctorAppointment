import axios from "axios";

// ======================================
// Axios Instance
// ======================================

const api = axios.create({

    baseURL: "http://127.0.0.1:8000/api/",

    headers: {

        "Content-Type": "application/json",

    },

});

// ======================================
// Request Interceptor
// Automatically Attach JWT Token
// ======================================

api.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("access");

        if (token) {

            config.headers.Authorization = `Bearer ${token}`;

        }

        return config;

    },

    (error) => Promise.reject(error)

);

// ======================================
// Response Interceptor
// Handle Unauthorized Requests
// ======================================

api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            console.error("Session expired. Please login again.");

            // Uncomment if you want automatic logout

            /*
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = "/";
            */

        }

        return Promise.reject(error);

    }

);

export default api;