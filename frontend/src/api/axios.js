import axios from "axios";


// ==========================================================
// Axios Instance
// ==========================================================

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
    headers: {
        "Content-Type": "application/json",
    },
});


// ==========================================================
// Get Access Token
// ==========================================================

const getAccessToken = () => {

    return (
        localStorage.getItem("access") ||
        sessionStorage.getItem("access")
    );

};


// ==========================================================
// Get Refresh Token
// ==========================================================

const getRefreshToken = () => {

    return (
        localStorage.getItem("refresh") ||
        sessionStorage.getItem("refresh")
    );

};


// ==========================================================
// Request Interceptor
// Attach JWT Access Token
// ==========================================================

api.interceptors.request.use(

    (config) => {

        const accessToken = getAccessToken();

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
// Refresh Expired Access Token
// ==========================================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    async (error) => {

        const originalRequest = error.config;

        // --------------------------------------------------
        // No response from server
        // --------------------------------------------------

        if (!error.response) {

            return Promise.reject(error);

        }

        // --------------------------------------------------
        // Only handle 401
        // --------------------------------------------------

        if (
            error.response.status !== 401 ||
            originalRequest?._retry
        ) {

            return Promise.reject(error);

        }

        originalRequest._retry = true;

        const refreshToken = getRefreshToken();

        // --------------------------------------------------
        // No refresh token
        // --------------------------------------------------

        if (!refreshToken) {

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");

            sessionStorage.removeItem("access");
            sessionStorage.removeItem("refresh");

            return Promise.reject(error);

        }

        // --------------------------------------------------
        // Refresh Access Token
        // --------------------------------------------------

        try {

            const refreshResponse = await axios.post(

                "http://127.0.0.1:8000/api/accounts/refresh/",

                {
                    refresh: refreshToken,
                }

            );

            const newAccessToken =
                refreshResponse.data.access;

            if (!newAccessToken) {

                throw new Error(
                    "New access token was not returned."
                );

            }

            // ------------------------------------------------
            // Save new token in same storage
            // ------------------------------------------------

            if (
                localStorage.getItem("refresh")
            ) {

                localStorage.setItem(
                    "access",
                    newAccessToken
                );

            } else {

                sessionStorage.setItem(
                    "access",
                    newAccessToken
                );

            }

            // ------------------------------------------------
            // Retry original request
            // ------------------------------------------------

            originalRequest.headers =
                originalRequest.headers || {};

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);

        } catch (refreshError) {

            console.error(
                "Token refresh failed:",
                refreshError
            );

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");

            sessionStorage.removeItem("access");
            sessionStorage.removeItem("refresh");

            return Promise.reject(
                refreshError
            );

        }

    }

);


export default api;