import { Link } from "react-router-dom";
import useAuth from "../../context/useAuth";
import "./AdminDashboard.css";


// ==========================================================
// Admin Dashboard
// ==========================================================

export default function AdminDashboard() {

    const { user, logout } = useAuth();

    const firstName =
        user?.first_name ||
        user?.username ||
        "Administrator";


    return (

        <div className="admin-dashboard">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside className="admin-sidebar">


                {/* Logo */}

                <div className="admin-logo">

                    <div className="admin-logo-icon">
                        <i className="fas fa-heartbeat"></i>
                    </div>

                    <div>

                        <h4>
                            MediCare
                        </h4>

                        <span>
                            Admin Panel
                        </span>

                    </div>

                </div>



                {/* Navigation */}

                <nav className="admin-nav">


                    {/* Main Menu */}

                    <p className="nav-section-title">
                        MAIN MENU
                    </p>


                    <Link
                        to="/admin/dashboard"
                        className="admin-nav-link active"
                    >
                        <i className="fas fa-th-large"></i>

                        <span>
                            Dashboard
                        </span>
                    </Link>


                    <Link
                        to="/admin/users"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-users"></i>

                        <span>
                            User Management
                        </span>
                    </Link>


                    <Link
                        to="/admin/doctors"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-user-md"></i>

                        <span>
                            Doctors
                        </span>
                    </Link>


                    <Link
                        to="/admin/appointments"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-calendar-check"></i>

                        <span>
                            Appointments
                        </span>
                    </Link>


                    <Link
                        to="/admin/payments"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-credit-card"></i>

                        <span>
                            Payments
                        </span>
                    </Link>



                    {/* Services */}

                    <p className="nav-section-title mt-4">
                        SERVICES
                    </p>


                    <Link
                        to="/tests"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-vials"></i>

                        <span>
                            Diagnostics
                        </span>
                    </Link>


                    <Link
                        to="/reports"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-file-medical"></i>

                        <span>
                            Medical Reports
                        </span>
                    </Link>



                    {/* System */}

                    <p className="nav-section-title mt-4">
                        SYSTEM
                    </p>


                    <Link
                        to="/notifications"
                        className="admin-nav-link"
                    >

                        <i className="fas fa-bell"></i>

                        <span>
                            Notifications
                        </span>

                    </Link>


                    <Link
                        to="/settings"
                        className="admin-nav-link"
                    >
                        <i className="fas fa-cog"></i>

                        <span>
                            Settings
                        </span>
                    </Link>

                </nav>



                {/* ==================================================
                    SIDEBAR BOTTOM
                ================================================== */}

                <div className="sidebar-bottom">


                    {/* Need Help */}

                    <Link
                        to="/admin/support"
                        className="sidebar-help"
                    >

                        <div className="sidebar-help-icon">

                            <i className="fas fa-headset"></i>

                        </div>


                        <div>

                            <strong>
                                Need Help?
                            </strong>

                            <span>
                                Contact support
                            </span>

                        </div>

                    </Link>



                    {/* Logout */}

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={logout}
                    >

                        <i className="fas fa-sign-out-alt"></i>

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>



            {/* ==================================================
                MAIN AREA
            ================================================== */}

            <main className="admin-main">



                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="admin-header">


                    {/* Header Title */}

                    <div>

                        <div className="breadcrumb-text">
                            Admin Panel / Dashboard
                        </div>

                        <h2>
                            Dashboard
                        </h2>

                    </div>



                    {/* Header Right */}

                    <div className="admin-header-right">


                        {/* ==================================================
                            Notification Bell
                        ================================================== */}

                        <Link
                            to="/notifications"
                            className="header-icon"
                            aria-label="Notifications"
                            title="Notifications"
                        >

                            <i className="fas fa-bell"></i>

                        </Link>



                        {/* ==================================================
                            Admin User
                        ================================================== */}

                        <div className="admin-user">


                            {/* Avatar */}

                            <div className="admin-avatar">

                                {firstName
                                    .charAt(0)
                                    .toUpperCase()
                                }

                            </div>



                            {/* User Information */}

                            <div className="admin-user-info">

                                <strong>
                                    {firstName}
                                </strong>

                                <span>
                                    Administrator
                                </span>

                            </div>



                            {/* Dropdown Icon */}

                            <i className="fas fa-chevron-down admin-user-arrow"></i>

                        </div>

                    </div>

                </header>



                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div className="admin-content">



                    {/* ==================================================
                        WELCOME SECTION
                    ================================================== */}

                    <div className="welcome-section">


                        <div>

                            <h3>
                                Welcome back, {firstName}! 👋
                            </h3>

                            <p>
                                Here's what's happening with your
                                healthcare system today.
                            </p>

                        </div>


                        <Link
                            to="/admin/appointments"
                            className="primary-action"
                        >

                            <i className="fas fa-calendar-plus"></i>

                            Manage Appointments

                        </Link>

                    </div>



                    {/* ==================================================
                        STATISTICS
                    ================================================== */}

                    <div className="stats-grid">


                        {/* ==================================================
                            PATIENTS
                        ================================================== */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <div>

                                    <p>
                                        Total Patients
                                    </p>

                                    <h3>
                                        0
                                    </h3>

                                </div>


                                <div className="stat-icon patients">

                                    <i className="fas fa-users"></i>

                                </div>

                            </div>

                        </div>



                        {/* ==================================================
                            DOCTORS
                        ================================================== */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <div>

                                    <p>
                                        Total Doctors
                                    </p>

                                    <h3>
                                        0
                                    </h3>

                                </div>


                                <div className="stat-icon doctors">

                                    <i className="fas fa-user-md"></i>

                                </div>

                            </div>

                        </div>



                        {/* ==================================================
                            APPOINTMENTS
                        ================================================== */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <div>

                                    <p>
                                        Appointments
                                    </p>

                                    <h3>
                                        0
                                    </h3>

                                </div>


                                <div className="stat-icon appointments">

                                    <i className="fas fa-calendar-check"></i>

                                </div>

                            </div>

                        </div>



                        {/* ==================================================
                            REVENUE
                        ================================================== */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <div>

                                    <p>
                                        Total Revenue
                                    </p>

                                    <h3>
                                        ৳0
                                    </h3>

                                </div>


                                <div className="stat-icon revenue">

                                    <i className="fas fa-wallet"></i>

                                </div>

                            </div>

                        </div>

                    </div>



                    {/* ==================================================
                        APPOINTMENT OVERVIEW
                    ================================================== */}

                    <div className="section-card">


                        <div className="section-header">


                            <div>

                                <h4>
                                    Appointment Overview
                                </h4>

                                <p>
                                    Current appointment status
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


                            {/* Pending */}

                            <div className="appointment-status pending">

                                <div className="status-icon">
                                    <i className="fas fa-clock"></i>
                                </div>

                                <div>

                                    <span>
                                        Pending
                                    </span>

                                    <strong>
                                        0
                                    </strong>

                                </div>

                            </div>



                            {/* Confirmed */}

                            <div className="appointment-status confirmed">

                                <div className="status-icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>

                                <div>

                                    <span>
                                        Confirmed
                                    </span>

                                    <strong>
                                        0
                                    </strong>

                                </div>

                            </div>



                            {/* Completed */}

                            <div className="appointment-status completed">

                                <div className="status-icon">
                                    <i className="fas fa-check-double"></i>
                                </div>

                                <div>

                                    <span>
                                        Completed
                                    </span>

                                    <strong>
                                        0
                                    </strong>

                                </div>

                            </div>



                            {/* Cancelled */}

                            <div className="appointment-status cancelled">

                                <div className="status-icon">
                                    <i className="fas fa-times-circle"></i>
                                </div>

                                <div>

                                    <span>
                                        Cancelled
                                    </span>

                                    <strong>
                                        0
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>



                    {/* ==================================================
                        QUICK MANAGEMENT
                    ================================================== */}

                    <div className="section-card">


                        <div className="section-header">

                            <div>

                                <h4>
                                    Quick Management
                                </h4>

                                <p>
                                    Manage your healthcare system
                                </p>

                            </div>

                        </div>



                        <div className="management-grid">


                            {/* User Management */}

                            <Link
                                to="/admin/users"
                                className="management-card"
                            >

                                <div className="management-icon blue">

                                    <i className="fas fa-users"></i>

                                </div>

                                <div>

                                    <h5>
                                        User Management
                                    </h5>

                                    <p>
                                        Manage patients, doctors
                                        and staff.
                                    </p>

                                </div>

                                <i className="fas fa-arrow-right management-arrow"></i>

                            </Link>



                            {/* Doctor Management */}

                            <Link
                                to="/admin/doctors"
                                className="management-card"
                            >

                                <div className="management-icon green">

                                    <i className="fas fa-user-md"></i>

                                </div>

                                <div>

                                    <h5>
                                        Doctor Management
                                    </h5>

                                    <p>
                                        Manage doctor accounts
                                        and information.
                                    </p>

                                </div>

                                <i className="fas fa-arrow-right management-arrow"></i>

                            </Link>



                            {/* Appointments */}

                            <Link
                                to="/admin/appointments"
                                className="management-card"
                            >

                                <div className="management-icon purple">

                                    <i className="fas fa-calendar-alt"></i>

                                </div>

                                <div>

                                    <h5>
                                        Appointments
                                    </h5>

                                    <p>
                                        Monitor and manage
                                        appointments.
                                    </p>

                                </div>

                                <i className="fas fa-arrow-right management-arrow"></i>

                            </Link>



                            {/* Payments */}

                            <Link
                                to="/admin/payments"
                                className="management-card"
                            >

                                <div className="management-icon orange">

                                    <i className="fas fa-credit-card"></i>

                                </div>

                                <div>

                                    <h5>
                                        Payments
                                    </h5>

                                    <p>
                                        Monitor payments and
                                        revenue.
                                    </p>

                                </div>

                                <i className="fas fa-arrow-right management-arrow"></i>

                            </Link>

                        </div>

                    </div>



                    {/* ==================================================
                        SYSTEM MANAGEMENT
                    ================================================== */}

                    <div className="section-card">


                        <div className="section-header">

                            <div>

                                <h4>
                                    System Management
                                </h4>

                                <p>
                                    Access important system features
                                </p>

                            </div>

                        </div>



                        <div className="system-actions">


                            {/* Diagnostics */}

                            <Link
                                to="/tests"
                                className="system-action"
                            >

                                <i className="fas fa-vials"></i>

                                <span>
                                    Diagnostic Tests
                                </span>

                            </Link>



                            {/* Payments */}

                            <Link
                                to="/admin/payments"
                                className="system-action"
                            >

                                <i className="fas fa-wallet"></i>

                                <span>
                                    Payment Management
                                </span>

                            </Link>



                            {/* Notifications */}

                            <Link
                                to="/notifications"
                                className="system-action"
                            >

                                <i className="fas fa-bell"></i>

                                <span>
                                    Notifications
                                </span>

                            </Link>



                            {/* Settings */}

                            <Link
                                to="/settings"
                                className="system-action"
                            >

                                <i className="fas fa-cog"></i>

                                <span>
                                    Settings
                                </span>

                            </Link>

                        </div>

                    </div>


                </div>

            </main>

        </div>

    );

}