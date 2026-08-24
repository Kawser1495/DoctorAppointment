import { publicApi } from "./api";


// ==========================================
// Doctors by Department
// ==========================================

export const getDoctorsByDepartment = (
    departmentId
) => {

    return publicApi.get(
        `doctors/departments/${departmentId}/doctors/`
    );

};


// ==========================================
// Available Time Slots
// ==========================================

export const getAvailableTimeSlots = (
    doctorId,
    date
) => {

    return publicApi.get(
        "doctors/time-slots/",
        {
            params: {
                doctor: doctorId,
                date: date,
            },
        }
    );

};