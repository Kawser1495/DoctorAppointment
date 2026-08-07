import api from "./api";

// Get Departments
export const getDepartments = async () => {
    return await api.get("doctors/departments/");
};

// Get Doctors
export const getDoctors = async () => {
    return await api.get("doctors/doctors/");
};

// Get Doctors By Department
export const getDoctorsByDepartment = async (departmentId) => {
    return await api.get(
        `doctors/departments/${departmentId}/doctors/`
    );
};

// Search Doctors
export const searchDoctors = async (keyword) => {
    return await api.get(
        `doctors/search/?search=${keyword}`
    );
};

// Time Slots
export const getAvailableTimeSlots = async (doctorId) => {
    return await api.get(
        `doctors/time-slots/?doctor=${doctorId}`
    );
};