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