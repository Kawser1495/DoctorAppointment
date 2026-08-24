import { publicApi } from "./api";

export const getDepartments = () => {
    return publicApi.get("doctors/departments/");
};