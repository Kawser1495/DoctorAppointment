import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/";

// ==========================================================
// API Instance
// ==========================================================

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ==========================================================
// Token Helpers
// ==========================================================

const getAccessToken = () => {
    return (
        localStorage.getItem("access") ||
        sessionStorage.getItem("access")
    );
};

const getRefreshToken = () => {
    return (
        localStorage.getItem("refresh") ||
        sessionStorage.getItem("refresh")
    );
};

const clearAuthentication = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    sessionStorage.removeItem("user");
};

const saveAccessToken = (accessToken) => {
    if (localStorage.getItem("refresh")) {
        localStorage.setItem("access", accessToken);
    } else {
        sessionStorage.setItem("access", accessToken);
    }
};

// ==========================================================
// Request Interceptor
// ==========================================================

api.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();

        if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ==========================================================
// Token Refresh State
// ==========================================================

let isRefreshing = false;
let refreshSubscribers = [];

// ==========================================================
// Subscribe Waiting Requests
// ==========================================================

const subscribeTokenRefresh = (resolve, reject) => {
    refreshSubscribers.push({
        resolve,
        reject,
    });
};

// ==========================================================
// Notify Waiting Requests
// ==========================================================

const notifyRefreshSubscribers = (newAccessToken) => {
    refreshSubscribers.forEach(({ resolve }) => {
        resolve(newAccessToken);
    });

    refreshSubscribers = [];
};

// ==========================================================
// Reject Waiting Requests
// ==========================================================

const rejectRefreshSubscribers = (error) => {
    refreshSubscribers.forEach(({ reject }) => {
        reject(error);
    });

    refreshSubscribers = [];
};

// ==========================================================
// Response Interceptor
// ==========================================================

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // No response from server
        if (!error.response) {
            return Promise.reject(error);
        }

        // Only handle 401
        if (error.response.status !== 401) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest?.url || "";

        // Do not refresh authentication endpoints
        if (
            requestUrl.includes("accounts/login/") ||
            requestUrl.includes("accounts/register/") ||
            requestUrl.includes("accounts/refresh/")
        ) {
            return Promise.reject(error);
        }

        // Prevent infinite retry
        if (originalRequest?._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const refreshToken = getRefreshToken();

        // No refresh token
        if (!refreshToken) {
            clearAuthentication();
            return Promise.reject(error);
        }

        // ==================================================
        // If another request is already refreshing
        // ==================================================

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh(resolve, reject);
            }).then((newAccessToken) => {
                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);
            });
        }

        isRefreshing = true;

        try {
            const refreshResponse = await axios.post(
                `${BASE_URL}accounts/refresh/`,
                {
                    refresh: refreshToken,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const newAccessToken =
                refreshResponse.data?.access;

            if (!newAccessToken) {
                throw new Error(
                    "New access token was not returned."
                );
            }

            saveAccessToken(newAccessToken);

            notifyRefreshSubscribers(newAccessToken);

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

            rejectRefreshSubscribers(refreshError);

            clearAuthentication();

            if (
                window.location.pathname !== "/login"
            ) {
                window.location.href = "/login";
            }

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

// ==========================================================
// Public API
// Used for public endpoints without JWT
// ==========================================================

export const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;