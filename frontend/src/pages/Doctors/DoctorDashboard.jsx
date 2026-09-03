import {
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
    getDoctorAppointments,
    confirmDoctorAppointment,
    rejectDoctorAppointment,
    completeDoctorAppointment,
} from "../../services/appointmentService";
import AuthContext from "../../context/AuthContext";
import "./DoctorDashboard.css";


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

    const navigate = useNavigate();

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


            const response =
                await getDoctorAppointments();


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


            setAppointments(
                appointmentData
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

        }

        finally {

            setLoading(false);

            setRefreshing(false);

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

                response =
                    await rejectDoctorAppointment(
                        id
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

        const today =
            getLocalToday();


        return {

            total:
                appointments.length,


            pending:

                appointments.filter(
                    (appointment) =>
                        appointment.status ===
                        "Pending"
                ).length,


            confirmed:

                appointments.filter(
                    (appointment) =>
                        appointment.status ===
                        "Confirmed"
                ).length,


            completed:

                appointments.filter(
                    (appointment) =>
                        appointment.status ===
                        "Completed"
                ).length,


            rejected:

                appointments.filter(
                    (appointment) =>
                        appointment.status ===
                        "Rejected"
                ).length,


            cancelled:

                appointments.filter(
                    (appointment) =>
                        appointment.status ===
                        "Cancelled"
                ).length,


            today:

                appointments.filter(
                    (appointment) =>
                        appointment.appointment_date ===
                        today
                ).length,

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


    const clinicTimeline = [
        { time: "08:30 AM", booked: 1, capacity: 5, status: "available" },
        { time: "09:00 AM", booked: 3, capacity: 5, status: "busy" },
        { time: "09:30 AM", booked: 5, capacity: 5, status: "full" },
        { time: "10:00 AM", booked: 2, capacity: 5, status: "available" },
        { time: "10:30 AM", booked: 4, capacity: 5, status: "busy" },
    ];


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

                return "d-none";


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
                            className="btn btn-outline-primary doctor-dashboard__refresh"
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
                            className="btn btn-primary doctor-dashboard__primary"
                            onClick={() => window.location.href = "/doctor/profile"}
                        >
                            <i className="fas fa-user-md me-2" />
                            My Profile
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-danger"
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
                        <div className="doctor-dashboard__panel card border-0 h-100">
                            <div className="card-header bg-transparent border-0 py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-0">Patient appointments</h5>
                                    </div>
                                    <span className="badge bg-primary rounded-pill">{filteredAppointments.length}</span>
                                </div>
                            </div>

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
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="doctor-dashboard__panel card border-0 h-100">
                            <div className="card-header bg-transparent border-0 py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Today's clinic rhythm</h5>
                                </div>
                            </div>
                            <div className="card-body pt-0">
                                <div className="doctor-dashboard__timeline">
                                    {clinicTimeline.map((slot) => (
                                        <div key={slot.time} className={`doctor-dashboard__slot doctor-dashboard__slot--${slot.status}`}>
                                            <div className="doctor-dashboard__slotTime">{slot.time}</div>
                                            <div className="doctor-dashboard__slotMeta">Booked: {slot.booked} / {slot.capacity}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

        </div>

    );

}