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

export const getAdminDoctorDetails = async (id) => {
    return await api.get(`doctors/admin/${id}/`);
};

export const updateAdminDoctorDepartment = async (id, departmentId) => {
    return await api.patch(`doctors/admin/${id}/`, { department: departmentId || null });
};

export const deleteAdminDoctor = async (id) => {
    return await api.delete(`doctors/admin/${id}/`);
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

export const getMyDoctorSchedules = async () => {

    return await api.get(
        "doctors/schedules/"
    );

};

export const getDoctorAnalytics = async () => {

    return await api.get(
        "doctors/analytics/"
    );

};

export const getDoctorRatings = async (doctorId) => {
    return await api.get(
        `doctors/ratings/?doctor=${doctorId}`
    );
};

export const getMyRatings = async () => {
    return await api.get("doctors/ratings/");
};

export const createDoctorRating = async (ratingData) => {
    return await api.post("doctors/ratings/", ratingData);
};

export const createDoctorSchedule = async (scheduleData) => {

    return await api.post(
        "doctors/schedules/",
        scheduleData
    );

};

export const updateDoctorSchedule = async (scheduleId, scheduleData) => {

    return await api.patch(
        `doctors/schedules/${scheduleId}/`,
        scheduleData
    );

};

export const deleteDoctorSchedule = async (scheduleId) => {

    return await api.delete(
        `doctors/schedules/${scheduleId}/`
    );

};

export const updateDoctorTimeSlot = async (slotId, slotData) => {

    return await api.patch(
        `doctors/schedules/slots/${slotId}/`,
        slotData
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

export const getAdminSchedules = async () => api.get("doctors/admin/schedules/");
export const createAdminSchedule = async (data) => api.post("doctors/admin/schedules/", data);
export const updateAdminSchedule = async (id, data) => api.patch(`doctors/admin/schedules/${id}/`, data);
export const deleteAdminSchedule = async (id) => api.delete(`doctors/admin/schedules/${id}/`);
export const setAdminSlotAvailability = async (id, isActive) => api.patch(`doctors/admin/time-slots/${id}/availability/`, { is_active: isActive });