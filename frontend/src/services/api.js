import axios from "axios";

const api = axios.create({

    baseURL: "http://127.0.0.1:8000/api/",

    headers: {

        "Content-Type": "application/json",

    },

});

// ======================================
// Attach JWT Token Automatically
// ======================================

api.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("access");

        if (token) {

            config.headers.Authorization = `Bearer ${token}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);

// ======================================
// Optional: Handle Unauthorized Response
// ======================================

api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            console.error("Unauthorized! Please login again.");

            // Optional:
            // localStorage.removeItem("access");
            // localStorage.removeItem("refresh");
            // window.location.href = "/login";

        }

        return Promise.reject(error);

    }

);

export default api;