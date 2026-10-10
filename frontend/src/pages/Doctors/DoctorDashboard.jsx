import {
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { DoctorLayout } from "../../layouts/DoctorLayout";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";

import {
    getDoctorAppointments,
    getDoctorRatings,
    getDoctorAIReports,
    updateDoctorAIReport,
    confirmDoctorAppointment,
    rejectDoctorAppointment,
    completeDoctorAppointment,
} from "../../services/appointmentService";
import {
    getDoctorPayments,
    getRefundRequests,
    refundDoctorPayment,
    updateRefundRequest,
} from "../../services/paymentService";
import { getNotifications } from "../../services/notificationService";
import { clearFeedbackMessages, getFeedbackMessages, sendFeedbackMessage } from "../../services/reportService";
import AuthContext from "../../context/AuthContext";
import "./DoctorDashboard.css";

const getAppointmentTimestamp = (appointment) => {

    return new Date(
        `${appointment.appointment_date}T${appointment.slot_time || "00:00:00"}`
    ).getTime();

};

const getAppointmentStatus = (appointment) => (
    String(appointment?.status || "").trim().toLowerCase()
);

const isActionableAppointment = (appointment) => (
    ["pending", "confirmed"].includes(getAppointmentStatus(appointment))
);

const getAppointmentSubjectKey = (appointment) => {
    const patientId = appointment?.patient || appointment?.patient_profile?.id || appointment?.patient_name;
    const familyMemberId = appointment?.family_member || appointment?.family_member_details?.id || appointment?.family_member_name;
    return familyMemberId ? `${patientId}-family-${familyMemberId}` : String(patientId || "unknown");
};


// ==========================================================
// Doctor Dashboard
// ==========================================================

export default function DoctorDashboard() {

    // ==========================================================
    // Context & Hooks
    // ==========================================================

    const { logout } = useContext(AuthContext);

    // ==========================================================
    // State
    // ==========================================================

    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [actionLoading, setActionLoading] = useState(null);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");
    const [ratings, setRatings] = useState([]);
    const [aiReports, setAiReports] = useState([]);
    const [selectedAIReport, setSelectedAIReport] = useState(null);
    const [showAIReports, setShowAIReports] = useState(false);
    const [showScheduleManager, setShowScheduleManager] = useState(false);
    const [showAppointments, setShowAppointments] = useState(false);
    const [showClinicActivity, setShowClinicActivity] = useState(false);
    const [showRatings, setShowRatings] = useState(false);
    const [assessmentDraft, setAssessmentDraft] = useState("");
    const [aiReportsError, setAIReportsError] = useState("");
    const [assessmentSaving, setAssessmentSaving] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => new Date().getTime());
    const [doctorPayments, setDoctorPayments] = useState([]);
    const [refundRequests, setRefundRequests] = useState([]);
    const [showPayments, setShowPayments] = useState(false);
    const [paymentActionId, setPaymentActionId] = useState(null);
    const [feedbackMessages, setFeedbackMessages] = useState([]);
    const [feedbackAppointmentId, setFeedbackAppointmentId] = useState("");
    const [feedbackDraft, setFeedbackDraft] = useState("");
    const [feedbackSending, setFeedbackSending] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        const loadUnreadNotifications = async () => {
            try {
                const notifications = await getNotifications();
                if (active && Array.isArray(notifications)) {
                    setUnreadNotificationCount(
                        notifications.filter((notification) => !notification?.is_read).length
                    );
                }
            } catch {
                if (active) setUnreadNotificationCount(0);
            }
        };

        loadUnreadNotifications();
        window.addEventListener("focus", loadUnreadNotifications);
        window.addEventListener("notifications-updated", loadUnreadNotifications);

        return () => {
            active = false;
            window.removeEventListener("focus", loadUnreadNotifications);
            window.removeEventListener("notifications-updated", loadUnreadNotifications);
        };
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => setCurrentTime(new Date().getTime()), 60000);
        return () => window.clearInterval(interval);
    }, []);

    const saveAIReportAssessment = async (report) => {
        if (!report?.id || assessmentSaving) return;
        try {
            setAssessmentSaving(true);
            const response = await updateDoctorAIReport(report.id, assessmentDraft);
            setAiReports((current) => current.map((item) => item.id === report.id ? response.data : item));
            setSelectedAIReport(response.data);
            setSuccess("Doctor assessment saved.");
        } catch (error) {
            setError(error?.response?.data?.detail || "Unable to save assessment.");
        } finally {
            setAssessmentSaving(false);
        }
    };

    // ==========================================================
    // Load Doctor Appointments
    // ==========================================================

    const loadAppointments = async (
        showMainLoader = false
    ) => {

        try {

            if (showMainLoader) {

                setLoading(true);

            } else {

                setRefreshing(true);

            }

            setError("");


            const [responseResult, ratingResult, aiReportResult, paymentResult, feedbackResult, refundResult] = await Promise.allSettled([
                getDoctorAppointments(),
                getDoctorRatings(),
                getDoctorAIReports(),
                getDoctorPayments(),
                getFeedbackMessages(),
                getRefundRequests(),
            ]);

            const response = responseResult.status === "fulfilled" ? responseResult.value : null;
            const ratingResponse = ratingResult.status === "fulfilled" ? ratingResult.value : null;
            const aiReportResponse = aiReportResult.status === "fulfilled" ? aiReportResult.value : null;
            const paymentResponse = paymentResult.status === "fulfilled" ? paymentResult.value : null;
            const feedbackResponse = feedbackResult.status === "fulfilled" ? feedbackResult.value : null;
            const refundResponse = refundResult.status === "fulfilled" ? refundResult.value : null;

            if (responseResult.status === "rejected") {
                throw responseResult.reason;
            }

            console.log(
                "Doctor Appointments:",
                response.data
            );


            let appointmentData = [];


            // --------------------------------------------------
            // Normal Array Response
            // --------------------------------------------------

            if (
                Array.isArray(response?.data)
            ) {

                appointmentData =
                    response.data;

            }


            // --------------------------------------------------
            // Paginated Response
            // --------------------------------------------------

            else if (
                Array.isArray(
                    response?.data?.results
                )
            ) {

                appointmentData =
                    response.data.results;

            }

            else if (Array.isArray(response?.data?.data)) {
                appointmentData = response.data.data;
            } else if (Array.isArray(response?.data?.appointments)) {
                appointmentData = response.data.appointments;
            }


            setAppointments(
                appointmentData
            );

            setRatings(
                Array.isArray(ratingResponse?.data)
                    ? ratingResponse.data
                    : ratingResponse?.data?.results || []
            );
            setAiReports(Array.isArray(aiReportResponse?.data) ? aiReportResponse.data : aiReportResponse?.data?.results || []);
            setDoctorPayments(Array.isArray(paymentResponse?.data) ? paymentResponse.data : paymentResponse?.data?.results || []);
            setRefundRequests(Array.isArray(refundResponse?.data) ? refundResponse.data : refundResponse?.data?.results || []);
            setFeedbackMessages(Array.isArray(feedbackResponse?.data) ? feedbackResponse.data : feedbackResponse?.data?.results || []);
            setAIReportsError(
                aiReportResult.status === "rejected"
                    ? "Unable to load shared AI reports."
                    : ""
            );

        }

        catch (err) {

            console.error(
                "Load doctor appointments error:",
                err
            );


            setAppointments([]);


            setError(

                err?.response?.data?.detail ||

                err?.response?.data?.message ||

                "Unable to load doctor appointments."

            );
            setAIReportsError(err?.response?.data?.detail || "Unable to load shared AI reports.");

        }

        finally {

            setLoading(false);

            setRefreshing(false);

        }

    };

    const handleRefundRequestDecision = async (refundRequest, refundStatus) => {
        if (!window.confirm("Refund this payment and cancel the appointment?")) return;
        try {
            setPaymentActionId(refundRequest.id);
            await updateRefundRequest(refundRequest.id, refundStatus, refundStatus === "Rejected" ? "Refund request rejected by doctor." : "");
            if (refundStatus === "Approved") {
                await loadAppointments(false);
            } else {
                setRefundRequests((current) => current.map((item) => item.id === refundRequest.id ? { ...item, refund_status: refundStatus } : item));
            }
            setSuccess("Refund completed. Patient has been notified.");
        } catch (error) {
            setError(error?.response?.data?.detail || "Unable to process refund request.");
        } finally {
            setPaymentActionId(null);
        }
    };

    const handleDirectRefund = async (payment) => {
        if (!window.confirm("Refund this full payment and cancel the appointment?")) return;
        try {
            setPaymentActionId(payment.id);
            await refundDoctorPayment(payment.id, "Refunded by doctor from payment history.");
            setSuccess("Payment refunded and appointment cancelled.");
            await loadAppointments(false);
        } catch (error) {
            setError(error?.response?.data?.detail || "Unable to refund this payment.");
        } finally {
            setPaymentActionId(null);
        }
    };

    const handleSendFeedback = async (event) => {
        event.preventDefault();
        if (!feedbackAppointmentId || !feedbackDraft.trim()) return;
        try {
            setFeedbackSending(true);
            const response = await sendFeedbackMessage(feedbackAppointmentId, feedbackDraft.trim());
            setFeedbackMessages((current) => [...current, response.data]);
            setFeedbackDraft("");
            setSuccess("Feedback sent to the patient.");
        } catch (feedbackError) {
            setError(feedbackError?.response?.data?.detail || "Unable to send patient feedback.");
        } finally {
            setFeedbackSending(false);
        }
    };

    const handleClearFeedback = async () => {
        if (!feedbackMessages.length || !window.confirm("Clear all feedback messages for your patients?")) return;
        try {
            await clearFeedbackMessages();
            setFeedbackMessages([]);
            setSuccess("Feedback messages cleared.");
        } catch (feedbackError) {
            setError(feedbackError?.response?.data?.detail || "Unable to clear feedback messages.");
        }
    };


    // ==========================================================
    // Initial Load
    // ==========================================================

    useEffect(() => {

        loadAppointments(true);

    }, []);


    // ==========================================================
    // Refresh Dashboard
    // ==========================================================

    const handleRefresh = async () => {

        console.log("Refresh button clicked");

        setRefreshing(true);
        setError("");
        setSuccess("");

        await loadAppointments(false);

        setSuccess("Dashboard refreshed successfully.");

    };

    const openAppointmentDetails = async (appointment) => {

        if (!appointment?.id) return;

        navigate(`/doctor/appointments/${appointment.id}`);

    };



    // ==========================================================
    // Change Appointment Status
    // ==========================================================

    const handleStatusChange = async (
        id,
        newStatus
    ) => {

        let confirmationMessage = "";


        // --------------------------------------------------
        // Confirmation Message
        // --------------------------------------------------

        if (
            newStatus === "Confirmed"
        ) {

            confirmationMessage =
                "Are you sure you want to confirm this appointment?";

        }

        else if (
            newStatus === "Rejected"
        ) {

            confirmationMessage =
                "Are you sure you want to reject this appointment?";

        }

        else if (
            newStatus === "Completed"
        ) {

            confirmationMessage =
                "Are you sure you want to mark this appointment as completed?";

        }


        // --------------------------------------------------
        // User Confirmation
        // --------------------------------------------------

        const confirmed =
            window.confirm(
                confirmationMessage
            );


        if (!confirmed) {

            return;

        }


        try {

            setActionLoading(id);

            setError("");

            setSuccess("");


            let response;
            let actionText = "appointment";

            // --------------------------------------------------
            // Confirm
            // --------------------------------------------------

            if (
                newStatus === "Confirmed"
            ) {

                actionText = "confirmed";

                response =
                    await confirmDoctorAppointment(
                        id
                    );

            }


            // --------------------------------------------------
            // Reject
            // --------------------------------------------------

            else if (
                newStatus === "Rejected"
            ) {

                actionText = "rejected";

                const rejectionReason = window.prompt(
                    "Why are you rejecting this appointment?",
                    "The requested time is not available."
                );

                if (rejectionReason === null) {
                    return;
                }

                if (!rejectionReason.trim()) {
                    setError("A rejection reason is required.");
                    return;
                }

                response =
                    await rejectDoctorAppointment(
                        id,
                        rejectionReason.trim()
                    );

            }


            // --------------------------------------------------
            // Complete
            // --------------------------------------------------

            else if (
                newStatus === "Completed"
            ) {

                actionText = "completed";

                response =
                    await completeDoctorAppointment(
                        id
                    );

            }


            // --------------------------------------------------
            // Success Message
            // --------------------------------------------------

            setSuccess(

                response?.data?.message ||

                `Appointment ${actionText} successfully.`

            );


            // --------------------------------------------------
            // Reload Without Full Dashboard Spinner
            // --------------------------------------------------

            await loadAppointments(false);

        }

        catch (err) {

            console.error(
                "Appointment update error:",
                err
            );


            setError(

                err?.response?.data?.detail ||

                err?.response?.data?.message ||

                "Unable to update appointment."

            );

        }

        finally {

            setActionLoading(null);

        }

    };


    // ==========================================================
    // Get Local Date
    // ==========================================================

    const getLocalToday = () => {

        const date =
            new Date();


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${year}-${month}-${day}`;

    };


    // ==========================================================
    // Statistics
    // ==========================================================

    const statistics = useMemo(() => {
        const today = getLocalToday();
        const statusOf = (appointment) => String(appointment?.status || "").trim().toLowerCase();
        const isPaid = (appointment) => appointment?.is_paid === true || String(appointment?.payment_status || "").toLowerCase() === "paid";
        const effectiveStatus = (appointment) => isPaid(appointment) && statusOf(appointment) === "pending" ? "confirmed" : statusOf(appointment);


        return {
            total: appointments.length,
            pending: appointments.filter((appointment) => effectiveStatus(appointment) === "pending").length,
            confirmed: appointments.filter((appointment) => ["confirmed", "paid"].includes(effectiveStatus(appointment))).length,
            completed: appointments.filter((appointment) => effectiveStatus(appointment) === "completed").length,
            rejected: appointments.filter((appointment) => effectiveStatus(appointment) === "rejected").length,
            cancelled: appointments.filter((appointment) => effectiveStatus(appointment) === "cancelled").length,
            today: appointments.filter((appointment) => {
                return appointment?.appointment_date === today;
            }).length,

        };

    }, [appointments]);


    // ==========================================================
    // Filtered Appointments
    // ==========================================================

    const filteredAppointments =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();


            return appointments.filter(
                (appointment) => {


                    const patientName =
                        String(
                            appointment.patient_name ||
                            ""
                        ).toLowerCase();


                    const bookingNumber =
                        String(
                            appointment.booking_number ||
                            ""
                        ).toLowerCase();


                    const reason =
                        String(
                            appointment.reason ||
                            ""
                        ).toLowerCase();


                    // ------------------------------------------
                    // Search
                    // ------------------------------------------

                    const matchesSearch =

                        patientName.includes(
                            searchText
                        )

                        ||

                        bookingNumber.includes(
                            searchText
                        )

                        ||

                        reason.includes(
                            searchText
                        );


                    // ------------------------------------------
                    // Status Filter
                    // ------------------------------------------

                    const matchesStatus =

                        statusFilter === "All"

                        ||

                        appointment.status ===
                        statusFilter;


                    return (

                        matchesSearch &&

                        matchesStatus

                    );

                }
            );

        }, [

            appointments,

            search,

            statusFilter,

        ]);


    const summaryStats = [
        {
            label: "Total Appointments",
            value: statistics.total,
            icon: "fas fa-calendar-check",
            tone: "primary",
        },
        {
            label: "Pending",
            value: statistics.pending,
            icon: "fas fa-clock",
            tone: "warning",
        },
        {
            label: "Confirmed",
            value: statistics.confirmed,
            icon: "fas fa-user-check",
            tone: "info",
        },
        {
            label: "Completed",
            value: statistics.completed,
            icon: "fas fa-clipboard-check",
            tone: "success",
        },
        {
            label: "Rejected",
            value: statistics.rejected,
            icon: "fas fa-times-circle",
            tone: "danger",
        },
        {
            label: "Today's Appointments",
            value: statistics.today,
            icon: "fas fa-calendar-day",
            tone: "secondary",
        },
    ];


    const clinicTimeline = useMemo(() => {
        const now = currentTime;

        const sortByTime = (first, second) => (
            getAppointmentTimestamp(first) -
            getAppointmentTimestamp(second)
        );

        const actionableAppointments = appointments
            .filter((appointment) => isActionableAppointment(appointment))
            .sort(sortByTime);

        const today = getLocalToday();
        const todayAppointments = appointments.filter((appointment) => appointment.appointment_date === today);
        const upcomingAppointments = actionableAppointments.filter((appointment) => getAppointmentTimestamp(appointment) >= now);

        if (todayAppointments.length > 0) {
            return {
                mode: "today",
                items: todayAppointments,
                caption: "Today’s booked visits, including family members",
            };
        }

        if (upcomingAppointments.length > 0) {
            return {
                mode: "upcoming",
            items: upcomingAppointments.slice(0, 6),
                caption: "Next visitors to prepare for",
            };
        }

        const recentAppointments = [...appointments]
            .filter((appointment) => !["cancelled", "rejected"].includes(getAppointmentStatus(appointment)))
            .sort((first, second) => getAppointmentTimestamp(second) - getAppointmentTimestamp(first));

        return {
            mode: "recent",
            items: recentAppointments.slice(0, 6),
            caption: "Latest clinic visits",
        };

    }, [appointments, currentTime]);


    // ==========================================================
    // Status Badge
    // ==========================================================

    const getStatusBadgeClass = (
        status
    ) => {

        switch (

            String(status || "")
                .trim()
                .toLowerCase()

        ) {

            case "pending":

                return "bg-warning text-dark";


            case "confirmed":

                return "bg-primary";


            case "completed":

                return "bg-success";


            case "rejected":

                return "bg-danger";


            case "cancelled":

                return "bg-secondary";


            default:

                return "bg-dark";

        }

    };


    // ==========================================================
    // Format Date
    // ==========================================================

    const formatDate = (
        dateString
    ) => {

        if (!dateString) {

            return "-";

        }


        const date =
            new Date(
                `${dateString}T00:00:00`
            );


        return date.toLocaleDateString(
            "en-US",
            {

                day:
                    "numeric",

                month:
                    "short",

                year:
                    "numeric",

            }
        );

    };


    // ==========================================================
    // Format Time
    // ==========================================================

    const formatTime = (
        timeString
    ) => {

        if (!timeString) {

            return "-";

        }


        const [
            hour,
            minute,
        ] =
            timeString.split(":");


        const date =
            new Date();


        date.setHours(
            Number(hour)
        );


        date.setMinutes(
            Number(minute)
        );


        return date.toLocaleTimeString(
            "en-US",
            {

                hour:
                    "numeric",

                minute:
                    "2-digit",

                hour12:
                    true,

            }
        );

    };


    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (

            <div className="container-fluid py-5">

                <div className="text-center py-5">


                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >

                        <span className="visually-hidden">

                            Loading...

                        </span>

                    </div>


                    <h5 className="mt-3">

                        Loading Doctor Dashboard

                    </h5>


                    <p className="text-muted">

                        Please wait...

                    </p>

                </div>

            </div>

        );

    }


    // ==========================================================
    // Dashboard
    // ==========================================================

    return (

        <DoctorLayout>
        <div className="doctor-dashboard">

            <div className="doctor-dashboard__shell">

                <header className="doctor-dashboard__header">

                    <div>

                        <p className="doctor-dashboard__eyebrow">Clinic overview</p>

                        <h2>
                            <i className="fas fa-user-md me-2" />
                            Doctor Dashboard
                        </h2>

                        <p className="doctor-dashboard__subtitle">
                            Manage appointments, patient flow, and clinic operations in one place.
                        </p>

                    </div>

                    <div className="doctor-dashboard__actions">

                        <button
                            type="button"
                            className="doctor-dashboard__notification-button"
                            aria-label="Open notifications"
                            onClick={() => navigate("/doctor/notifications")}
                        >
                            <FaBell />
                            {unreadNotificationCount > 0 && (
                                <span aria-label={`${unreadNotificationCount} unread notifications`}>
                                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn doctor-dashboard__action-btn doctor-dashboard__refresh-btn"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >

                            {refreshing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sync-alt me-2" />
                                    Refresh
                                </>
                            )}

                        </button>

                        <button
                            type="button"
                            className="btn doctor-dashboard__action-btn doctor-dashboard__health-tips-btn"
                            onClick={() => navigate("/health-tips")}
                        >
                            <i className="fas fa-book-medical me-2" />
                            Health Tips
                        </button>

                        <button
                            type="button"
                            className="btn doctor-dashboard__action-btn doctor-dashboard__profile-btn"
                            onClick={() => navigate("/doctor/profile")}
                        >
                            <i className="fas fa-user me-2" />
                            My Profile
                        </button>

                        <button
                            type="button"
                            className="btn doctor-dashboard__action-btn doctor-dashboard__ai-reports-btn"
                            onClick={() => {
                                setShowAIReports(true);
                                document.getElementById("doctor-ai-reports")?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                        >
                            <i className="fas fa-file-medical me-2" />
                            AI Reports
                        </button>

                        <button
                            type="button"
                            className="btn doctor-dashboard__action-btn doctor-dashboard__logout-btn"
                            onClick={logout}
                        >
                            <i className="fas fa-sign-out-alt me-2" />
                            Logout
                        </button>

                    </div>

                </header>

                {error && (
                    <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
                        <strong>Error:</strong> {error}
                        <button type="button" className="btn-close" onClick={() => setError("")} />
                    </div>
                )}

                {success && (
                    <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
                        <strong>Success!</strong> {success}
                        <button type="button" className="btn-close" onClick={() => setSuccess("")} />
                    </div>
                )}

                <div className="doctor-dashboard__stats row g-3 mb-4">
                    {summaryStats.map((stat) => (
                        <div key={`${stat.label}-${stat.value}`} className="col-xl-2 col-lg-3 col-md-6">
                            <div className={`doctor-dashboard__stat card border-0 h-100 ${stat.tone}`}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            {stat.label ? <p>{stat.label}</p> : null}
                                            <h3>{stat.value}</h3>
                                        </div>
                                        <div className="doctor-dashboard__icon">
                                            <i className={stat.icon} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-lg-7">
                        <details id="doctor-appointments" className="doctor-dashboard__appointments-panel doctor-dashboard__panel card border-0 h-100" open={showAppointments} onToggle={(event) => { setShowAppointments(event.currentTarget.open); }}>
                            <summary className="doctor-dashboard__appointments-toggle card-header bg-transparent border-0 py-3 w-100 text-start">
                                
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-0">Patient appointments</h5>
                                        <small className="text-primary">Click to view appointments</small>
                                    </div>
                                    <span className="d-flex align-items-center gap-2"><span className="badge bg-primary rounded-pill">{filteredAppointments.length}</span><i className="fas fa-chevron-down" /></span>
                                </div>
                            </summary>

                            <div className="card-body pt-0">
                                <div className="row g-3 mb-3">
                                    <div className="col-md-7">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by patient, booking number or reason..."
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-5">
                                        <select
                                            className="form-select"
                                            value={statusFilter}
                                            onChange={(event) => setStatusFilter(event.target.value)}
                                        >
                                            <option value="All">All Status</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {filteredAppointments.length === 0 ? (
                                    <div className="doctor-dashboard__empty text-center py-5">
                                        <i className="fas fa-calendar-times fa-3x mb-3" />
                                        <h5>No appointments found</h5>
                                        <p className="mb-0">There are no appointments matching your search.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Booking</th>
                                                    <th>Patient</th>
                                                    <th>Date</th>
                                                    <th>Time</th>
                                                    <th>Status</th>
                                                    <th className="text-end">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredAppointments.map((appointment) => {
                                                    const isProcessing = actionLoading === appointment.id;
                                                    const status = String(appointment.status || "").trim();
                                                    return (
                                                        <tr
                                                            key={appointment.id}
                                                            onClick={() => openAppointmentDetails(appointment)}
                                                            className="doctor-dashboard__row"
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            <td><strong>{appointment.booking_number || `#${appointment.id}`}</strong></td>
                                                            <td>
                                                                <div className="fw-semibold">{appointment.patient_name || "Patient"}</div>
                                                                {appointment.family_member_name && (
                                                                    <small className="text-muted">For: {appointment.family_member_name}</small>
                                                                )}
                                                                {appointment.ai_report_shared && (
                                                                    <small className="doctor-dashboard__ai-badge">
                                                                        <i className="fas fa-heartbeat me-1" />AI report shared
                                                                    </small>
                                                                )}
                                                            </td>
                                                            <td>{formatDate(appointment.appointment_date)}</td>
                                                            <td>{formatTime(appointment.slot_time)}</td>
                                                            <td>
                                                                {status === "Pending" ? (
                                                                    <span className="text-muted">—</span>
                                                                ) : (
                                                                    <span className={`badge ${getStatusBadgeClass(status)}`}>
                                                                        {status || "Unknown"}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="text-end" onClick={(event) => event.stopPropagation()}>
                                                                <div className="doctor-dashboard__action-group">
                                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => openAppointmentDetails(appointment)}>
                                                                        View
                                                                    </button>
                                                                    {status === "Pending" && (
                                                                        <div className="doctor-dashboard__status-stack">
                                                                            <button className="btn btn-sm btn-success" disabled={isProcessing} onClick={() => handleStatusChange(appointment.id, "Confirmed")}>
                                                                                {isProcessing ? <span className="spinner-border spinner-border-sm" /> : <><i className="fas fa-check me-1" />Confirm</>}
                                                                            </button>
                                                                            <button className="btn btn-sm btn-outline-danger" disabled={isProcessing} onClick={() => handleStatusChange(appointment.id, "Rejected")}>
                                                                                {isProcessing ? <span className="spinner-border spinner-border-sm" /> : <><i className="fas fa-times me-1" />Reject</>}
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {status === "Confirmed" && (
                                                                        <button className="btn btn-sm btn-primary" disabled={isProcessing} onClick={() => handleStatusChange(appointment.id, "Completed")}>
                                                                            {isProcessing ? <span className="spinner-border spinner-border-sm" /> : <><i className="fas fa-check-double me-1" />Complete</>}
                                                                        </button>
                                                                    )}
                                                                    {status === "Completed" && <span className="text-success fw-semibold"><i className="fas fa-check-circle me-1" />Completed</span>}
                                                                    {status === "Rejected" && <span className="text-danger"><i className="fas fa-times-circle me-1" />Rejected</span>}
                                                                    {status === "Cancelled" && <span className="text-muted"><i className="fas fa-ban me-1" />Cancelled</span>}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </details>
                    </div>

                    <div className="col-lg-5">
                        <div className="doctor-dashboard__clinic-panel doctor-dashboard__panel card border-0 h-100">
                            <button
                                type="button"
                                className="card-header bg-transparent border-0 py-3 w-100 text-start"
                                onClick={() => { setShowClinicActivity((visible) => !visible); }}
                                aria-expanded={showClinicActivity}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="doctor-dashboard__panel-kicker"><i className="fas fa-wave-square me-1" /> Clinic pulse</p>
                                        <h5 className="mb-0">Recent clinic activity</h5>
                                        <small className="doctor-dashboard__timeline-caption">
                                            {clinicTimeline.caption}
                                        </small>
                                    </div>
                                    <span className="d-flex align-items-center gap-2"><span className={`doctor-dashboard__timeline-mode ${clinicTimeline.mode}`}>
                                        {clinicTimeline.items.length} {clinicTimeline.items.length === 1 ? "visitor" : "visitors"}
                                    </span><i className={`fas fa-chevron-${showClinicActivity ? "up" : "down"}`} /></span>
                                </div>
                            </button>
                            {showClinicActivity && <div className="card-body pt-0">
                                {clinicTimeline.items.length === 0 ? (
                                    <div className="doctor-dashboard__timeline-empty">
                                        <i className="fas fa-calendar-check" />
                                        <strong>No clinic activity yet</strong>
                                        <span>Appointments will appear here when patients book.</span>
                                    </div>
                                ) : (
                                    <div className="doctor-dashboard__timeline">
                                        {clinicTimeline.items.map((appointment) => (
                                            <div key={appointment.id} className={`doctor-dashboard__slot doctor-dashboard__slot--${String(appointment.status || "pending").toLowerCase()}`} onClick={() => openAppointmentDetails(appointment)}>
                                                <div className="doctor-dashboard__slotTime">
                                                    <strong>{formatTime(appointment.slot_time)}</strong>
                                                    <small>{formatDate(appointment.appointment_date)}</small>
                                                </div>
                                                <div className="doctor-dashboard__slotAvatar">{(appointment.patient_name || "P").charAt(0).toUpperCase()}</div>
                                                <div className="doctor-dashboard__slotPatient">
                                                    <strong>{appointment.family_member_name || appointment.patient_name || "Patient"}</strong>
                                                    {appointment.family_member_name && <small>Family member of {appointment.patient_name}</small>}
                                                    <span>{appointment.reason || "General consultation"}{appointment.ai_report_shared ? " · AI report shared" : ""}</span>
                                                </div>
                                                <span className="doctor-dashboard__slotStatus">
                                                    {appointment.status || "Pending"}
                                                </span>
                                            </div>
                                        ))}
                                        </div>
                                )}
                            </div>}
                        </div>
                    </div>
                </div>

                <div className="doctor-dashboard__dashboard-row doctor-dashboard__dashboard-row--equal">
                <section className="doctor-dashboard__ratings-panel">
                    <button
                        type="button"
                        className="doctor-dashboard__ratings-heading"
                        onClick={() => setShowRatings((visible) => !visible)}
                        aria-expanded={showRatings}
                    >
                        <div>
                            <p className="doctor-dashboard__eyebrow">Patient feedback</p>
                            <h3>Doctor Ratings</h3>
                            <span className="doctor-dashboard__ratings-action">
                                {showRatings ? "Hide ratings and comments" : "Click to view ratings and comments"}
                            </span>
                        </div>
                        <div className="doctor-dashboard__rating-score">
                            <strong>{ratings.length ? (ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / ratings.length).toFixed(1) : "0.0"}</strong>
                            <span>★★★★★ · {ratings.length} review{ratings.length === 1 ? "" : "s"}</span>
                        </div>
                    </button>
                    {showRatings && (
                        ratings.length === 0 ? (
                            <p className="doctor-dashboard__ratings-empty">Patient ratings and comments will appear here after submission.</p>
                        ) : (
                            <div className="doctor-dashboard__ratings-list">
                                {ratings.map((rating) => (
                                    <article key={rating.id}>
                                        <div><strong>{rating.patient_name || "Patient"}</strong><span>{"★".repeat(Number(rating.rating || 0))}{"☆".repeat(5 - Number(rating.rating || 0))}</span></div>
                                        <p>{rating.review || "No written review."}</p>
                                    </article>
                                ))}
                            </div>
                        )
                    )}
                </section>

                    <section id="doctor-ai-reports" className="doctor-dashboard__ai-reports-panel">
                        <button
                            type="button"
                            className="doctor-dashboard__ai-reports-toggle"
                            onClick={() => setShowAIReports((visible) => !visible)}
                            aria-expanded={showAIReports}
                        >
                            <div>
                                <p className="doctor-dashboard__eyebrow">Shared by patients</p>
                                <h3>AI Symptom Reports</h3>
                                <small>{showAIReports ? "Click to hide reports" : "Click to view shared reports"}</small>
                            </div>
                            <i className={`fas fa-chevron-${showAIReports ? "up" : "down"}`} />
                        </button>
                        {showAIReports && (aiReportsError ? (
                            <p className="doctor-dashboard__ai-reports-empty">{aiReportsError}</p>
                        ) : aiReports.length === 0 ? (
                            <p className="doctor-dashboard__ai-reports-empty">No patient AI reports yet. A patient must analyze symptoms and share the report with this doctor.</p>
                        ) : <div className="doctor-dashboard__ai-reports-list">
                            {aiReports.map((report) => (
                                <article
                                    key={report.id}
                                    className={`doctor-dashboard__ai-report-card ${selectedAIReport?.id === report.id ? "is-open" : ""}`}
                                >
                                    <button
                                        type="button"
                                        className="doctor-dashboard__ai-report-summary-trigger"
                                        aria-expanded={selectedAIReport?.id === report.id}
                                        onClick={() => {
                                            setSelectedAIReport((current) => current?.id === report.id ? null : report);
                                            setAssessmentDraft(report.doctor_assessment || "");
                                        }}
                                    >
                                        <div className="doctor-dashboard__ai-report-summary">
                                            <div>
                                                <strong>{report.patient_name || "Patient"}</strong>
                                                <span>{report.ai_urgency ? `${report.ai_urgency} urgency` : "AI report"}</span>
                                            </div>
                                            <i className={`fas fa-chevron-${selectedAIReport?.id === report.id ? "up" : "down"}`} aria-hidden="true" />
                                        </div>
                                        <p>{report.ai_category || "Symptom report"} · {report.symptoms || "Symptoms not provided"}</p>
                                        <small>{selectedAIReport?.id === report.id ? "Hide report details" : "View full report"}</small>
                                    </button>
                                    {selectedAIReport?.id === report.id && (
                                        <div className="doctor-dashboard__ai-report-details">
                                            <div><span>Symptoms</span><strong>{report.symptoms || "Not provided"}</strong></div>
                                            <div><span>Duration</span><strong>{report.duration || "Not provided"}</strong></div>
                                            <div><span>Severity</span><strong>{report.severity || "Not provided"}</strong></div>
                                            <div><span>AI category</span><strong>{report.ai_category || "Not provided"}</strong></div>
                                            <div><span>Possible conditions</span><strong>{report.possible_conditions || "Not provided"}</strong></div>
                                            <div><span>Recommended specialist</span><strong>{report.ai_specialist || "Not provided"}</strong></div>
                                            <div><span>AI guidance</span><strong>{report.ai_guidance || "Not provided"}</strong></div>
                                            <div className="doctor-dashboard__ai-history"><span>Patient history</span><strong>{aiReports.filter((item) => item.patient_name === report.patient_name).length} shared report(s) from this patient</strong></div>
                                            <label><span>Doctor assessment</span><textarea value={assessmentDraft} onClick={(event) => event.stopPropagation()} onChange={(event) => setAssessmentDraft(event.target.value)} placeholder="Add your observation and medical assessment..." rows="3" /></label>
                                            <div className="doctor-dashboard__ai-report-actions"><button type="button" disabled={assessmentSaving} onClick={(event) => { event.stopPropagation(); saveAIReportAssessment(report); }}>{assessmentSaving ? "Saving..." : "Save assessment"}</button><button type="button" disabled={!report.patient_id} onClick={(event) => { event.stopPropagation(); navigate(`/doctor/patients?patient=${report.patient_id}`); }}>Open consultation</button></div>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>)}
                    </section>
                </div>
                <div className="doctor-dashboard__dashboard-row doctor-dashboard__dashboard-row--equal">
                    <section className="doctor-dashboard__schedule-panel">
                        <button
                            type="button"
                            className="doctor-dashboard__schedule-toggle"
                            onClick={() => setShowScheduleManager((visible) => !visible)}
                            aria-expanded={showScheduleManager}
                        >
                            <div>
                                <p className="doctor-dashboard__eyebrow">Availability control</p>
                                <h3>Schedule Management</h3>
                                <small>{showScheduleManager ? "Click to hide schedule tools" : "Click to manage schedules and time slots"}</small>
                            </div>
                            <i className={`fas fa-chevron-${showScheduleManager ? "up" : "down"}`} />
                        </button>
                        {showScheduleManager && (
                            <div className="doctor-dashboard__schedule-content">
                                <div><i className="fas fa-calendar-alt" /><strong>Doctor schedules</strong><span>Add, edit, activate or deactivate working hours.</span></div>
                                <div><i className="fas fa-clock" /><strong>Time slots</strong><span>Edit slot capacity and enable or disable individual slots.</span></div>
                                <button type="button" className="doctor-dashboard__schedule-open" onClick={() => navigate("/doctor/schedule")}><i className="fas fa-sliders-h me-2" />Open schedule manager</button>
                            </div>
                        )}
                    </section>
                    <section className="doctor-dashboard__payments-panel">
                        <button type="button" className="doctor-dashboard__payments-toggle" onClick={() => setShowPayments((visible) => !visible)} aria-expanded={showPayments}>
                            <div><p className="doctor-dashboard__eyebrow">Financial overview</p><h3>Payments History</h3><small>{showPayments ? "Click to hide payment history" : "Click to view patient payments"}</small></div>
                            <div className="doctor-dashboard__payments-total"><strong>৳{doctorPayments.filter((payment) => ["Paid", "Refunded"].includes(payment.payment_status)).reduce((sum, payment) => sum + (payment.payment_status === "Refunded" ? Number(payment.refund_retained_amount || 0) : Number(payment.amount || 0)), 0).toFixed(2)}</strong><span>Net collected</span></div>
                        </button>
                        {showPayments && <div className="doctor-dashboard__payments-content">
                            <p className="doctor-dashboard__refund-policy"><i className="fas fa-shield-alt me-1" /> Refund policy: only eligible full payments can be refunded within 24 hours. Partial payments are never refundable. Approval refunds 80% and keeps the appointment pending until the patient cancels it.</p>
                            {refundRequests.filter((item) => item.refund_status === "Pending").map((refundRequest) => <article key={refundRequest.id} className="doctor-dashboard__refund-request"><div><strong>{refundRequest.patient_name || "Patient"}</strong><span>Booking: {refundRequest.booking_number || "Appointment"}</span><span>Date: {refundRequest.appointment_date || "-"}</span><span>Doctor: {refundRequest.doctor_name || "You"} · Requested ৳{refundRequest.refund_amount}</span><small>{refundRequest.reason}</small><small>Requested: {refundRequest.requested_at ? new Date(refundRequest.requested_at).toLocaleString() : "Just now"}</small></div><div><button type="button" disabled={paymentActionId === refundRequest.id} onClick={() => handleRefundRequestDecision(refundRequest, "Approved")}>Refund</button></div></article>)}
                            {doctorPayments.length === 0 ? <p className="doctor-dashboard__ai-reports-empty">No patient payment history yet.</p> : <div className="doctor-dashboard__payments-list">{doctorPayments.map((payment) => <article key={payment.id}><div><strong>{payment.patient_name || "Patient"}</strong><span>Booking: {payment.appointment_booking || "Appointment"}</span><span>Date: {payment.appointment_date || "-"}</span><span>{payment.doctor_name || "Appointment"} · {payment.payment_mode || "Payment"}</span></div><div><strong>৳{Number(payment.net_amount ?? (Number(payment.amount || 0) - Number(payment.refund_amount || 0))).toFixed(2)}</strong><span className={`doctor-dashboard__payment-status ${String(payment.payment_status || "").toLowerCase()}`}>{payment.payment_status}</span>{payment.payment_status === "Refunded" && <small className="doctor-dashboard__refund-breakdown">Original ৳{payment.amount || 0} · Refunded ৳{payment.refund_amount || 0} · Retained ৳{payment.refund_retained_amount || 0}</small>}{payment.payment_status === "Paid" && (payment.refund_request_status === "Pending" ? <button type="button" className="doctor-dashboard__refund-request-label" disabled={paymentActionId === payment.id} onClick={() => { const request = refundRequests.find((item) => item.payment === payment.id); if (request) handleRefundRequestDecision(request, "Approved"); }}>Request Refund</button> : payment.can_request_refund ? <button type="button" className="doctor-dashboard__refund-button" disabled={paymentActionId === payment.id} onClick={() => handleDirectRefund(payment)}>Refund</button> : null)}</div></article>)}</div>}
                        </div>}
                    </section>
                </div>
                    <section className="doctor-dashboard__care-panel">
                        <div className="doctor-dashboard__care-header">
                            <div><p className="doctor-dashboard__eyebrow">Patient care workspace</p><h3>Medical reports & feedback</h3><small>Review history, prescribe tests or medicines, and keep the patient conversation in one place.</small></div>
                            <div className="doctor-dashboard__care-actions"><button type="button" onClick={() => navigate("/doctor/patients")}><i className="fas fa-users" /> Patients</button><button type="button" onClick={() => navigate("/doctor/prescriptions")}><i className="fas fa-file-prescription" /> Reports & prescriptions</button></div>
                        </div>
                        <div className="doctor-dashboard__care-grid">
                            <div className="doctor-dashboard__care-card"><span className="doctor-dashboard__care-icon"><i className="fas fa-notes-medical" /></span><div><strong>{appointments.length}</strong><small>Appointment records</small><small>{new Set(appointments.map(getAppointmentSubjectKey)).size} unique patients</small></div><button type="button" onClick={() => navigate("/doctor/patients")}>Open patient history <i className="fas fa-arrow-right" /></button></div>
                            <div className="doctor-dashboard__care-card"><span className="doctor-dashboard__care-icon"><i className="fas fa-comments" /></span><div><strong>{feedbackMessages.filter((message) => message.sender === "Patient").length}</strong><small>Patient replies in feedback</small></div><button type="button" onClick={() => document.getElementById("doctor-feedback-composer")?.scrollIntoView({ behavior: "smooth" })}>Open feedback <i className="fas fa-arrow-right" /></button></div>
                        </div>
                        <form id="doctor-feedback-composer" className="doctor-dashboard__feedback-composer" onSubmit={handleSendFeedback}><div><label htmlFor="feedback-appointment">Appointment / patient</label><select id="feedback-appointment" value={feedbackAppointmentId} onChange={(event) => setFeedbackAppointmentId(event.target.value)} required><option value="">Select an appointment</option>{appointments.map((appointment) => <option key={appointment.id} value={appointment.id}>{appointment.patient_name || "Patient"} · {appointment.booking_number}</option>)}</select></div><label htmlFor="feedback-message">Message for patient<textarea id="feedback-message" value={feedbackDraft} onChange={(event) => setFeedbackDraft(event.target.value)} placeholder="Share follow-up guidance, test preparation, or a question..." rows="3" required /></label><button type="submit" disabled={feedbackSending}>{feedbackSending ? "Sending..." : "Send feedback"} <i className="fas fa-paper-plane" /></button></form>
                        <div className="doctor-dashboard__feedback-heading"><strong>Conversation history</strong><button type="button" onClick={handleClearFeedback} disabled={!feedbackMessages.some((message) => message.sender === "Doctor")}><i className="fas fa-trash-alt" /> Clear my messages</button></div>
                        <div className="doctor-dashboard__feedback-preview">{feedbackMessages.length === 0 ? <span>No feedback conversation yet.</span> : feedbackMessages.slice(-6).reverse().map((message) => <article key={message.id} className={message.sender === "Doctor" ? "is-doctor" : "is-patient"}><div><strong>{message.patient_name}</strong><small>{message.sender === "Doctor" ? "You" : "Patient reply"} · {new Date(message.created_at).toLocaleString()}</small></div><p>{message.message}</p></article>)}</div>
                    </section>


            </div>

        </div>
        </DoctorLayout>

    );

}