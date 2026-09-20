import axios from "axios";
import { API_BASE_URL } from "../config";

// ==========================================================
// Axios Instance
// ==========================================================

const api = axios.create({
    baseURL: API_BASE_URL,
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

const clearTokens = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
};

const saveAccessToken = (newAccessToken) => {
    // যে storage-এ refresh token আছে,
    // access token-ও সেই storage-এ save হবে।

    if (localStorage.getItem("refresh")) {
        localStorage.setItem("access", newAccessToken);
    } else {
        sessionStorage.setItem("access", newAccessToken);
    }
};

// ==========================================================
// Request Interceptor
// Attach JWT Token
// ==========================================================

api.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();

        if (accessToken) {
            config.headers = config.headers || {};

            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // FormData হলে Content-Type manually set করা যাবে না।
        // Browser নিজে multipart boundary তৈরি করবে।

        if (config.data instanceof FormData) {
            delete config.headers?.["Content-Type"];
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

        // Server response না থাকলে
        if (!error.response) {
            return Promise.reject(error);
        }

        // শুধু 401 Unauthorized handle করবে
        if (
            error.response.status !== 401 ||
            originalRequest?._retry
        ) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest?.url || "";

        // Login, register এবং refresh request-এর জন্য
        // আবার token refresh করার চেষ্টা করবে না।

        if (
            requestUrl.includes("accounts/login/") ||
            requestUrl.includes("accounts/register/") ||
            requestUrl.includes("accounts/refresh/")
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const refreshToken = getRefreshToken();

        // Refresh token না থাকলে logout-এর মতো token clear করবে
        if (!refreshToken) {
            clearTokens();

            return Promise.reject(error);
        }

        try {
            // api instance ব্যবহার না করে axios ব্যবহার করা হয়েছে,
            // যাতে refresh request আবার interceptor loop-এ না যায়।

            const refreshResponse = await axios.post(
                `${API_BASE_URL}accounts/refresh/`,
                {
                    refresh: refreshToken,
                }
            );

            const newAccessToken = refreshResponse.data.access;

            if (!newAccessToken) {
                throw new Error(
                    "New access token was not returned."
                );
            }

            // নতুন access token save
            saveAccessToken(newAccessToken);

            // Original request-এ নতুন token বসানো
            originalRequest.headers =
                originalRequest.headers || {};

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            // FormData হলে Content-Type remove করবে
            if (originalRequest.data instanceof FormData) {
                delete originalRequest.headers["Content-Type"];
            }

            // আগের request আবার পাঠানো
            return api(originalRequest);
        } catch (refreshError) {
            console.error(
                "Token refresh failed:",
                refreshError
            );

            clearTokens();

            return Promise.reject(refreshError);
        }
    }
);

export default api;