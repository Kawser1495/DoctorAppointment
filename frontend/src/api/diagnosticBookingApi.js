import api from "./axios";


// ==========================================================
// Get My Diagnostic Test Bookings
//
// GET:
// /api/tests/bookings/
// ==========================================================

export const getMyDiagnosticBookings = () => {

    return api.get(
        "/tests/bookings/"
    );

};


// ==========================================================
// Get Diagnostic Booking Details
//
// GET:
// /api/tests/bookings/<id>/
// ==========================================================

export const getDiagnosticBookingDetails = (id) => {

    return api.get(
        `/tests/bookings/${id}/`
    );

};