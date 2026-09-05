import api, { publicApi } from "./api";


// ==========================================================
// GET ALL TEST CATEGORIES
// Public
// GET: /api/tests/categories/
// ==========================================================

export const getTestCategories = async () => {
    const response = await publicApi.get(
        "tests/categories/"
    );

    return response.data;
};


// ==========================================================
// GET ALL DIAGNOSTIC TESTS
// Public
// GET: /api/tests/tests/
// ==========================================================

export const getDiagnosticTests = async () => {
    const response = await publicApi.get(
        "tests/tests/"
    );

    return response.data;
};


// ==========================================================
// GET SINGLE DIAGNOSTIC TEST
// Public
// GET: /api/tests/tests/<id>/
// ==========================================================

export const getDiagnosticTestDetails = async (
    testId
) => {
    const response = await publicApi.get(
        `tests/tests/${testId}/`
    );

    return response.data;
};


// ==========================================================
// BOOK DIAGNOSTIC TEST
// Private - JWT Required
// POST: /api/tests/book/
// ==========================================================

export const bookDiagnosticTest = async (
    bookingData
) => {
    const response = await api.post(
        "tests/book/",
        bookingData
    );

    return response.data;
};


// ==========================================================
// GET MY TEST BOOKINGS
// Private - JWT Required
// GET: /api/tests/bookings/
// ==========================================================

export const getMyTestBookings = async () => {
    const response = await api.get(
        "tests/bookings/"
    );

    return response.data;
};


// ==========================================================
// GET SINGLE BOOKING DETAILS
// Private - JWT Required
// GET: /api/tests/bookings/<id>/
// ==========================================================

export const getTestBookingDetails = async (
    bookingId
) => {
    const response = await api.get(
        `tests/bookings/${bookingId}/`
    );

    return response.data;
};


// ==========================================================
// CANCEL TEST BOOKING
// Private - JWT Required
// PATCH: /api/tests/bookings/<id>/cancel/
// ==========================================================

export const cancelTestBooking = async (
    bookingId
) => {
    const response = await api.patch(
        `tests/bookings/${bookingId}/cancel/`
    );

    return response.data;
};

export const getAdminCategories = async () => (await api.get("tests/admin/categories/")).data;
export const saveAdminCategory = async (data, id = null) => (await (id ? api.patch(`tests/admin/categories/${id}/`, data) : api.post("tests/admin/categories/", data))).data;
export const deleteAdminCategory = async (id) => api.delete(`tests/admin/categories/${id}/`);
export const getAdminDiagnosticTests = async () => (await api.get("tests/admin/tests/")).data;
export const saveAdminDiagnosticTest = async (data, id = null) => (await (id ? api.patch(`tests/admin/tests/${id}/`, data) : api.post("tests/admin/tests/", data))).data;
export const deleteAdminDiagnosticTest = async (id) => api.delete(`tests/admin/tests/${id}/`);
export const getAdminTestBookings = async () => (await api.get("tests/admin/bookings/")).data;
export const updateAdminTestBookingStatus = async (id, status) => (await api.patch(`tests/admin/bookings/${id}/status/`, { status })).data;