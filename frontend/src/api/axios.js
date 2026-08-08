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
// Request Interceptor
// Automatically attach JWT access token
// ==========================================================

api.interceptors.request.use(
    (config) => {

        const accessToken =
            localStorage.getItem("access") ||
            sessionStorage.getItem("access");

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
// Handle expired access token
// ==========================================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    async (error) => {

        const originalRequest = error.config;

        // --------------------------------------------------
        // If access token expired
        // --------------------------------------------------

        if (
            error.response?.status === 401 &&
            !originalRequest?._retry
        ) {

            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem("refresh") ||
                sessionStorage.getItem("refresh");

            if (refreshToken) {

                try {

                    const response = await axios.post(
                        "http://127.0.0.1:8000/api/accounts/refresh/",
                        {
                            refresh: refreshToken,
                        }
                    );

                    const newAccessToken =
                        response.data.access;

                    if (newAccessToken) {

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

                        originalRequest.headers.Authorization =
                            `Bearer ${newAccessToken}`;

                        return api(originalRequest);
                    }

                } catch (refreshError) {

                    console.error(
                        "Token refresh failed:",
                        refreshError
                    );

                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");

                    sessionStorage.removeItem("access");
                    sessionStorage.removeItem("refresh");

                }

            }

        }

        return Promise.reject(error);

    }
);

export default api;