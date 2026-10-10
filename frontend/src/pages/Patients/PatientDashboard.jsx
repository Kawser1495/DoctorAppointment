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
    FaUser,
    FaCalendarAlt,
    FaStethoscope,
    FaClipboardList,
    FaUserFriends,
    FaStar,
    FaBookMedical,
} from "react-icons/fa";

import useAuth from "../../context/useAuth";

import {
    getMyAppointments,
} from "../../services/appointmentService";

import {
    getDoctors,
    getMyRatings,
    createDoctorRating,
} from "../../services/doctorService";

import {
    getMyTestBookings,
} from "../../services/diagnosticService";

import {
    getMedicalReports,
} from "../../services/reportService";

import {
    getMyPayments,
} from "../../services/paymentService";

import {
    getFamilyMembers,
} from "../../services/familyService";

import {
    getNotifications,
} from "../../services/notificationService";

import {
    getDashboardData,
} from "../../services/dashboardApi";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import "../../pages/Patients/patientDashboard.css";


// ==========================================================
// Helper: Normalize API Response
// ==========================================================

const normalizeListResponse = (
    response
) => {

    if (
        Array.isArray(response)
    ) {

        return response;

    }


    if (
        Array.isArray(response?.data)
    ) {

        return response.data;

    }


    if (
        Array.isArray(response?.results)
    ) {

        return response.results;

    }


    if (
        Array.isArray(response?.data?.results)
    ) {

        return response.data.results;

    }


    if (
        Array.isArray(response?.data?.data)
    ) {

        return response.data.data;

    }


    return [];

};


// ==========================================================
// Normalize Appointments
// ==========================================================

const normalizeAppointments = (
    response
) => {

    const data = response?.data ?? response;


    if (
        Array.isArray(data)
    ) {

        return data;

    }


    if (
        Array.isArray(data?.results)
    ) {

        return data.results;

    }


    if (
        Array.isArray(data?.data)
    ) {

        return data.data;

    }


    if (
        Array.isArray(data?.appointments)
    ) {

        return data.appointments;

    }


    if (
        Array.isArray(
            data?.data?.results
        )
    ) {

        return data.data.results;

    }

    if (Array.isArray(data?.data?.appointments)) {

        return data.data.appointments;

    }


    return [];

};

const getAppointmentStatus = (appointment) => (
    String(
        appointment?.status ||
        appointment?.appointment_status ||
        appointment?.status_display ||
        ""
    ).trim().toLowerCase()
);

const isRateableAppointment = (appointment) => (
    ["pending", "confirmed", "completed", "complete"].includes(getAppointmentStatus(appointment))
);


// ==========================================================
// Status Badge
// ==========================================================

const getStatusClass = (
    status
) => {

    const normalized =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    switch (
        normalized
    ) {

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

const formatDate = (
    date
) => {

    if (
        !date
    ) {

        return "-";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

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
// Format Currency
// ==========================================================

const formatCurrency = (
    amount
) => {

    const numericAmount =
        Number(amount || 0);


    return new Intl.NumberFormat(
        "en-BD",
        {
            style: "currency",
            currency: "BDT",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }
    ).format(
        Number.isFinite(numericAmount)
            ? numericAmount
            : 0
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
        doctors,
        setDoctors,
    ] = useState([]);


    const [
        diagnosticBookings,
        setDiagnosticBookings,
    ] = useState([]);

    const [
        dashboardDiagnosticTotal,
        setDashboardDiagnosticTotal,
    ] = useState(null);


    const [
        reports,
        setReports,
    ] = useState([]);


    const [
        payments,
        setPayments,
    ] = useState([]);


    const [
        familyMembers,
        setFamilyMembers,
    ] = useState([]);


    const [
        notifications,
        setNotifications,
    ] = useState([]);

    const [ratings, setRatings] = useState([]);
    const [ratingAppointment, setRatingAppointment] = useState(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [ratingReview, setRatingReview] = useState("");
    const [ratingSaving, setRatingSaving] = useState(false);
    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    // ======================================================
    // Load Dashboard Data
    // ======================================================

    useEffect(() => {

        let mounted = true;


        const loadDashboardData =
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    const results =
                        await Promise.allSettled(
                            [

                                getMyAppointments(),

                                getDoctors(),

                                getMyTestBookings(),

                                getMedicalReports(),

                                getMyPayments(),

                                getFamilyMembers(),

                                getNotifications(),

                                getMyRatings(),

                                getDashboardData(),

                            ]
                        );


                    if (
                        !mounted
                    ) {

                        return;

                    }

                    // ==========================================
                    // Appointments
                    // ==========================================

                    if (
                        results[0].status ===
                        "fulfilled"
                    ) {

                        setAppointments(
                            normalizeAppointments(
                                results[0].value
                            )
                        );

                    }

                    else {

                        console.error(
                            "Appointments error:",
                            results[0].reason
                        );

                        setAppointments([]);

                    }


                    // ==========================================
                    // Doctors
                    // ==========================================

                    if (
                        results[1].status ===
                        "fulfilled"
                    ) {

                        setDoctors(
                            normalizeListResponse(
                                results[1].value
                            )
                        );

                    }

                    else {

                        console.error(
                            "Doctors error:",
                            results[1].reason
                        );

                        setDoctors([]);

                    }


                    // ==========================================
                    // Diagnostic Bookings
                    // ==========================================

                    if (
                        results[2].status ===
                        "fulfilled"
                    ) {

                        setDiagnosticBookings(
                            normalizeListResponse(
                                results[2].value
                            )
                        );

                    }

                    else {

                        console.error(
                            "Diagnostic bookings error:",
                            results[2].reason
                        );

                        setDiagnosticBookings([]);

                    }

                    if (
                        results[8].status ===
                        "fulfilled"
                    ) {
                        const dashboardData =
                            results[8].value?.data ||
                            results[8].value ||
                            {};

                        setDashboardDiagnosticTotal(
                            dashboardData.total_diagnostic_bookings ?? null
                        );
                    }


                    // ==========================================
                    // Medical Reports
                    // ==========================================

                    if (
                        results[3].status ===
                        "fulfilled"
                    ) {

                        setReports(
                            normalizeListResponse(
                                results[3].value
                            )
                        );

                    }

                    else {

                        console.error(
                            "Reports error:",
                            results[3].reason
                        );

                        setReports([]);

                    }


                    // ==========================================
                    // Payments
                    // ==========================================

                    if (
                        results[4].status ===
                        "fulfilled"
                    ) {

                        setPayments(
                            normalizeListResponse(
                                results[4].value
                            )
                        );

                    }

                    else {

                        console.error(
                            "Payments error:",
                            results[4].reason
                        );

                        setPayments([]);

                    }


                    // ==========================================
                    // Family Members
                    // ==========================================

                    if (
                        results[5].status ===
                        "fulfilled"
                    ) {

                        setFamilyMembers(
                            normalizeListResponse(
                                results[5].value
                            )
                        );

                    }

                    else {

                        console.error(
                            "Family members error:",
                            results[5].reason
                        );

                        setFamilyMembers([]);

                    }


                    // ==========================================
                    // Notifications
                    // ==========================================

                    if (
                        results[6].status ===
                        "fulfilled"
                    ) {

                        setNotifications(
                            normalizeListResponse(
                                results[6].value
                            )
                        );

                    }

                    else {

                        console.error(
                            "Notifications error:",
                            results[6].reason
                        );

                        setNotifications([]);

                    }

                    if (results[7].status === "fulfilled") {
                        setRatings(normalizeListResponse(results[7].value));
                    }

                }

                catch (
                    err
                ) {

                    console.error(
                        "Dashboard loading error:",
                        err
                    );


                    if (
                        mounted
                    ) {

                        setError(
                            "Unable to load dashboard data."
                        );

                    }

                }

                finally {

                    if (
                        mounted
                    ) {

                        setLoading(false);

                    }

                }

            };


        loadDashboardData();

        const refreshDashboardOnFocus = () => {
            loadDashboardData();
        };

        const refreshNotifications = () => {
            getNotifications()
                .then((response) => {
                    if (mounted) {
                        setNotifications(normalizeListResponse(response));
                    }
                })
                .catch((notificationError) => {
                    console.error("Notifications refresh error:", notificationError);
                });
        };

        window.addEventListener(
            "focus",
            refreshDashboardOnFocus
        );

        document.addEventListener(
            "visibilitychange",
            refreshDashboardOnFocus
        );

        window.addEventListener(
            "notifications-updated",
            refreshNotifications
        );


        return () => {

            mounted = false;

            window.removeEventListener(
                "focus",
                refreshDashboardOnFocus
            );

            document.removeEventListener(
                "visibilitychange",
                refreshDashboardOnFocus
            );

            window.removeEventListener(
                "notifications-updated",
                refreshNotifications
            );

        };

    }, []);

    const submitRating = async (event) => {
        event.preventDefault();

        if (!ratingAppointment) return;

        try {
            setRatingSaving(true);
            await createDoctorRating({
                appointment: ratingAppointment.id,
                rating: ratingValue,
                review: ratingReview.trim(),
            });
            setRatings((previous) => [...previous, {
                appointment: ratingAppointment.id,
                rating: ratingValue,
            }]);
            setRatingAppointment(null);
            setRatingReview("");
        } catch (ratingError) {
            setError(ratingError?.response?.data?.detail || "Unable to submit rating.");
        } finally {
            setRatingSaving(false);
        }
    };

    // ======================================================
    // Safe Appointments
    // ======================================================

    const safeAppointments =
        useMemo(() => {

            return Array.isArray(
                appointments
            )
                ? appointments.filter(
                    (appointment) => appointment?.status !== "Cancelled"
                )
                : [];

        }, [
            appointments,
        ]);


    // ======================================================
    // Appointment Statistics
    // ======================================================

    const appointmentStatistics =
        useMemo(() => {

            const result = {

                total:
                    safeAppointments.length,

                pending:
                    0,

                confirmed:
                    0,

                completed:
                    0,

            };


            safeAppointments.forEach(
                (
                    appointment
                ) => {

                    const status =
                        String(
                            appointment?.status ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    if (
                        status ===
                        "pending"
                    ) {

                        result.pending +=
                            1;

                    }


                    else if (
                        status ===
                        "confirmed"
                    ) {

                        result.confirmed +=
                            1;

                    }


                    else if (
                        status ===
                        "completed"
                    ) {

                        result.completed +=
                            1;

                    }

                }
            );


            return result;

        }, [
            safeAppointments,
        ]);


    // ======================================================
    // Dashboard Overview Statistics
    // ======================================================

    const overviewStatistics =
        useMemo(() => {

            const safePayments =
                Array.isArray(
                    payments
                )
                    ? payments
                    : [];


            const safeNotifications =
                Array.isArray(
                    notifications
                )
                    ? notifications
                    : [];


            // ==============================================
            // Unread Notifications
            // ==============================================

            const unreadNotifications =
                safeNotifications.filter(
                    (notification) => {
                        return !notification?.is_read;
                    }
                ).length;


            // ==============================================
            // Total Paid Amount
            //
            // Only payment_status = Paid
            // ==============================================

            const paymentAmount =
                safePayments.reduce(
                    (
                        total,
                        payment
                    ) => {

                        const paymentStatus =
                            String(
                                payment?.payment_status ||
                                payment?.status ||
                                ""
                            )
                                .trim()
                                .toLowerCase();


                        if (
                            !["paid", "partially paid", "refunded"].includes(paymentStatus)
                        ) {

                            return total;

                        }


                            const amount = Number(
                                payment?.net_amount ??
                                (Number(payment?.amount || 0) - Number(payment?.refund_amount || 0))
                            );


                        return (
                            total +
                            (
                                Number.isFinite(
                                    amount
                                )
                                    ? amount
                                    : 0
                            )
                        );

                    },
                    0
                );


            return {

                // Total Appointments
                appointments:
                    safeAppointments.length,


                // Pending Appointments
                pending:
                    appointmentStatistics.pending,


                // Confirmed Appointments
                confirmed:
                    appointmentStatistics.confirmed,


                // Completed Payment Records
                payments:
                    safePayments.filter(
                        (payment) => [
                            "paid",
                            "partially paid",
                            "refunded",
                        ].includes(
                            String(
                                payment?.payment_status ||
                                payment?.status ||
                                ""
                            ).trim().toLowerCase()
                        )
                    ).length,


                // Diagnostic Bookings
                diagnostics:
                    dashboardDiagnosticTotal ?? (Array.isArray(
                        diagnosticBookings
                    )
                        ? diagnosticBookings.filter(
                            (booking) => booking.status !== "Cancelled"
                        ).length
                        : 0),


                // Available Doctors
                doctors:
                    Array.isArray(
                        doctors
                    )
                        ? doctors.length
                        : 0,


                // Medical Reports
                reports:
                    Array.isArray(
                        reports
                    )
                        ? reports.length
                        : 0,


                // Total Paid Amount
                paymentAmount,


                // Family Members
                family:
                    Array.isArray(
                        familyMembers
                    )
                        ? familyMembers.length
                        : 0,


                // Unread Notifications
                notifications:
                    unreadNotifications,

            };

        }, [

            safeAppointments,

            appointmentStatistics,

            diagnosticBookings,

            dashboardDiagnosticTotal,

            doctors,

            reports,

            payments,

            familyMembers,

            notifications,

        ]);


    // ======================================================
    // Recent Appointments
    // ======================================================

    const recentAppointments =
        useMemo(() => {

            return safeAppointments
                .slice()
                .sort(
                    (
                        a,
                        b
                    ) => {

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


                        return (
                            dateB -
                            dateA
                        );

                    }
                )
                .slice(
                    0,
                    5
                );

        }, [
            safeAppointments,
        ]);


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


            <Navbar />


            <div className="dashboard-container">


                <Sidebar />


                <main className="patient-dashboard-content">


                    {/* ==========================================
                        Welcome Banner
                    ========================================== */}

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
                                diagnostic tests, medical reports,
                                payments and healthcare services
                                from one place.
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
                                    className="patient-symptom-btn patient-find-doctor-btn"
                                >

                                    <FaUserMd />

                                    Find Doctor

                                </Link>

                                <Link
                                    to="/symptom-checker"
                                    className="patient-symptom-btn patient-ai-symptom-btn"
                                >

                                    <FaStethoscope />

                                    AI Symptom Checker

                                </Link>

                                <Link
                                    to="/health-tips"
                                    className="patient-symptom-btn patient-health-tips-btn"
                                >

                                    <FaBookMedical />

                                    Health Tips

                                </Link>

                                <Link
                                    to="/patient/profile"
                                    className="patient-symptom-btn patient-profile-btn"
                                >

                                    <FaUser />

                                    My Profile

                                </Link>
                                {/*
                                <Link
                                    to="/Kawser"
                                    className="patient-symptom-btn patient-kawser-btn"
                                >

                                    <FaUser />

                                    Kawser

                                </Link>
                                */}

                            </div>

                        </div>


                        <div className="patient-welcome-icon">

                            <FaStethoscope />

                        </div>

                    </div>

                    {/* ==========================================
                        Your Overview
                    ========================================== */}

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


                    {/* ==========================================
                        10 Overview Cards
                    ========================================== */}

                    <div className="patient-stat-grid">


                        {/* 1. Total Appointments */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon blue">

                                <FaCalendarCheck />

                            </div>

                            <div>

                                <span>
                                    Total Appointments
                                </span>

                                <strong>
                                    {
                                        overviewStatistics.appointments
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* 2. Pending */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon orange">

                                <FaClock />

                            </div>

                            <div>

                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {
                                        overviewStatistics.pending
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* 3. Confirmed */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon blue">

                                <FaCheckCircle />

                            </div>

                            <div>

                                <span>
                                    Confirmed
                                </span>

                                <strong>
                                    {
                                        overviewStatistics.confirmed
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* 4. Payments */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon green">

                                <FaMoneyBillWave />

                            </div>

                            <div>

                                <span>
                                    Payments
                                </span>

                                <strong>
                                    {
                                        overviewStatistics.payments
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* 5. Diagnostic Bookings */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon purple">

                                <FaFlask />

                            </div>

                            <div>

                                <span>
                                    Diagnostic Bookings
                                </span>

                                <strong>
                                    {
                                        overviewStatistics.diagnostics
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* 6. Available Doctors */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon blue">

                                <FaUserMd />

                            </div>

                            <div>

                                <span>
                                    Available Doctors
                                </span>

                                <strong>
                                    {
                                        overviewStatistics.doctors
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* 7. Medical Reports */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon orange">

                                <FaFileMedical />

                            </div>

                            <div>

                                <span>
                                    Medical Reports
                                </span>

                                <strong>
                                    {
                                        overviewStatistics.reports
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* 8. Payments Amount */}

                        <div className="patient-stat-card patient-payment-amount-card">

                            <div className="patient-stat-icon green">

                                <FaMoneyBillWave />

                            </div>

                            <div>

                                <span>
                                    Payments Amount
                                </span>

                                <strong className="patient-payment-amount">

                                    {
                                        formatCurrency(
                                            overviewStatistics.paymentAmount
                                        )
                                    }

                                </strong>

                            </div>

                        </div>


                        {/* 9. Family Members */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon purple">

                                <FaUserFriends />

                            </div>

                            <div>

                                <span>
                                    Family Members
                                </span>

                                <strong>
                                    {
                                        overviewStatistics.family
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* 10. Notifications */}

                        <div className="patient-stat-card">

                            <div className="patient-stat-icon orange">

                                <FaBell />

                            </div>

                            <div>

                                <span>
                                    Notifications
                                </span>

                                <strong>
                                    {
                                        overviewStatistics.notifications
                                    }
                                </strong>

                            </div>

                        </div>


                    </div>

                    {/* ==========================================
                        Healthcare Services
                    ========================================== */}

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
                                    Book diagnostic tests
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>


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
                                    View your test bookings
                                </p>

                            </div>

                            <FaArrowRight
                                className="patient-service-arrow"
                            />

                        </Link>


                    </div>


                    {/* ==========================================
                        Bottom Content
                    ========================================== */}

                    <div className="patient-main-grid">


                        {/* Recent Appointments */}

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


                            {loading && (

                                <div className="patient-empty-state">

                                    <div className="patient-spinner" />

                                    <p>
                                        Loading dashboard...
                                    </p>

                                </div>

                            )}


                            {!loading &&
                                error && (

                                    <div className="patient-error">

                                        {error}

                                    </div>

                                )}


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

                                                        {isRateableAppointment(appointment) &&
                                                            !ratings.some((item) => String(item.appointment) === String(appointmentId)) && (
                                                                <button
                                                                    type="button"
                                                                    className="patient-rate-doctor-btn"
                                                                    onClick={() => setRatingAppointment(appointment)}
                                                                >
                                                                    <FaStar /> Rate doctor
                                                                </button>
                                                            )}

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                )}

                        </div>


                        {ratingAppointment && (
                            <div className="patient-rating-dialog">
                                <div className="patient-rating-dialog__card">
                                    <button
                                        type="button"
                                        className="patient-rating-dialog__close"
                                        onClick={() => setRatingAppointment(null)}
                                    >
                                        &times;
                                    </button>
                                    <p className="patient-rating-dialog__eyebrow">Completed appointment</p>
                                    <h3>Rate {ratingAppointment.doctor_name || "your doctor"}</h3>
                                    <div className="patient-rating-stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                className={star <= ratingValue ? "selected" : ""}
                                                onClick={() => setRatingValue(star)}
                                                aria-label={`${star} star${star === 1 ? "" : "s"}`}
                                            >
                                                <FaStar />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={ratingReview}
                                        onChange={(event) => setRatingReview(event.target.value)}
                                        placeholder="Share a short review (optional)"
                                        rows="3"
                                    />
                                    <button type="button" className="patient-rating-submit" onClick={submitRating} disabled={ratingSaving}>
                                        {ratingSaving ? "Submitting..." : "Submit rating"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Quick Access */}

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


                                <Link
                                    to="/tests"
                                    className="patient-quick-link"
                                >

                                    <span className="green">

                                        <FaFlask />

                                    </span>

                                    <div>

                                        <strong>
                                            Book Diagnostic Test
                                        </strong>

                                        <small>
                                            Schedule a laboratory test
                                        </small>

                                    </div>

                                    <FaArrowRight />

                                </Link>


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


                            </div>

                        </div>

                    </div>


                    {/* Footer */}

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