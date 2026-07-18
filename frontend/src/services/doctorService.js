import api from "./api";

// ===============================
// Get All Doctors
// ===============================

export const getDoctors = () => {

    return api.get("doctors/doctors/");

};

// ===============================
// Get Doctors By Department
// ===============================

export const getDoctorsByDepartment = (departmentId) => {

    return api.get(

        `doctors/doctors/?department=${departmentId}`

    );

};

// ===============================
// Get Single Doctor
// ===============================

export const getDoctorDetails = (doctorId) => {

    return api.get(

        `doctors/doctors/${doctorId}/`

    );

};