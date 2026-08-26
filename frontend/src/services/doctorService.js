import { publicApi } from "./api";


// ==========================================================
// Helper Function
//
// Handles both:
//
// 1. Normal response:
//    [ ... ]
//
// 2. Paginated response:
//    {
//        count: 10,
//        results: [ ... ]
//    }
// ==========================================================

const normalizeListResponse = (response) => {

    if (
        Array.isArray(response.data)
    ) {

        return response;

    }


    if (
        Array.isArray(
            response.data?.results
        )
    ) {

        return {
            ...response,

            data: response.data.results,
        };

    }


    return {
        ...response,

        data: [],
    };

};


// ==========================================================
// Get All Departments
//
// GET:
// /api/doctors/departments/
// ==========================================================

export const getDepartments = async () => {

    const response = await publicApi.get(
        "doctors/departments/"
    );


    return normalizeListResponse(
        response
    );

};


// ==========================================================
// Get All Doctors
//
// GET:
// /api/doctors/doctors/
// ==========================================================

export const getDoctors = async () => {

    const response = await publicApi.get(
        "doctors/doctors/"
    );


    return normalizeListResponse(
        response
    );

};


// ==========================================================
// Get Single Doctor Details
//
// GET:
// /api/doctors/doctors/<id>/
// ==========================================================

export const getDoctorById = async (
    doctorId
) => {

    if (
        !doctorId
    ) {

        throw new Error(
            "Doctor ID is required."
        );

    }


    return publicApi.get(
        `doctors/doctors/${doctorId}/`
    );

};


// ==========================================================
// Search Doctors
//
// GET:
// /api/doctors/search/?search=cardiology
// ==========================================================

export const searchDoctors = async (
    searchQuery = ""
) => {

    const response = await publicApi.get(
        "doctors/search/",
        {
            params: {
                search: searchQuery,
            },
        }
    );


    return normalizeListResponse(
        response
    );

};


// ==========================================================
// Doctors by Department
//
// GET:
// /api/doctors/departments/<departmentId>/doctors/
// ==========================================================

export const getDoctorsByDepartment = async (
    departmentId
) => {

    if (
        !departmentId
    ) {

        return {
            data: [],
        };

    }


    const response = await publicApi.get(
        `doctors/departments/${departmentId}/doctors/`
    );


    return normalizeListResponse(
        response
    );

};


// ==========================================================
// Available Time Slots
//
// GET:
// /api/doctors/time-slots/?doctor=1
//
// OR:
//
// /api/doctors/time-slots/?doctor=1&date=2026-08-26
// ==========================================================

export const getAvailableTimeSlots = async (
    doctorId,
    date = ""
) => {

    if (
        !doctorId
    ) {

        return {
            data: [],
        };

    }


    const params = {
        doctor: doctorId,
    };


    if (
        date
    ) {

        params.date = date;

    }


    const response = await publicApi.get(
        "doctors/time-slots/",
        {
            params,
        }
    );


    return normalizeListResponse(
        response
    );

};