import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    FaCalendarCheck,
    FaClock,
    FaCheckCircle,
    FaUserMd,
    FaFileMedical,
    FaMoneyBillWave,
    FaUsers,
    FaBell,
    FaFlask,
    FaArrowRight,
    FaPlus,
    FaCalendarAlt,
    FaStethoscope,
    FaReceipt,
    FaClipboardList,
} from "react-icons/fa";

import useAuth from "../../context/useAuth";

import {
    getMyAppointments,
} from "../../services/appointmentService";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import "../../pages/Patients/patientDashboard.css";


// ==========================================================
// Helpers
// ==========================================================

const normalizeAppointments = (response) => {

    const data = response?.data;


    // Direct array
    if (Array.isArray(data)) {

        return data;

    }


    // Django REST Framework pagination
    if (Array.isArray(data?.results)) {

        return data.results;

    }


    // Nested data array
    if (Array.isArray(data?.data)) {

        return data.data;

    }


    // Nested appointments
    if (Array.isArray(data?.appointments)) {

        return data.appointments;

    }


    // Nested results
    if (Array.isArray(data?.data?.results)) {

        return data.data.results;

    }


    console.warn(
        "Unexpected appointments API response:",
        response
    );


    return [];

};


// ==========================================================
// Status Badge
// ==========================================================

const getStatusClass = (status) => {

    const normalized =
        String(status || "")
            .trim()
            .toLowerCase();


    switch (normalized) {

        case "pending":
            return "patient-status pending";

        case "confirmed":
            return "patient-status confirmed";

        case "completed":
            return "patient-status completed";

        case "cancelled":
            return "patient-status cancelled";

        case "rejected":
            return "patient-status rejected";

        default:
            return "patient-status default";

    }

};


// ==========================================================
// Format Date
// ==========================================================

const formatDate = (date) => {

    if (!date) {

        return "-";

    }


    const parsedDate =
        new Date(date);


    if (Number.isNaN(parsedDate.getTime())) {

        return String(date);

    }


    return parsedDate.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

};


// ==========================================================
// Patient Dashboard
// ==========================================================

export default function PatientDashboard() {

    const {
        user,
    } = useAuth();


    // ======================================================
    // State
    // ======================================================

    const [
        appointments,
        setAppointments,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    // ======================================================
    // Load Appointments
    // ======================================================

    useEffect(() => {

        let mounted = true;


        const loadAppointments = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await getMyAppointments();


                console.log(
                    "Patient Dashboard Appointments:",
                    response
                );


                const appointmentData =
                    normalizeAppointments(
                        response
                    );


                if (mounted) {

                    setAppointments(
                        appointmentData
                    );

                }

            }

            catch (err) {

                console.error(
                    "Patient dashboard appointment error:",
                    err
                );


                if (mounted) {

                    setAppointments([]);

                    setError(
                        err?.response?.data?.detail ||
                        err?.response?.data?.message ||
                        "Unable to load your appointments."
                    );

                }

            }

            finally {

                if (mounted) {

                    setLoading(false);

                }

            }

        };


        loadAppointments();


        return () => {

            mounted = false;

        };

    }, []);


    // ======================================================
    // Safe Appointments
    // ======================================================

    const safeAppointments = useMemo(() => {

        return Array.isArray(appointments)
            ? appointments
            : [];

    }, [appointments]);


    // ======================================================
    // Appointment Statistics
    // ======================================================

    const statistics = useMemo(() => {

        const result = {

            total: safeAppointments.length,

            pending: 0,

            confirmed: 0,

            completed: 0,

        };


        safeAppointments.forEach(
            (appointment) => {

                const status =
                    String(
                        appointment?.status || ""
                    )
                        .trim()
                        .toLowerCase();


                if (status === "pending") {

                    result.pending += 1;

                }

                else if (status === "confirmed") {

                    result.confirmed += 1;

                }

                else if (status === "completed") {

                    result.completed += 1;

                }

            }
        );


        return result;

    }, [safeAppointments]);


    // ======================================================
    // Recent Appointments
    // ======================================================

    const recentAppointments =
        useMemo(() => {

            return safeAppointments
                .slice()
                .sort(
                    (a, b) => {

                        const dateA =
                            new Date(
                                a?.appointment_date ||
                                a?.date ||
                                0
                            );


                        const dateB =
                            new Date(
                                b?.appointment_date ||
                                b?.date ||
                                0
                            );


                        return dateB - dateA;

                    }
                )
                .slice(0, 5);

        }, [safeAppointments]);


    // ======================================================
    // User Name
    // ======================================================

    const patientName =
        user?.first_name ||
        user?.name ||
        user?.username ||
        "Patient";


    // ======================================================
    // Render
    // ======================================================

    return (

        <div className="patient-dashboard">


            {/* ==================================================
                Common Navbar
            ================================================== */}

            <Navbar />


            {/* ==================================================
                Dashboard Layout
            ================================================== */}

            <div className="dashboard-container">


                {/* ==================================================
                    Common Sidebar
                ================================================== */}

                <Sidebar />


                {/* ==================================================
                    Patient Dashboard Content
                ================================================== */}

                <main className="patient-dashboard-content">


                    {/* ==================================================
                        Welcome Banner
                    ================================================== */}

                    <div className="patient-welcome-banner">

                        <div>

                            <span className="patient-welcome-label">
                                Patient Portal
                            </span>


                            <h1>
                                Welcome back, {patientName}! 👋
                            </h1>


                            <p>
                                Manage your appointments,
                                prescriptions, reports and
                                healthcare services from one place.
                            </p>


                            <div className="patient-welcome-actions">

                                <Link
                                    to="/appointments/book"
                                    className="patient-primary-btn"
                                >

                                    <FaPlus />

                                    Book Appointment

                                </Link>


                                <Link
                                    to="/doctors"
                                    className="patient-secondary-btn"
                                >

                                    <FaUserMd />

                                    Find Doctor

                                </Link>

                            </div>

                        </div>


                        <div className="patient-welcome-icon">

                            <FaStethoscope />

                        </div>

                    </div>


                    {/* ==================================================
                        Statistics
                    ================================================== */}

                    <div className="patient-section-title">

                        <div>

                            <h2>
                                Your Overview
                            </h2>

                            <p>
                                A quick summary of your healthcare activity
                            </p>

                        </div>

                    </div>


                    <div className="patient-stat-grid">


                        {/* Total */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon blue">

                                <FaCalendarCheck />

                            </div>

                            <div>

                                <span>
                                    Total Appointments
                                </span>

                                <strong>
                                    {statistics.total}
                                </strong>

                            </div>

                        </div>


                        {/* Pending */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon orange">

                                <FaClock />

                            </div>

                            <div>

                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {statistics.pending}
                                </strong>

                            </div>

                        </div>


                        {/* Confirmed */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon purple">

                                <FaCheckCircle />

                            </div>

                            <div>

                                <span>
                                    Confirmed
                                </span>

                                <strong>
                                    {statistics.confirmed}
                                </strong>

                            </div>

                        </div>


                        {/* Completed */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon green">

                                <FaCheckCircle />

                            </div>

                            <div>

                                <span>
                                    Completed
                                </span>

                                <strong>
                                    {statistics.completed}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        Healthcare Services
                    ================================================== */}

                    <div className="patient-section-title">

                        <div>

                            <h2>
                                Healthcare Services
                            </h2>

                            <p>
                                Everything you need in one place
                            </p>

                        </div>

                    </div>


                    <div className="patient-service-grid">


                        {/* Doctors */}

                        <Link
                            to="/doctors"
                            className="patient-service-card"
                        >

                            <div className="patient-service-icon blue">

                                <FaUserMd />

                            </div>

                            <div>

                                <h3>
                                    Find a Doctor
                                </h3>

                                <p>
                                    Browse doctors and specialists
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>


                        {/* Appointments */}

                        <Link
                            to="/appointments"
                            className="patient-service-card"
                        >

                            <div className="patient-service-icon green">

                                <FaCalendarCheck />

                            </div>

                            <div>

                                <h3>
                                    Appointments
                                </h3>

                                <p>
                                    View and manage appointments
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>


                        {/* Medical Reports */}

                        <Link
                            to="/reports"
                            className="patient-service-card"
                        >

                            <div className="patient-service-icon red">

                                <FaFileMedical />

                            </div>

                            <div>

                                <h3>
                                    Medical Reports
                                </h3>

                                <p>
                                    Access your medical records
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>


                        {/* Payments */}

                        <Link
                            to="/payments"
                            className="patient-service-card"
                        >

                            <div className="patient-service-icon teal">

                                <FaMoneyBillWave />

                            </div>

                            <div>

                                <h3>
                                    Payments
                                </h3>

                                <p>
                                    Manage payments and invoices
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>


                        {/* Family Members */}

                        <Link
                            to="/family"
                            className="patient-service-card"
                        >

                            <div className="patient-service-icon pink">

                                <FaUsers />

                            </div>

                            <div>

                                <h3>
                                    Family Members
                                </h3>

                                <p>
                                    Manage your family profiles
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>


                        {/* Notifications */}

                        <Link
                            to="/notifications"
                            className="patient-service-card"
                        >

                            <div className="patient-service-icon indigo">

                                <FaBell />

                            </div>

                            <div>

                                <h3>
                                    Notifications
                                </h3>

                                <p>
                                    View important updates
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>


                        {/* Diagnostic Tests */}

                        <Link
                            to="/tests"
                            className="patient-service-card"
                        >

                            <div className="patient-service-icon cyan">

                                <FaFlask />

                            </div>

                            <div>

                                <h3>
                                    Diagnostic Tests
                                </h3>

                                <p>
                                    Book and manage diagnostic tests
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>


                        {/* My Diagnostic Bookings */}

                        <Link
                            to="/my-diagnostic-bookings"
                            className="patient-service-card"
                        >

                            <div className="patient-service-icon violet">

                                <FaClipboardList />

                            </div>

                            <div>

                                <h3>
                                    My Diagnostic Bookings
                                </h3>

                                <p>
                                    View bookings and make payments
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>


                        {/* Prescriptions */}

                        <Link
                            to="/reports"
                            className="patient-service-card"
                        >

                            <div className="patient-service-icon violet">

                                <FaReceipt />

                            </div>

                            <div>

                                <h3>
                                    Prescriptions
                                </h3>

                                <p>
                                    Access your prescriptions
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>

                    </div>


                    {/* ==================================================
                        Bottom Content
                    ================================================== */}

                    <div className="patient-main-grid">


                        {/* ==================================================
                            Recent Appointments
                        ================================================== */}

                        <div className="patient-panel">

                            <div className="patient-panel-header">

                                <div>

                                    <h2>
                                        Recent Appointments
                                    </h2>

                                    <p>
                                        Your latest appointment activity
                                    </p>

                                </div>


                                <Link
                                    to="/appointments"
                                    className="patient-view-all"
                                >

                                    View All

                                    <FaArrowRight />

                                </Link>

                            </div>


                            {/* Loading */}

                            {loading && (

                                <div className="patient-empty-state">

                                    <div className="patient-spinner" />

                                    <p>
                                        Loading appointments...
                                    </p>

                                </div>

                            )}


                            {/* Error */}

                            {!loading && error && (

                                <div className="patient-error">

                                    {error}

                                </div>

                            )}


                            {/* Empty */}

                            {!loading &&
                                !error &&
                                recentAppointments.length === 0 && (

                                    <div className="patient-empty-state">

                                        <div className="patient-empty-icon">

                                            <FaCalendarAlt />

                                        </div>


                                        <h3>
                                            No appointments yet
                                        </h3>


                                        <p>
                                            You haven't booked an appointment yet.
                                        </p>


                                        <Link
                                            to="/appointments/book"
                                            className="patient-primary-btn"
                                        >

                                            <FaPlus />

                                            Book Your First Appointment

                                        </Link>

                                    </div>

                                )}


                            {/* Appointment List */}

                            {!loading &&
                                !error &&
                                recentAppointments.length > 0 && (

                                    <div className="patient-appointment-list">

                                        {recentAppointments.map(
                                            (
                                                appointment,
                                                index
                                            ) => {

                                                const appointmentId =
                                                    appointment?.id;


                                                const status =
                                                    appointment?.status ||
                                                    "Unknown";


                                                const doctorName =
                                                    appointment?.doctor_name ||
                                                    appointment?.doctor?.name ||
                                                    appointment?.doctor?.username ||
                                                    appointment?.doctor?.full_name ||
                                                    "Doctor";


                                                const appointmentDate =
                                                    appointment?.appointment_date ||
                                                    appointment?.date;


                                                return (

                                                    <div
                                                        className="patient-appointment-item"
                                                        key={
                                                            appointmentId ||
                                                            `appointment-${index}`
                                                        }
                                                    >

                                                        <div className="patient-appointment-date">

                                                            <FaCalendarAlt />

                                                            <span>
                                                                {
                                                                    formatDate(
                                                                        appointmentDate
                                                                    )
                                                                }
                                                            </span>

                                                        </div>


                                                        <div className="patient-appointment-info">

                                                            <h3>
                                                                {doctorName}
                                                            </h3>


                                                            <p>

                                                                {
                                                                    appointment?.booking_number ||
                                                                    `Appointment #${appointmentId || "-"}`
                                                                }

                                                            </p>

                                                        </div>


                                                        <span
                                                            className={
                                                                getStatusClass(
                                                                    status
                                                                )
                                                            }
                                                        >

                                                            {status}

                                                        </span>


                                                        {appointmentId && (

                                                            <Link
                                                                to={
                                                                    `/appointments/details/${appointmentId}`
                                                                }
                                                                className="patient-details-btn"
                                                            >

                                                                Details

                                                            </Link>

                                                        )}

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                )}

                        </div>


                        {/* ==================================================
                            Quick Access
                        ================================================== */}

                        <div className="patient-panel patient-side-panel">

                            <div className="patient-panel-header">

                                <div>

                                    <h2>
                                        Quick Access
                                    </h2>

                                    <p>
                                        Frequently used services
                                    </p>

                                </div>

                            </div>


                            <div className="patient-quick-links">


                                {/* Book Appointment */}

                                <Link
                                    to="/appointments/book"
                                    className="patient-quick-link"
                                >

                                    <span className="blue">

                                        <FaPlus />

                                    </span>

                                    <div>

                                        <strong>
                                            Book Appointment
                                        </strong>

                                        <small>
                                            Schedule a doctor visit
                                        </small>

                                    </div>

                                    <FaArrowRight />

                                </Link>


                                {/* Payment History */}

                                <Link
                                    to="/payments"
                                    className="patient-quick-link"
                                >

                                    <span className="green">

                                        <FaMoneyBillWave />

                                    </span>

                                    <div>

                                        <strong>
                                            Payment History
                                        </strong>

                                        <small>
                                            View your transactions
                                        </small>

                                    </div>

                                    <FaArrowRight />

                                </Link>


                                {/* Medical Reports */}

                                <Link
                                    to="/reports"
                                    className="patient-quick-link"
                                >

                                    <span className="red">

                                        <FaFileMedical />

                                    </span>

                                    <div>

                                        <strong>
                                            Medical Reports
                                        </strong>

                                        <small>
                                            View your medical records
                                        </small>

                                    </div>

                                    <FaArrowRight />

                                </Link>


                                {/* Family Members */}

                                <Link
                                    to="/family"
                                    className="patient-quick-link"
                                >

                                    <span className="pink">

                                        <FaUsers />

                                    </span>

                                    <div>

                                        <strong>
                                            Family Members
                                        </strong>

                                        <small>
                                            Manage family profiles
                                        </small>

                                    </div>

                                    <FaArrowRight />

                                </Link>


                                {/* Notifications */}

                                <Link
                                    to="/notifications"
                                    className="patient-quick-link"
                                >

                                    <span className="indigo">

                                        <FaBell />

                                    </span>

                                    <div>

                                        <strong>
                                            Notifications
                                        </strong>

                                        <small>
                                            Check recent updates
                                        </small>

                                    </div>

                                    <FaArrowRight />

                                </Link>


                                {/* Diagnostic Bookings */}

                                <Link
                                    to="/my-diagnostic-bookings"
                                    className="patient-quick-link"
                                >

                                    <span className="violet">

                                        <FaClipboardList />

                                    </span>

                                    <div>

                                        <strong>
                                            My Diagnostic Bookings
                                        </strong>

                                        <small>
                                            View bookings and make payments
                                        </small>

                                    </div>

                                    <FaArrowRight />

                                </Link>


                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        Footer
                    ================================================== */}

                    <div className="patient-dashboard-footer">

                        <span>
                            © {new Date().getFullYear()} MediCare
                        </span>

                        <span>
                            Patient Healthcare Portal
                        </span>

                    </div>


                </main>

            </div>

        </div>

    );

}