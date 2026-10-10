import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaArrowRight,
    FaBell,
    FaCalendarAlt,
    FaCalendarCheck,
    FaCalendarDay,
    FaChartPie,
    FaCheckCircle,
    FaCheckDouble,
    FaChevronDown,
    FaClock,
    FaCog,
    FaCreditCard,
    FaExclamationTriangle,
    FaFileMedical,
    FaHeartbeat,
    FaMoneyBillWave,
    FaRedo,
    FaShieldAlt,
    FaSitemap,
    FaSignOutAlt,
    FaTimesCircle,
    FaUserClock,
    FaUserInjured,
    FaUserMd,
    FaUserCheck,
    FaVials,
} from "react-icons/fa";

import useAuth from "../../context/useAuth";
import { getDashboardData } from "../../services/dashboardApi";
import { getDiagnosticTests } from "../../services/diagnosticService";

import "./AdminDashboard.css";

const dashboardIcons = {
    "fas fa-arrow-right": FaArrowRight,
    "fas fa-bell": FaBell,
    "fas fa-calendar-alt": FaCalendarAlt,
    "fas fa-calendar-check": FaCalendarCheck,
    "fas fa-calendar-day": FaCalendarDay,
    "fas fa-chart-pie": FaChartPie,
    "fas fa-check-circle": FaCheckCircle,
    "fas fa-check-double": FaCheckDouble,
    "fas fa-chevron-down": FaChevronDown,
    "fas fa-clock": FaClock,
    "fas fa-cog": FaCog,
    "fas fa-credit-card": FaCreditCard,
    "fas fa-exclamation-triangle": FaExclamationTriangle,
    "fas fa-file-medical": FaFileMedical,
    "fas fa-heartbeat": FaHeartbeat,
    "fas fa-money-bill-wave": FaMoneyBillWave,
    "fas fa-redo": FaRedo,
    "fas fa-shield-alt": FaShieldAlt,
    "fas fa-sitemap": FaSitemap,
    "fas fa-sign-out-alt": FaSignOutAlt,
    "fas fa-times-circle": FaTimesCircle,
    "fas fa-user-check": FaUserCheck,
    "fas fa-user-clock": FaUserClock,
    "fas fa-user-injured": FaUserInjured,
    "fas fa-user-md": FaUserMd,
    "fas fa-vials": FaVials,
};

function DashboardIcon({ name, ...props }) {
    const Icon = dashboardIcons[name];

    return Icon ? <Icon aria-hidden="true" {...props} /> : null;
}


export default function AdminDashboard() {
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] = useState({});
    const [diagnosticTestCount, setDiagnosticTestCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAdminMenu, setShowAdminMenu] = useState(false);

    const firstName =
        user?.first_name ||
        user?.username ||
        "Administrator";

    const todayLabel = new Intl.DateTimeFormat(
        "en-US",
        {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    ).format(new Date());


    // ==========================================================
    // LOAD DASHBOARD
    // ==========================================================

    useEffect(() => {
        let mounted = true;
        let loadedDate = new Date().toDateString();

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [response, diagnosticResponse] = await Promise.all([
                    getDashboardData(),
                    getDiagnosticTests(),
                ]);

                if (!mounted) {
                    return;
                }

                const responseData =
                    response?.data || {};

                setDashboard(
                    responseData.data ||
                    responseData
                );

                const diagnosticTests = Array.isArray(diagnosticResponse)
                    ? diagnosticResponse
                    : diagnosticResponse?.results || [];
                setDiagnosticTestCount(diagnosticTests.length);
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

        const refreshAtDateChange = window.setInterval(() => {
            const currentDate = new Date().toDateString();

            if (currentDate !== loadedDate) {
                loadedDate = currentDate;
                loadDashboard();
            }
        }, 60 * 1000);

        return () => {
            mounted = false;
            window.clearInterval(refreshAtDateChange);
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
            title: "Running Appointments",
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
            link: `/admin/appointments?date=${(() => { const today = new Date(); return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`; })()}`,
        },

        {
            title: "Upcoming Appointments",
            value: dashboard.upcoming_appointments,
            icon: "fas fa-calendar-alt",
            className: "stat-indigo",
            link: "/admin/appointments?upcoming=true",
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
            title: "Diagnostic Tests",
            value: diagnosticTestCount,
            icon: "fas fa-vials",
            className: "stat-cyan",
            link: "/tests",
        },

        {
            title: "Medical Reports",
            value: dashboard.total_medical_reports,
            icon: "fas fa-file-medical",
            className: "stat-dark",
            link: "/admin/reports",
        },

        {
            title: "Unread Notifications",
            value: dashboard.unread_notifications,
            icon: "fas fa-bell",
            className: "stat-yellow",
            link: "/admin/notifications",
        },

        {
            title: "Payment History",
            value: dashboard.payment_summary?.total ?? 0,
            icon: "fas fa-credit-card",
            className: "stat-teal",
            link: "/admin/payments",
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

    const paymentOverview = [
        { title: "All payments", value: dashboard.payment_summary?.total, icon: "fas fa-credit-card", className: "payment-summary-all" },
        { title: "Paid", value: dashboard.payment_summary?.paid, icon: "fas fa-check-circle", className: "payment-summary-paid" },
        { title: "Pending", value: dashboard.payment_summary?.pending, icon: "fas fa-clock", className: "payment-summary-pending" },
        { title: "Refunded", value: dashboard.payment_summary?.refunded, icon: "fas fa-redo", className: "payment-summary-refunded" },
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
                        <DashboardIcon name="fas fa-exclamation-triangle" />
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
                        <DashboardIcon name="fas fa-redo" />
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
                        <DashboardIcon name="fas fa-heartbeat" />
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
                        <DashboardIcon name="fas fa-chart-pie" />
                        <span>Dashboard</span>
                    </Link>


                    <p className="nav-title">
                        MANAGEMENT
                    </p>

                    <Link
                        to="/admin/doctor-requests"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-user-clock" />
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
                        <DashboardIcon name="fas fa-user-md" />
                        <span>Doctors</span>
                    </Link>

                    <Link
                        to="/admin/patients"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-user-injured" />
                        <span>Patients</span>
                    </Link>

                    <Link
                        to="/admin/departments"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-sitemap" />
                        <span>Departments</span>
                    </Link>

                    <Link
                        to="/admin/appointments"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-calendar-check" />
                        <span>Appointments</span>
                    </Link>

                    <Link
                        to="/admin/schedules"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-clock" />
                        <span>Schedules</span>
                    </Link>

                    <Link
                        to="/admin/payments"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-credit-card" />
                        <span>Payments</span>
                    </Link>

                    <Link
                        to="/admin/diagnostics"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-vials" />
                        <span>Diagnostics</span>
                    </Link>


                    <Link
                        to="/admin/Sarzil"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-vials" />
                        <span>Sarzil</span>
                    </Link>

                    <Link
                        to="/admin/reports"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-file-medical" />
                        <span>Medical Reports</span>
                    </Link>


                    <p className="nav-title">
                        SYSTEM
                    </p>

                    <Link
                        to="/admin/notifications"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-bell" />
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
                        to="/admin/analytics"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-chart-pie" />
                        <span>Analytics</span>
                    </Link>

                    <Link
                        to="/settings"
                        className="admin-nav-link"
                    >
                        <DashboardIcon name="fas fa-cog" />
                        <span>Settings</span>
                    </Link>

                </nav>


                <div className="sidebar-bottom">

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={logout}
                    >
                        <DashboardIcon name="fas fa-sign-out-alt" />
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
                            Operations Overview
                        </h2>
                    </div>


                    <div className="admin-header-right">

                        <Link
                            to="/admin/notifications"
                            className="header-icon"
                            title="Notifications"
                        >
                            <DashboardIcon name="fas fa-bell" />

                            {Number(
                                dashboard.unread_notifications || 0
                            ) > 0 && (
                                <span className="notification-dot">
                                    {dashboard.unread_notifications}
                                </span>
                            )}
                        </Link>


                        <div className="admin-profile">
                            <button
                                type="button"
                                className="admin-user"
                                onClick={() => setShowAdminMenu((visible) => !visible)}
                                aria-expanded={showAdminMenu}
                                aria-haspopup="menu"
                            >
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

                                <DashboardIcon name="fas fa-chevron-down" />
                            </button>

                            {showAdminMenu && (
                                <div className="admin-profile-menu" role="menu">
                                    <Link
                                        to="/settings"
                                        role="menuitem"
                                        onClick={() => setShowAdminMenu(false)}
                                    >
                                        Settings
                                    </Link>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={logout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                </header>


                {/* CONTENT */}

                <div className="admin-content">

                    {/* WELCOME */}

                    <section className="welcome-section">

                        <div>

                            <span className="welcome-badge">
                                <DashboardIcon name="fas fa-shield-alt" />
                                Admin Operations
                            </span>

                            <h3>
                                Welcome back, {firstName}.
                            </h3>

                            <p>
                                Keep the clinic moving with a clear view of
                                people, bookings, payments, and care delivery.
                            </p>

                            <div className="welcome-meta">
                                <span className="live-indicator">
                                    <span></span>
                                    System online
                                </span>
                                <span>{todayLabel}</span>
                            </div>

                        </div>


                        <Link
                            to="/admin/doctor-requests"
                            className="primary-action"
                        >
                            <DashboardIcon name="fas fa-user-clock" />
                            Review pending requests
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
                                            <DashboardIcon name="fas fa-arrow-right" />
                                        </span>

                                    </div>


                                    <div
                                        className={`stat-icon ${stat.className}`}
                                    >
                                            <DashboardIcon name={stat.icon} />
                                    </div>

                                </div>

                            </Link>
                        ))}

                        <Link
                            to="/doctors"
                            className="stat-card"
                        >
                            <div className="stat-card-top">
                                <div className="stat-content">
                                    <p>Find a Doctor</p>
                                    <h3>{Number(dashboard.total_doctors || 0).toLocaleString()}</h3>
                                    <span className="stat-link-text">
                                        View doctor list
                                        <DashboardIcon name="fas fa-arrow-right" />
                                    </span>
                                </div>
                                <div className="stat-icon stat-green">
                                    <DashboardIcon name="fas fa-user-md" />
                                </div>
                            </div>
                        </Link>

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
                                <DashboardIcon name="fas fa-arrow-right" />
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
                                            <DashboardIcon name={item.icon} />
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

                    <section className="section-card payment-overview-section">
                        <div className="section-header">
                            <div>
                                <span className="section-eyebrow">FINANCIAL ACTIVITY</span>
                                <h4>Payment Overview</h4>
                                <p>Current payment status across all patient services.</p>
                            </div>
                            <Link to="/admin/payments" className="view-all">
                                View All
                                <DashboardIcon name="fas fa-arrow-right" />
                            </Link>
                        </div>
                        <div className="summary-grid payment-summary-grid">
                            {paymentOverview.map((item) => (
                                <div className={`summary-item ${item.className}`} key={item.title}>
                                    <div className="payment-summary-icon"><DashboardIcon name={item.icon} /></div>
                                    <div><span>{item.title}</span><strong>{Number(item.value || 0).toLocaleString()}</strong></div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

            </main>

        </div>
    );
}