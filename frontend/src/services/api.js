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
// Attach JWT Access Token
// ======================================

api.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem("access") ||
            sessionStorage.getItem("access");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


// ======================================
// Response Interceptor
// ======================================

api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            console.error(
                "401 Unauthorized - Token may be invalid or expired."
            );

        }

        return Promise.reject(error);

    }

);


export default api;