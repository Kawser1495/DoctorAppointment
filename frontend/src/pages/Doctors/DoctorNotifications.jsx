import { useEffect, useMemo, useState } from "react";

import DoctorLayout from "../../layouts/DoctorLayout";
import {
    deleteNotification,
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "../../services/notificationService";
import "./DoctorNotifications.css";

const getList = (data) => (
    Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
);

const getIcon = (notification) => {
    const text = `${notification.title} ${notification.message}`.toLowerCase();
    if (text.includes("cancel")) return "fas fa-calendar-xmark";
    if (text.includes("reminder")) return "fas fa-clock";
    if (text.includes("book")) return "fas fa-calendar-plus";
    return "fas fa-bell";
};

const relativeTime = (value) => {
    const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
};

export default function DoctorNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [actionId, setActionId] = useState(null);

    const loadNotifications = async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true);
            else setLoading(true);
            setError("");
            setNotifications(getList(await getNotifications()));
        } catch (loadError) {
            setError(loadError?.response?.data?.detail || "Unable to load notifications.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadNotifications(); }, []);

    const unreadCount = notifications.filter((notification) => !notification.is_read).length;
    const visibleNotifications = useMemo(() => notifications.filter((notification) => (
        filter === "all" || (filter === "unread" && !notification.is_read) || (filter === "read" && notification.is_read)
    )), [filter, notifications]);

    const markRead = async (notification) => {
        if (notification.is_read) return;
        try {
            setActionId(notification.id);
            await markNotificationRead(notification.id);
            setNotifications((previous) => previous.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
        } catch (readError) {
            setError(readError?.response?.data?.detail || "Unable to mark notification as read.");
        } finally {
            setActionId(null);
        }
    };

    const markAllRead = async () => {
        try {
            setActionId("all");
            await markAllNotificationsRead();
            setNotifications((previous) => previous.map((notification) => ({ ...notification, is_read: true })));
        } catch (readError) {
            setError(readError?.response?.data?.detail || "Unable to mark notifications as read.");
        } finally {
            setActionId(null);
        }
    };

    const removeNotification = async (notification) => {
        try {
            setActionId(notification.id);
            await deleteNotification(notification.id);
            setNotifications((previous) => previous.filter((item) => item.id !== notification.id));
        } catch (deleteError) {
            setError(deleteError?.response?.data?.detail || "Unable to delete notification.");
        } finally {
            setActionId(null);
        }
    };

    if (loading) return <DoctorLayout><div className="doctor-notifications__loading">Loading notifications...</div></DoctorLayout>;

    return (
        <DoctorLayout>
            <div className="doctor-notifications">
                <header className="doctor-notifications__header"><div><p className="doctor-notifications__eyebrow">Clinic inbox</p><h1>Notifications</h1><p>Stay on top of bookings, cancellations and appointment reminders.</p></div><div className="doctor-notifications__header-actions"><button type="button" onClick={() => loadNotifications(true)} disabled={refreshing}><i className="fas fa-sync-alt" /> {refreshing ? "Refreshing" : "Refresh"}</button>{unreadCount > 0 && <button type="button" className="primary" onClick={markAllRead} disabled={actionId === "all"}><i className="fas fa-check-double" /> Mark all read</button>}</div></header>
                {error && <div className="doctor-notifications__alert">{error}</div>}
                <div className="doctor-notifications__toolbar"><div className="doctor-notifications__tabs"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All <span>{notifications.length}</span></button><button className={filter === "unread" ? "active" : ""} onClick={() => setFilter("unread")}>Unread <span>{unreadCount}</span></button><button className={filter === "read" ? "active" : ""} onClick={() => setFilter("read")}>Read</button></div></div>
                {visibleNotifications.length === 0 ? <div className="doctor-notifications__empty"><i className="fas fa-bell-slash" /><strong>{filter === "unread" ? "You are all caught up" : "No notifications yet"}</strong><span>New appointment activity will appear here.</span></div> : <div className="doctor-notifications__list">{visibleNotifications.map((notification) => <article key={notification.id} className={`doctor-notifications__item ${notification.is_read ? "" : "unread"}`}><div className="doctor-notifications__icon"><i className={getIcon(notification)} /></div><div className="doctor-notifications__content"><div className="doctor-notifications__item-top"><h2>{notification.title}</h2>{!notification.is_read && <span>New</span>}</div><p>{notification.message}</p><small>{relativeTime(notification.created_at)}</small></div><div className="doctor-notifications__actions">{!notification.is_read && <button type="button" onClick={() => markRead(notification)} disabled={actionId === notification.id} title="Mark as read"><i className="fas fa-check" /></button>}<button type="button" className="delete" onClick={() => removeNotification(notification)} disabled={actionId === notification.id} title="Delete notification"><i className="fas fa-trash" /></button></div></article>)}</div>}
            </div>
        </DoctorLayout>
    );
}