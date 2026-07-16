import axios from "axios";

// Axios Instance
const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});

// =========================
// Department API
// =========================
export const getDepartments = async () => {
    return await API.get("/departments/");
};

// =========================
// Doctor API
// =========================
export const getDoctors = async (departmentId) => {
    return await API.get(`/departments/${departmentId}/doctors/`);
};