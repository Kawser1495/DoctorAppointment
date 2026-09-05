import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBell, FaCheck, FaTrash, FaTimes } from "react-icons/fa";
import { deleteAdminNotification, getAdminNotifications, markAdminNotificationRead } from "../../services/notificationService";
import "./AdminNotifications.css";

const types = ["All", "Doctor Registration", "Doctor Approved", "Doctor Rejected", "Appointment", "Payment", "Diagnostic"];

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAdminNotifications(
                    filter === "All"
                        ? {}
                        : { notification_type: filter }
                );
                setNotifications(
                    Array.isArray(data)
                        ? data
                        : data?.results || []
                );
            } catch (requestError) {
                setError(
                    requestError.message ||
                    "Unable to load notifications."
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [filter]);
    const markRead = async (notification) => { if (!notification.is_read) { await markAdminNotificationRead(notification.id); setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, is_read: true } : item)); } };
    const remove = async (id) => { await deleteAdminNotification(id); setNotifications((items) => items.filter((item) => item.id !== id)); };

    return <div className="admin-notifications-page"><header className="admin-notifications-header"><div><Link to="/admin/dashboard" className="notifications-back"><FaArrowLeft /> Dashboard</Link><span className="notifications-kicker">SYSTEM / ACTIVITY</span><h1>Notifications</h1><p>Monitor important system events across the care network.</p></div><div className="notification-total"><strong>{notifications.filter((item) => !item.is_read).length}</strong><span>unread</span></div></header>{error && <div className="notifications-alert"><FaTimes /> {error}</div>}<div className="notification-filters">{types.map((type) => <button className={filter === type ? "active" : ""} key={type} onClick={() => setFilter(type)}>{type}</button>)}</div>{loading ? <div className="notifications-empty">Loading notifications...</div> : notifications.length === 0 ? <div className="notifications-empty"><FaBell /><h2>No notifications</h2><p>There are no system events for this filter.</p></div> : <section className="notification-list">{notifications.map((notification) => <article className={`notification-row ${notification.is_read ? "read" : "unread"}`} key={notification.id}><div className="notification-icon"><FaBell /></div><div className="notification-copy"><div><span className="notification-type">{notification.notification_type}</span><small>{notification.user_name || "System user"}</small></div><h2>{notification.title}</h2><p>{notification.message}</p><time>{notification.created_at ? new Date(notification.created_at).toLocaleString() : ""}</time></div><div className="notification-actions">{!notification.is_read && <button title="Mark as read" onClick={() => markRead(notification)}><FaCheck /></button>}<button className="delete" title="Delete notification" onClick={() => remove(notification.id)}><FaTrash /></button></div></article>)}</section>}</div>;
}
