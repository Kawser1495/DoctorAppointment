import api from "../services/api";

export const getDepartments = () => {

    return api.get("doctors/departments/");

};

export const getDoctors = (departmentId) => {

    return api.get(
        `doctors/departments/${departmentId}/doctors/`
    );

};