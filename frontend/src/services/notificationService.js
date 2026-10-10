import {
    getNotificationsApi,
    getNotificationDetailsApi,
    markNotificationReadApi,
    markAllNotificationsReadApi,
    deleteNotificationApi,
} from "../api/notificationApi";
import api from "../api/axios";


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

    window.dispatchEvent(new Event("notifications-updated"));
    return response.data;

};


// ==========================================================
// Mark All Notifications as Read
// ==========================================================

export const markAllNotificationsRead = async () => {

    const response =
        await markAllNotificationsReadApi();

    window.dispatchEvent(new Event("notifications-updated"));
    return response.data;

};


// ==========================================================
// Delete Notification
// ==========================================================

export const deleteNotification = async (id) => {

    const response =
        await deleteNotificationApi(id);

    window.dispatchEvent(new Event("notifications-updated"));
    return response.data;

};

export const getAdminNotifications = async (params = {}) => {
    const response = await api.get("notifications/admin/", { params });
    return response.data;
};

export const markAdminNotificationRead = async (id) => {
    const response = await api.patch(`notifications/admin/${id}/read/`);
    return response.data;
};

export const markAllAdminNotificationsRead = async () => {
    const response = await api.patch("notifications/admin/read-all/");
    return response.data;
};

export const deleteAdminNotification = async (id) => {
    await api.delete(`notifications/admin/${id}/delete/`);
    return true;
};