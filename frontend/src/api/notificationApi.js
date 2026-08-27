import api from "./axios";


// ==========================================================
// Get My Notifications
// GET: /api/notifications/
// ==========================================================

export const getNotificationsApi = async () => {

    return await api.get(
        "notifications/"
    );

};


// ==========================================================
// Get Notification Details
// GET: /api/notifications/:id/
// ==========================================================

export const getNotificationDetailsApi = async (id) => {

    return await api.get(
        `notifications/${id}/`
    );

};


// ==========================================================
// Mark Single Notification as Read
// PATCH: /api/notifications/:id/read/
// ==========================================================

export const markNotificationReadApi = async (id) => {

    return await api.patch(
        `notifications/${id}/read/`
    );

};


// ==========================================================
// Mark All Notifications as Read
// PATCH: /api/notifications/read-all/
// ==========================================================

export const markAllNotificationsReadApi = async () => {

    return await api.patch(
        "notifications/read-all/"
    );

};


// ==========================================================
// Delete Notification
// DELETE: /api/notifications/:id/delete/
// ==========================================================

export const deleteNotificationApi = async (id) => {

    return await api.delete(
        `notifications/${id}/delete/`
    );

};