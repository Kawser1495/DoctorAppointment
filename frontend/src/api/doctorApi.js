import api from "../api/axios";


// ==========================================================
// Get All Doctors
//
// GET:
// /api/doctors/doctors/
// ==========================================================

export const getDoctors = async () => {

    return await api.get(
        "doctors/doctors/"
    );

};


// ==========================================================
// Get Doctor Details
//
// GET:
// /api/doctors/doctors/<id>/
// ==========================================================

export const getDoctorDetails = async (
    id
) => {

    return await api.get(
        `doctors/doctors/${id}/`
    );

};


// ==========================================================
// Get Departments
//
// GET:
// /api/doctors/departments/
// ==========================================================

export const getDepartments = async () => {

    return await api.get(
        "doctors/departments/"
    );

};


// ==========================================================
// Search Doctors
//
// GET:
// /api/doctors/search/?search=...
// ==========================================================

export const searchDoctors = async (
    search
) => {

    return await api.get(
        "doctors/search/",
        {
            params: {
                search,
            },
        }
    );

};


// ==========================================================
// Get Doctors By Department
//
// GET:
// /api/doctors/departments/<department_id>/doctors/
// ==========================================================

export const getDoctorsByDepartment =
    async (
        departmentId
    ) => {

        return await api.get(
            `doctors/departments/${departmentId}/doctors/`
        );

    };


// ==========================================================
// Get Doctor Schedules
//
// GET:
// /api/doctors/doctors/<doctor_id>/schedules/
// ==========================================================

export const getDoctorSchedules =
    async (
        doctorId
    ) => {

        return await api.get(
            `doctors/doctors/${doctorId}/schedules/`
        );

    };


// ==========================================================
// Get Available Time Slots
//
// GET:
// /api/doctors/time-slots/?doctor=1&date=...
// ==========================================================

export const getAvailableTimeSlots =
    async (
        doctorId,
        date
    ) => {

        return await api.get(
            "doctors/time-slots/",
            {
                params: {
                    doctor: doctorId,
                    date,
                },
            }
        );

    };