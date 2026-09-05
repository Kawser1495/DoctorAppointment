import {
    getNotificationsApi,
    getNotificationDetailsApi,
    markNotificationReadApi,
    markAllNotificationsReadApi,
    deleteNotificationApi,
} from "../api/notificationApi";


// ==========================================================
// Get Notifications
// ==========================================================

export const getNotifications = async () => {

    const response =
        await getNotificationsApi();

    return response.data;

};


// ==========================================================
// Get Notification Details
// ==========================================================

export const getNotificationDetails = async (id) => {

    const response =
        await getNotificationDetailsApi(id);

    return response.data;

};


// ==========================================================
// Mark Notification as Read
// ==========================================================

export const markNotificationRead = async (id) => {

    const response =
        await markNotificationReadApi(id);

    return response.data;

};


// ==========================================================
// Mark All Notifications as Read
// ==========================================================

export const markAllNotificationsRead = async () => {

    const response =
        await markAllNotificationsReadApi();

    return response.data;

};


// ==========================================================
// Delete Notification
// ==========================================================

export const deleteNotification = async (id) => {

    const response =
        await deleteNotificationApi(id);

    return response.data;

};

export const getAdminNotifications = async (params = {}) => {
    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/"}notifications/admin/?${new URLSearchParams(params)}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Unable to load admin notifications.");
    }

    return response.json();
};

export const markAdminNotificationRead = async (id) => {
    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/"}notifications/admin/${id}/read/`,
        { method: "PATCH", headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
    );
    return response.json();
};

export const deleteAdminNotification = async (id) => {
    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/"}notifications/admin/${id}/delete/`,
        { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
    );
    return response.ok;
};