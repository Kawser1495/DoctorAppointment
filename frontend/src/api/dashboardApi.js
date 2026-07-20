import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});

// প্রতিটি Request-এর সাথে JWT Token পাঠাবে
API.interceptors.request.use(
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

export const getDashboardData = () => API.get("/dashboard/");

export default API;