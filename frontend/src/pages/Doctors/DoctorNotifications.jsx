import { useEffect, useState } from "react";
import DoctorLayout from "../../layouts/DoctorLayout";
import api from "../../services/api";
import "./DoctorNotifications.css";

export default function DoctorNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get("/notifications/");
            setNotifications(Array.isArray(response?.data) ? response.data : []);
        } catch (err) {
            console.error("Load notifications error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const sampleNotifications = [
        {
            id: 1,
            type: "appointment_booked",
            title: "New Appointment",
            message: "Kawser Talukder has booked an appointment for tomorrow at 10:30 AM",
            time: "2 hours ago",
            read: false,
            icon: "fas fa-calendar-plus",
        },
        {
            id: 2,
            type: "appointment_cancelled",
            title: "Appointment Cancelled",
            message: "Sumaiya Islam cancelled their appointment",
            time: "1 day ago",
            read: true,
            icon: "fas fa-calendar-times",
        },
        {
            id: 3,
            type: "reminder",
            title: "Appointment Reminder",
            message: "You have an appointment with Tamim Ahmed in 30 minutes",
            time: "30 mins ago",
            read: true,
            icon: "fas fa-bell",
        },
    ];

    if (loading) {
        return (
            <DoctorLayout>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                    <h5 className="mt-3">Loading Notifications</h5>
                </div>
            </DoctorLayout>
        );
    }

    return (
        <DoctorLayout>
            <div className="doctor-notifications">
                <h2 className="doctor-notifications__title">
                    <i className="fas fa-bell me-2" />
                    Notifications
                </h2>

                {sampleNotifications.length === 0 ? (
                    <div className="card border-0 text-center py-5">
                        <div className="card-body">
                            <i className="fas fa-bell fa-3x text-muted mb-3" />
                            <h5>No notifications</h5>
                            <p className="text-muted mb-0">You're all caught up!</p>
                        </div>
                    </div>
                ) : (
                    <div className="doctor-notifications__list">
                        {sampleNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`doctor-notifications__item ${!notif.read ? "unread" : ""}`}
                            >
                                <div className="doctor-notifications__icon">
                                    <i className={notif.icon} />
                                </div>
                                <div className="doctor-notifications__content">
                                    <h5 className="doctor-notifications__title-small">{notif.title}</h5>
                                    <p className="doctor-notifications__message">{notif.message}</p>
                                    <small className="doctor-notifications__time">{notif.time}</small>
                                </div>
                                <div className="doctor-notifications__status">
                                    {!notif.read && <span className="badge bg-primary">New</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
}
