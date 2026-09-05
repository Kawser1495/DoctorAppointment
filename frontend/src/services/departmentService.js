import { publicApi } from "./api";
import api from "../api/axios";

export const getDepartments = () => {
    return publicApi.get("doctors/departments/");
};

export const getAdminDepartments = () => api.get("doctors/admin/departments/");
export const createDepartment = (data) => api.post("doctors/admin/departments/", data);
export const updateDepartment = (id, data) => api.patch(`doctors/admin/departments/${id}/`, data);
export const deleteDepartment = (id) => api.delete(`doctors/admin/departments/${id}/`);