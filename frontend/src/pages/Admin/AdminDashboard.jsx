import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import useAuth from "../../context/useAuth";
import { getDashboardData } from "../../services/dashboardApi";

import "./AdminDashboard.css";


export default function AdminDashboard() {
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const firstName =
        user?.first_name ||
        user?.username ||
        "Administrator";


    // ==========================================================
    // LOAD DASHBOARD
    // ==========================================================

    useEffect(() => {
        let mounted = true;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getDashboardData();

                if (!mounted) {
                    return;
                }

                const responseData =
                    response?.data || {};

                setDashboard(
                    responseData.data ||
                    responseData
                );
            } catch (err) {
                console.error(
                    "Admin Dashboard Error:",
                    err
                );

                if (!mounted) {
                    return;
                }

                setError(
                    err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    "Unable to load admin dashboard."
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            mounted = false;
        };
    }, []);


    // ==========================================================
    // FORMAT CURRENCY
    // ==========================================================

    const formatCurrency = (value) => {
        const amount = Number(value || 0);

        return new Intl.NumberFormat(
            "en-BD",
            {
                style: "currency",
                currency: "BDT",
                maximumFractionDigits: 0,
            }
        ).format(amount);
    };


    // ==========================================================
    // DASHBOARD CARDS
    // ==========================================================

    const stats = [
        {
            title: "Total Patients",
            value: dashboard.total_patients,
            icon: "fas fa-user-injured",
            className: "stat-blue",
            link: "/admin/patients",
        },

        {
            title: "Total Doctors",
            value: dashboard.total_doctors,
            icon: "fas fa-user-md",
            className: "stat-green",
            link: "/admin/doctors",
        },

        {
            title: "Pending Doctor Requests",
            value: dashboard.pending_doctor_requests,
            icon: "fas fa-user-clock",
            className: "stat-orange",
            link: "/admin/doctor-requests",
        },

        {
            title: "Approved Doctors",
            value: dashboard.approved_doctors,
            icon: "fas fa-user-check",
            className: "stat-teal",
            link: "/admin/doctors",
        },

        {
            title: "Total Appointments",
            value: dashboard.total_appointments,
            icon: "fas fa-calendar-check",
            className: "stat-purple",
            link: "/admin/appointments",
        },

        {
            title: "Today's Appointments",
            value: dashboard.today_appointments,
            icon: "fas fa-calendar-day",
            className: "stat-red",
            link: "/admin/appointments",
        },

        {
            title: "Upcoming Appointments",
            value: dashboard.upcoming_appointments,
            icon: "fas fa-calendar-alt",
            className: "stat-indigo",
            link: "/admin/appointments",
        },

        {
            title: "Total Revenue",
            value: formatCurrency(
                dashboard.total_revenue
            ),
            icon: "fas fa-wallet",
            className: "stat-money",
            link: "/admin/payments",
            currency: true,
        },

        {
            title: "Pending Payments",
            value: dashboard.pending_payments,
            icon: "fas fa-credit-card",
            className: "stat-pink",
            link: "/admin/payments",
        },

        {
            title: "Diagnostic Bookings",
            value: dashboard.total_diagnostic_bookings,
            icon: "fas fa-vials",
            className: "stat-cyan",
            link: "/tests",
        },

        {
            title: "Medical Reports",
            value: dashboard.total_medical_reports,
            icon: "fas fa-file-medical",
            className: "stat-dark",
            link: "/reports",
        },

        {
            title: "Notifications",
            value: dashboard.total_notifications,
            icon: "fas fa-bell",
            className: "stat-yellow",
            link: "/notifications",
        },
    ];


    // ==========================================================
    // APPOINTMENT STATUS
    // ==========================================================

    const appointmentStatuses = [
        {
            title: "Pending",
            value: dashboard.pending_appointments,
            icon: "fas fa-clock",
            className: "status-pending",
        },

        {
            title: "Confirmed",
            value: dashboard.confirmed_appointments,
            icon: "fas fa-check-circle",
            className: "status-confirmed",
        },

        {
            title: "Completed",
            value: dashboard.completed_appointments,
            icon: "fas fa-check-double",
            className: "status-completed",
        },

        {
            title: "Cancelled",
            value: dashboard.cancelled_appointments,
            icon: "fas fa-times-circle",
            className: "status-cancelled",
        },
    ];


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>

                <h3>
                    Loading Admin Dashboard
                </h3>

                <p>
                    Please wait while we load
                    system statistics...
                </p>
            </div>
        );
    }


    // ==========================================================
    // ERROR
    // ==========================================================

    if (error) {
        return (
            <div className="dashboard-error-page">
                <div className="error-card">

                    <div className="error-icon">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>

                    <h3>
                        Dashboard Unavailable
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="retry-btn"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        <i className="fas fa-redo"></i>
                        Try Again
                    </button>

                </div>
            </div>
        );
    }


    // ==========================================================
    // RENDER
    // ==========================================================

    return (
        <div className="admin-dashboard">

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside className="admin-sidebar">

                <div className="admin-logo">

                    <div className="admin-logo-icon">
                        <i className="fas fa-heartbeat"></i>
                    </div>

                    <div>
                        <strong>
                            MediCare
                        </strong>

                        <span>
                            Connect
                        </span>
                    </div>

                </div>


                <nav className="admin-nav">

                    <p className="nav-title">
                        OVERVIEW
                    </p>

                    <Link
                        to="/admin/dashboard"
                        className="admin-nav-link active"
                    >
                        <i className="fas fa-chart-pie"></i>
                        <span>Dashboard</span>
                    </Link>


                    <p className="nav-title">
                        MANAGEMENT
                    </p>

                    <Link
                        to="/admin/doctor-requests"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-user-clock"></i>
                        <span>Doctor Requests</span>

                        {Number(
                            dashboard.pending_doctor_requests || 0
                        ) > 0 && (
                            <span className="notification-badge">
                                {dashboard.pending_doctor_requests}
                            </span>
                        )}
                    </Link>

                    <Link
                        to="/admin/doctors"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-user-md"></i>
                        <span>Doctors</span>
                    </Link>

                    <Link
                        to="/admin/patients"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-user-injured"></i>
                        <span>Patients</span>
                    </Link>

                    <Link
                        to="/admin/appointments"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-calendar-check"></i>
                        <span>Appointments</span>
                    </Link>

                    <Link
                        to="/admin/payments"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-credit-card"></i>
                        <span>Payments</span>
                    </Link>

                    <Link
                        to="/tests"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-vials"></i>
                        <span>Diagnostics</span>
                    </Link>

                    <Link
                        to="/reports"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-file-medical"></i>
                        <span>Medical Reports</span>
                    </Link>


                    <p className="nav-title">
                        SYSTEM
                    </p>

                    <Link
                        to="/notifications"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-bell"></i>
                        <span>Notifications</span>

                        {Number(
                            dashboard.unread_notifications || 0
                        ) > 0 && (
                            <span className="notification-badge">
                                {dashboard.unread_notifications}
                            </span>
                        )}
                    </Link>

                    <Link
                        to="/settings"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-cog"></i>
                        <span>Settings</span>
                    </Link>

                </nav>


                <div className="sidebar-bottom">

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={logout}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>

                </div>

            </aside>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="admin-main">

                {/* HEADER */}

                <header className="admin-header">

                    <div>
                        <span className="breadcrumb-text">
                            Admin
                            <span>/</span>
                            Dashboard
                        </span>

                        <h2>
                            Admin Dashboard
                        </h2>
                    </div>


                    <div className="admin-header-right">

                        <Link
                            to="/notifications"
                            className="header-icon"
                            title="Notifications"
                        >
                            <i className="fas fa-bell"></i>

                            {Number(
                                dashboard.unread_notifications || 0
                            ) > 0 && (
                                <span className="notification-dot">
                                    {dashboard.unread_notifications}
                                </span>
                            )}
                        </Link>


                        <div className="admin-user">

                            <div className="admin-avatar">
                                {firstName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="admin-user-info">
                                <strong>
                                    {firstName}
                                </strong>

                                <span>
                                    Administrator
                                </span>
                            </div>

                        </div>

                    </div>

                </header>


                {/* CONTENT */}

                <div className="admin-content">

                    {/* WELCOME */}

                    <section className="welcome-section">

                        <div>

                            <span className="welcome-badge">
                                <i className="fas fa-shield-alt"></i>
                                Administrator Access
                            </span>

                            <h3>
                                Welcome back, {firstName}! 👋
                            </h3>

                            <p>
                                Monitor and manage your
                                healthcare system from
                                one central dashboard.
                            </p>

                        </div>


                        <Link
                            to="/admin/doctor-requests"
                            className="primary-action"
                        >
                            <i className="fas fa-user-clock"></i>
                            Review Doctor Requests
                        </Link>

                    </section>


                    {/* ==================================================
                        STATISTICS
                    ================================================== */}

                    <section className="stats-grid">

                        {stats.map((stat) => (
                            <Link
                                to={stat.link}
                                className="stat-card"
                                key={stat.title}
                            >

                                <div className="stat-card-top">

                                    <div className="stat-content">

                                        <p>
                                            {stat.title}
                                        </p>

                                        <h3>
                                            {stat.currency
                                                ? stat.value
                                                : Number(
                                                    stat.value || 0
                                                ).toLocaleString()
                                            }
                                        </h3>

                                        <span className="stat-link-text">
                                            View details
                                            <i className="fas fa-arrow-right"></i>
                                        </span>

                                    </div>


                                    <div
                                        className={`stat-icon ${stat.className}`}
                                    >
                                        <i className={stat.icon}></i>
                                    </div>

                                </div>

                            </Link>
                        ))}

                    </section>


                    {/* ==================================================
                        APPOINTMENT OVERVIEW
                    ================================================== */}

                    <section className="section-card">

                        <div className="section-header">

                            <div>

                                <span className="section-eyebrow">
                                    OPERATIONS
                                </span>

                                <h4>
                                    Appointment Overview
                                </h4>

                                <p>
                                    Current appointment activity
                                    across the healthcare system.
                                </p>

                            </div>


                            <Link
                                to="/admin/appointments"
                                className="view-all"
                            >
                                View All
                                <i className="fas fa-arrow-right"></i>
                            </Link>

                        </div>


                        <div className="appointment-grid">

                            {appointmentStatuses.map(
                                (item) => (
                                    <div
                                        className={`appointment-status ${item.className}`}
                                        key={item.title}
                                    >

                                        <div className="status-icon">
                                            <i className={item.icon}></i>
                                        </div>

                                        <div>
                                            <span>
                                                {item.title}
                                            </span>

                                            <strong>
                                                {Number(
                                                    item.value || 0
                                                ).toLocaleString()}
                                            </strong>
                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </section>


                    {/* ==================================================
                        SYSTEM SUMMARY
                    ================================================== */}

                    <section className="section-card">

                        <div className="section-header">

                            <div>

                                <span className="section-eyebrow">
                                    SYSTEM
                                </span>

                                <h4>
                                    Healthcare Summary
                                </h4>

                                <p>
                                    Quick overview of today's
                                    healthcare operations.
                                </p>

                            </div>

                        </div>


                        <div className="summary-grid">

                            <div className="summary-item">
                                <i className="fas fa-calendar-day"></i>

                                <div>
                                    <span>
                                        Today's Appointments
                                    </span>

                                    <strong>
                                        {Number(
                                            dashboard.today_appointments || 0
                                        ).toLocaleString()}
                                    </strong>
                                </div>
                            </div>


                            <div className="summary-item">
                                <i className="fas fa-calendar-alt"></i>

                                <div>
                                    <span>
                                        Upcoming Appointments
                                    </span>

                                    <strong>
                                        {Number(
                                            dashboard.upcoming_appointments || 0
                                        ).toLocaleString()}
                                    </strong>
                                </div>
                            </div>


                            <div className="summary-item">
                                <i className="fas fa-user-clock"></i>

                                <div>
                                    <span>
                                        Doctor Requests
                                    </span>

                                    <strong>
                                        {Number(
                                            dashboard.pending_doctor_requests || 0
                                        ).toLocaleString()}
                                    </strong>
                                </div>
                            </div>


                            <div className="summary-item">
                                <i className="fas fa-money-bill-wave"></i>

                                <div>
                                    <span>
                                        Pending Payments
                                    </span>

                                    <strong>
                                        {Number(
                                            dashboard.pending_payments || 0
                                        ).toLocaleString()}
                                    </strong>
                                </div>
                            </div>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}