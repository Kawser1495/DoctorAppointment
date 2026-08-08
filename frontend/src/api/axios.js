import axios from "axios";


// ==========================================================
// API Configuration
// ==========================================================

const API_BASE_URL =
    "http://127.0.0.1:8000/api/";


// ==========================================================
// Axios Instance
// ==========================================================

const api = axios.create({

    baseURL: API_BASE_URL,

    headers: {
        "Content-Type": "application/json",
    },

});


// ==========================================================
// Helper: Get Access Token
// ==========================================================

const getAccessToken = () => {

    return (
        localStorage.getItem("access") ||
        sessionStorage.getItem("access")
    );

};


// ==========================================================
// Helper: Get Refresh Token
// ==========================================================

const getRefreshToken = () => {

    return (
        localStorage.getItem("refresh") ||
        sessionStorage.getItem("refresh")
    );

};


// ==========================================================
// Helper: Save Access Token
// ==========================================================

const saveAccessToken = (token) => {

    if (localStorage.getItem("refresh")) {

        localStorage.setItem(
            "access",
            token
        );

        return;
    }

    if (sessionStorage.getItem("refresh")) {

        sessionStorage.setItem(
            "access",
            token
        );

    }

};


// ==========================================================
// Helper: Clear Authentication
// ==========================================================

export const clearAuthStorage = () => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");

};


// ==========================================================
// Request Interceptor
// Automatically attach JWT
// ==========================================================

api.interceptors.request.use(

    (config) => {

        const accessToken =
            getAccessToken();

        if (accessToken) {

            config.headers.Authorization =
                `Bearer ${accessToken}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


// ==========================================================
// Response Interceptor
// Handle expired JWT
// ==========================================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    async (error) => {

        const originalRequest =
            error.config;

        // ----------------------------------------------
        // No response
        // ----------------------------------------------

        if (!error.response) {

            return Promise.reject(error);

        }


        // ----------------------------------------------
        // Only handle 401
        // ----------------------------------------------

        if (
            error.response.status !== 401 ||
            !originalRequest ||
            originalRequest._retry
        ) {

            return Promise.reject(error);

        }


        originalRequest._retry = true;


        const refreshToken =
            getRefreshToken();


        // ----------------------------------------------
        // No refresh token
        // ----------------------------------------------

        if (!refreshToken) {

            clearAuthStorage();

            return Promise.reject(error);

        }


        try {

            const refreshResponse =
                await axios.post(

                    `${API_BASE_URL}accounts/refresh/`,

                    {
                        refresh:
                            refreshToken,
                    }

                );


            const newAccessToken =
                refreshResponse.data.access;


            if (!newAccessToken) {

                throw new Error(
                    "Access token was not returned."
                );

            }


            // Save new access token
            saveAccessToken(
                newAccessToken
            );


            // Update failed request
            originalRequest.headers =
                originalRequest.headers || {};

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;


            // Retry original request
            return api(
                originalRequest
            );

        }

        catch (refreshError) {

            console.error(
                "Token refresh failed:",
                refreshError
            );


            clearAuthStorage();


            return Promise.reject(
                refreshError
            );

        }

    }

);


export default api;