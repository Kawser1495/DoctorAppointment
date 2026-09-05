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

export const getDoctorDetails = async (id) => {

    return await api.get(
        `doctors/doctors/${id}/`
    );

};


// ==========================================================
// Get Doctor By ID
//
// Alias for getDoctorDetails()
//
// GET:
// /api/doctors/doctors/<id>/
// ==========================================================

export const getDoctorById = async (id) => {

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
// /api/doctors/search/?search=keyword
// ==========================================================

export const searchDoctors = async (search) => {

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

export const getDoctorsByDepartment = async (
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

export const getDoctorSchedules = async (
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
// /api/doctors/time-slots/?doctor=<id>&date=<date>
// ==========================================================

export const getAvailableTimeSlots = async (
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


// ==========================================================
// Get My Doctor Profile
//
// GET:
// /api/doctors/me/profile/
// ==========================================================

export const getDoctorProfile = async () => {

    return await api.get(
        "doctors/me/profile/"
    );

};

// ==========================================================
// Update My Doctor Profile
//
// PATCH:
// /api/doctors/me/profile/
// ==========================================================

export const updateDoctorProfile = async (
    profileData
) => {

    return await api.patch(
        "doctors/me/profile/",
        profileData,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data",
            },
        }
    );

};


// ==========================================================
// Replace My Doctor Profile
//
// PUT:
// /api/doctors/me/profile/
// ==========================================================

export const replaceDoctorProfile = async (
    profileData
) => {

    return await api.put(
        "doctors/me/profile/",
        profileData
    );

};


// ==========================================================
// Admin: Pending Doctor Requests
// ==========================================================

export const getPendingDoctorRequests = async () => {

    return await api.get(
        "doctors/admin/pending/"
    );

};


// ==========================================================
// Admin: Approve Doctor
// ==========================================================

export const approveDoctor = async (doctorId) => {

    return await api.post(
        `doctors/admin/${doctorId}/approve/`
    );

};


// ==========================================================
// Admin: Reject Doctor
// ==========================================================

export const rejectDoctor = async (
    doctorId,
    rejectionReason
) => {

    return await api.post(
        `doctors/admin/${doctorId}/reject/`,
        {
            rejection_reason: rejectionReason,
        }
    );

};

export const getAdminDoctors = async () => {
    return await api.get("doctors/admin/all/");
};

export const setDoctorAvailability = async (doctorId, isAvailable) => {
    return await api.patch(
        `doctors/admin/${doctorId}/availability/`,
        { is_available: isAvailable }
    );
};