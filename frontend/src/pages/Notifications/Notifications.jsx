import {
    useEffect,
    useState,
} from "react";

import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
} from "../../services/notificationService";


function Notifications() {

    // ======================================================
    // States
    // ======================================================

    const [
        notifications,
        setNotifications
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    const [
        actionLoading,
        setActionLoading
    ] = useState(false);


    // ======================================================
    // Load Notifications
    // ======================================================

    const loadNotifications = async () => {

        try {

            setLoading(true);

            setError("");

            const data =
                await getNotifications();

            // ----------------------------------------------
            // Django pagination support
            // ----------------------------------------------

            if (Array.isArray(data)) {

                setNotifications(data);

            } else if (
                Array.isArray(data.results)
            ) {

                setNotifications(
                    data.results
                );

            } else {

                setNotifications([]);

            }

        } catch (error) {

            console.error(
                "Notifications Error:",
                error
            );

            console.error(
                "Backend Error:",
                error.response?.data
            );

            setError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to load notifications. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // Load On Page Open
    // ======================================================

    useEffect(() => {

        loadNotifications();

    }, []);


    // ======================================================
    // Mark One as Read
    // ======================================================

    const handleMarkAsRead =
        async (notification) => {

            // Already read
            if (notification.is_read) {

                return;

            }

            try {

                setActionLoading(true);

                await markNotificationRead(
                    notification.id
                );

                setNotifications(
                    (previousNotifications) =>
                        previousNotifications.map(
                            (item) => {

                                if (
                                    item.id ===
                                    notification.id
                                ) {

                                    return {
                                        ...item,
                                        is_read: true,
                                    };

                                }

                                return item;

                            }
                        )
                );

            } catch (error) {

                console.error(
                    "Mark Read Error:",
                    error
                );

                alert(
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    "Unable to mark notification as read."
                );

            } finally {

                setActionLoading(false);

            }

        };


    // ======================================================
    // Mark All as Read
    // ======================================================

    const handleMarkAllAsRead =
        async () => {

            try {

                setActionLoading(true);

                await markAllNotificationsRead();

                setNotifications(
                    (previousNotifications) =>
                        previousNotifications.map(
                            (notification) => ({
                                ...notification,
                                is_read: true,
                            })
                        )
                );

            } catch (error) {

                console.error(
                    "Mark All Read Error:",
                    error
                );

                alert(
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    "Unable to mark all notifications as read."
                );

            } finally {

                setActionLoading(false);

            }

        };


    // ======================================================
    // Delete Notification
    // ======================================================

    const handleDelete =
        async (notificationId) => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this notification?"
                );

            if (!confirmed) {

                return;

            }

            try {

                setActionLoading(true);

                await deleteNotification(
                    notificationId
                );

                setNotifications(
                    (previousNotifications) =>
                        previousNotifications.filter(
                            (notification) =>
                                notification.id !==
                                notificationId
                        )
                );

            } catch (error) {

                console.error(
                    "Delete Notification Error:",
                    error
                );

                alert(
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    "Unable to delete notification."
                );

            } finally {

                setActionLoading(false);

            }

        };


    // ======================================================
    // Notification Type Icon
    // ======================================================

    const getNotificationIcon =
        (type) => {

            switch (type) {

                case "Appointment":
                    return "📅";

                case "Payment":
                    return "💳";

                case "Report":
                    return "📄";

                case "Diagnostic":
                    return "🧪";

                default:
                    return "🔔";

            }

        };


    // ======================================================
    // Format Date
    // ======================================================

    const formatDate = (date) => {

        if (!date) {

            return "";

        }

        return new Date(
            date
        ).toLocaleString();

    };


    // ======================================================
    // Unread Count
    // ======================================================

    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.is_read
        ).length;


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="page-container">

                <h2>
                    Notifications
                </h2>

                <p>
                    Loading notifications...
                </p>

            </div>

        );

    }


    // ======================================================
    // Error
    // ======================================================

    if (error) {

        return (

            <div className="page-container">

                <h2>
                    Notifications
                </h2>

                <p>
                    ⚠️ {error}
                </p>

                <button
                    onClick={loadNotifications}
                >
                    Try Again
                </button>

            </div>

        );

    }


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="page-container">

            {/* Header */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    marginBottom: "25px",
                    flexWrap: "wrap",
                    gap: "15px",
                }}
            >

                <div>

                    <h2>
                        🔔 Notifications
                    </h2>

                    <p>

                        {unreadCount > 0
                            ? `${unreadCount} unread notification(s)`
                            : "You are all caught up!"
                        }

                    </p>

                </div>


                {/* Mark All Button */}

                {unreadCount > 0 && (

                    <button
                        onClick={
                            handleMarkAllAsRead
                        }
                        disabled={
                            actionLoading
                        }
                    >

                        Mark All as Read

                    </button>

                )}

            </div>


            {/* Empty State */}

            {notifications.length === 0 ? (

                <div
                    style={{
                        textAlign: "center",
                        padding: "50px 20px",
                    }}
                >

                    <div
                        style={{
                            fontSize: "50px",
                        }}
                    >
                        🔔
                    </div>

                    <h3>
                        No Notifications
                    </h3>

                    <p>
                        You don't have any notifications yet.
                    </p>

                </div>

            ) : (

                <div>

                    {notifications.map(
                        (notification) => (

                            <div
                                key={
                                    notification.id
                                }

                                style={{
                                    border:
                                        "1px solid #ddd",

                                    padding:
                                        "20px",

                                    marginBottom:
                                        "15px",

                                    borderRadius:
                                        "10px",

                                    background:
                                        notification.is_read
                                            ? "#ffffff"
                                            : "#f0f7ff",

                                    opacity:
                                        notification.is_read
                                            ? 0.8
                                            : 1,
                                }}
                            >

                                <div
                                    style={{
                                        display:
                                            "flex",

                                        justifyContent:
                                            "space-between",

                                        alignItems:
                                            "flex-start",

                                        gap:
                                            "15px",
                                    }}
                                >

                                    {/* Content */}

                                    <div>

                                        <h4
                                            style={{
                                                marginTop: 0,
                                            }}
                                        >

                                            {
                                                getNotificationIcon(
                                                    notification.notification_type
                                                )
                                            }

                                            {" "}

                                            {
                                                notification.title
                                            }

                                        </h4>


                                        <p>

                                            {
                                                notification.message
                                            }

                                        </p>


                                        <small>

                                            {
                                                notification.notification_type
                                            }

                                            {" • "}

                                            {
                                                formatDate(
                                                    notification.created_at
                                                )
                                            }

                                        </small>


                                        {!notification.is_read && (

                                            <div
                                                style={{
                                                    marginTop:
                                                        "10px",
                                                }}
                                            >

                                                <span>

                                                    ● Unread

                                                </span>

                                            </div>

                                        )}

                                    </div>


                                    {/* Actions */}

                                    <div
                                        style={{
                                            display:
                                                "flex",

                                            flexDirection:
                                                "column",

                                            gap:
                                                "8px",
                                        }}
                                    >

                                        {!notification.is_read && (

                                            <button
                                                onClick={() =>
                                                    handleMarkAsRead(
                                                        notification
                                                    )
                                                }

                                                disabled={
                                                    actionLoading
                                                }
                                            >

                                                Mark as Read

                                            </button>

                                        )}


                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    notification.id
                                                )
                                            }

                                            disabled={
                                                actionLoading
                                            }
                                        >

                                            Delete

                                        </button>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>

    );

}


export default Notifications;