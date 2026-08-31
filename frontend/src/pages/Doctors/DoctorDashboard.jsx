import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getDoctorAppointments,
    confirmDoctorAppointment,
    rejectDoctorAppointment,
    completeDoctorAppointment,
} from "../../services/appointmentService";


// ==========================================================
// Doctor Dashboard
// ==========================================================

export default function DoctorDashboard() {

    // ==========================================================
    // State
    // ==========================================================

    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(null);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");


    // ==========================================================
    // Load Doctor Appointments
    // ==========================================================

    const loadAppointments = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await getDoctorAppointments();

            console.log(
                "Doctor Appointments:",
                response.data
            );


            let appointmentData = [];


            if (Array.isArray(response?.data)) {

                appointmentData = response.data;

            }

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

        }

    };


    // ==========================================================
    // Load Appointments
    // ==========================================================

    useEffect(() => {

        loadAppointments();

    }, []);


    // ==========================================================
    // Change Appointment Status
    // ==========================================================

    const handleStatusChange = async (
        id,
        newStatus
    ) => {

        try {

            setActionLoading(id);

            setError("");


            // --------------------------------------------------
            // Confirm Action
            // --------------------------------------------------

            let confirmationMessage = "";

            if (newStatus === "Confirmed") {

                confirmationMessage =
                    "Are you sure you want to confirm this appointment?";

            }

            else if (newStatus === "Rejected") {

                confirmationMessage =
                    "Are you sure you want to reject this appointment?";

            }

            else if (newStatus === "Completed") {

                confirmationMessage =
                    "Are you sure you want to mark this appointment as completed?";

            }


            const confirmed =
                window.confirm(
                    confirmationMessage
                );


            if (!confirmed) {

                return;

            }


            // --------------------------------------------------
            // Confirm
            // --------------------------------------------------

            if (
                newStatus === "Confirmed"
            ) {

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

                await completeDoctorAppointment(
                    id
                );

            }


            // --------------------------------------------------
            // Reload
            // --------------------------------------------------

            await loadAppointments();

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
    // Statistics
    // ==========================================================

    const statistics = useMemo(() => {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        return {

            total:
                appointments.length,


            pending:

                appointments.filter(
                    (appointment) =>
                        appointment.status === "Pending"
                ).length,


            confirmed:

                appointments.filter(
                    (appointment) =>
                        appointment.status === "Confirmed"
                ).length,


            completed:

                appointments.filter(
                    (appointment) =>
                        appointment.status === "Completed"
                ).length,


            rejected:

                appointments.filter(
                    (appointment) =>
                        appointment.status === "Rejected"
                ).length,


            cancelled:

                appointments.filter(
                    (appointment) =>
                        appointment.status === "Cancelled"
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


                    const searchText =
                        search.toLowerCase();


                    const matchesSearch =

                        patientName.includes(
                            searchText
                        )

                        ||

                        bookingNumber.includes(
                            searchText
                        );


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
            statusFilter
        ]);


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

                day: "numeric",

                month: "short",

                year: "numeric",

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
            minute
        ] =
            timeString.split(":");


        const date = new Date();

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
                        Loading Dashboard
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

        <div className="container-fluid py-4">


            {/* ==================================================
                Header
            ================================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

                <div>

                    <h2 className="fw-bold mb-1">

                        <i className="fas fa-user-md text-primary me-2" />

                        Doctor Dashboard

                    </h2>


                    <p className="text-muted mb-0">

                        Manage your appointments and patients

                    </p>

                </div>


                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadAppointments}
                >

                    <i className="fas fa-sync-alt me-2" />

                    Refresh

                </button>

            </div>


            {/* ==================================================
                Error
            ================================================== */}

            {error && (

                <div
                    className="alert alert-danger"
                    role="alert"
                >

                    <div className="d-flex justify-content-between">

                        <div>

                            <strong>
                                Error:
                            </strong>{" "}

                            {error}

                        </div>


                        <button
                            type="button"
                            className="btn-close"
                            onClick={() =>
                                setError("")
                            }
                        />

                    </div>

                </div>

            )}


            {/* ==================================================
                Statistics
            ================================================== */}

            <div className="row g-3 mb-4">


                {/* Total */}

                <div className="col-xl-3 col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <div>

                                    <p className="text-muted mb-1">
                                        Total Appointments
                                    </p>

                                    <h2 className="fw-bold mb-0">
                                        {statistics.total}
                                    </h2>

                                </div>


                                <div className="fs-2 text-primary">

                                    <i className="fas fa-calendar-alt" />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Pending */}

                <div className="col-xl-3 col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <div>

                                    <p className="text-muted mb-1">
                                        Pending
                                    </p>

                                    <h2 className="fw-bold mb-0">
                                        {statistics.pending}
                                    </h2>

                                </div>


                                <div className="fs-2 text-warning">

                                    <i className="fas fa-clock" />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Confirmed */}

                <div className="col-xl-3 col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <div>

                                    <p className="text-muted mb-1">
                                        Confirmed
                                    </p>

                                    <h2 className="fw-bold mb-0">
                                        {statistics.confirmed}
                                    </h2>

                                </div>


                                <div className="fs-2 text-info">

                                    <i className="fas fa-check-circle" />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Completed */}

                <div className="col-xl-3 col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <div>

                                    <p className="text-muted mb-1">
                                        Completed
                                    </p>

                                    <h2 className="fw-bold mb-0">
                                        {statistics.completed}
                                    </h2>

                                </div>


                                <div className="fs-2 text-success">

                                    <i className="fas fa-check-double" />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Secondary Statistics
            ================================================== */}

            <div className="row g-3 mb-4">


                <div className="col-md-4">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <span className="text-muted">
                                Today's Appointments
                            </span>

                            <h4 className="fw-bold mb-0 mt-2">

                                <i className="fas fa-calendar-day text-primary me-2" />

                                {statistics.today}

                            </h4>

                        </div>

                    </div>

                </div>


                <div className="col-md-4">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <span className="text-muted">
                                Rejected
                            </span>

                            <h4 className="fw-bold mb-0 mt-2">

                                <i className="fas fa-times-circle text-danger me-2" />

                                {statistics.rejected}

                            </h4>

                        </div>

                    </div>

                </div>


                <div className="col-md-4">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <span className="text-muted">
                                Cancelled
                            </span>

                            <h4 className="fw-bold mb-0 mt-2">

                                <i className="fas fa-ban text-secondary me-2" />

                                {statistics.cancelled}

                            </h4>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Appointment Section
            ================================================== */}

            <div className="card border-0 shadow-sm">


                {/* Header */}

                <div className="card-header bg-white py-3">

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">


                        <div>

                            <h5 className="fw-bold mb-1">

                                Patient Appointments

                            </h5>


                            <p className="text-muted mb-0 small">

                                Review and manage your patient appointments

                            </p>

                        </div>


                        <span className="badge bg-primary fs-6">

                            {filteredAppointments.length}

                        </span>

                    </div>

                </div>


                {/* Filters */}

                <div className="card-body border-bottom">

                    <div className="row g-3">


                        {/* Search */}

                        <div className="col-md-7">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by patient name or booking number..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* Status */}

                        <div className="col-md-5">

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All Status
                                </option>

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Confirmed">
                                    Confirmed
                                </option>

                                <option value="Completed">
                                    Completed
                                </option>

                                <option value="Rejected">
                                    Rejected
                                </option>

                                <option value="Cancelled">
                                    Cancelled
                                </option>

                            </select>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    Empty State
                ================================================== */}

                {filteredAppointments.length === 0 && (

                    <div className="text-center py-5">

                        <i className="fas fa-calendar-times fa-3x text-muted mb-3" />

                        <h5>
                            No appointments found
                        </h5>

                        <p className="text-muted mb-0">

                            There are no appointments matching your search.

                        </p>

                    </div>

                )}


                {/* ==================================================
                    Table
                ================================================== */}

                {filteredAppointments.length > 0 && (

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">


                            <thead className="table-light">

                                <tr>

                                    <th>
                                        Booking
                                    </th>

                                    <th>
                                        Patient
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Time
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {
                                    filteredAppointments.map(
                                        (appointment) => {

                                            const isProcessing =
                                                actionLoading ===
                                                appointment.id;


                                            const status =
                                                String(
                                                    appointment.status ||
                                                    ""
                                                ).trim();


                                            return (

                                                <tr
                                                    key={
                                                        appointment.id
                                                    }
                                                >


                                                    {/* Booking */}

                                                    <td>

                                                        <strong>

                                                            {
                                                                appointment.booking_number ||
                                                                `#${appointment.id}`
                                                            }

                                                        </strong>

                                                    </td>


                                                    {/* Patient */}

                                                    <td>

                                                        <div className="fw-semibold">

                                                            {
                                                                appointment.patient_name ||
                                                                "Patient"
                                                            }

                                                        </div>


                                                        {
                                                            appointment.family_member_name &&
                                                            (

                                                                <small className="text-muted">

                                                                    For: {
                                                                        appointment.family_member_name
                                                                    }

                                                                </small>

                                                            )
                                                        }

                                                    </td>


                                                    {/* Date */}

                                                    <td>

                                                        {
                                                            formatDate(
                                                                appointment.appointment_date
                                                            )
                                                        }

                                                    </td>


                                                    {/* Time */}

                                                    <td>

                                                        {
                                                            formatTime(
                                                                appointment.slot_time
                                                            )
                                                        }

                                                    </td>


                                                    {/* Reason */}

                                                    <td>

                                                        <span
                                                            title={
                                                                appointment.reason
                                                            }
                                                        >

                                                            {
                                                                appointment.reason
                                                                    ? appointment.reason.length > 35
                                                                        ? `${appointment.reason.substring(0, 35)}...`
                                                                        : appointment.reason
                                                                    : "-"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* Status */}

                                                    <td>

                                                        <span
                                                            className={
                                                                `badge ${getStatusBadgeClass(
                                                                    status
                                                                )}`
                                                            }
                                                        >

                                                            {
                                                                status ||
                                                                "Unknown"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* Actions */}

                                                    <td>


                                                        {/* Pending */}

                                                        {
                                                            status === "Pending"
                                                            && (

                                                                <div className="d-flex gap-2">


                                                                    <button
                                                                        className="btn btn-sm btn-success"
                                                                        disabled={
                                                                            isProcessing
                                                                        }
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                appointment.id,
                                                                                "Confirmed"
                                                                            )
                                                                        }
                                                                    >

                                                                        {
                                                                            isProcessing
                                                                                ? (
                                                                                    <span className="spinner-border spinner-border-sm" />
                                                                                )
                                                                                : (
                                                                                    <>
                                                                                        <i className="fas fa-check me-1" />

                                                                                        Confirm
                                                                                    </>
                                                                                )
                                                                        }

                                                                    </button>


                                                                    <button
                                                                        className="btn btn-sm btn-danger"
                                                                        disabled={
                                                                            isProcessing
                                                                        }
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                appointment.id,
                                                                                "Rejected"
                                                                            )
                                                                        }
                                                                    >

                                                                        <i className="fas fa-times me-1" />

                                                                        Reject

                                                                    </button>

                                                                </div>

                                                            )
                                                        }


                                                        {/* Confirmed */}

                                                        {
                                                            status === "Confirmed"
                                                            && (

                                                                <button
                                                                    className="btn btn-sm btn-primary"
                                                                    disabled={
                                                                        isProcessing
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            appointment.id,
                                                                            "Completed"
                                                                        )
                                                                    }
                                                                >

                                                                    {
                                                                        isProcessing
                                                                            ? (
                                                                                <span className="spinner-border spinner-border-sm" />
                                                                            )
                                                                            : (
                                                                                <>
                                                                                    <i className="fas fa-check-double me-1" />

                                                                                    Complete
                                                                                </>
                                                                            )
                                                                        }

                                                                </button>

                                                            )
                                                        }


                                                        {/* Completed */}

                                                        {
                                                            status === "Completed"
                                                            && (

                                                                <span className="text-success fw-semibold">

                                                                    <i className="fas fa-check-circle me-1" />

                                                                    Completed

                                                                </span>

                                                            )
                                                        }


                                                        {/* Rejected */}

                                                        {
                                                            status === "Rejected"
                                                            && (

                                                                <span className="text-danger">

                                                                    <i className="fas fa-times-circle me-1" />

                                                                    Rejected

                                                                </span>

                                                            )
                                                        }


                                                        {/* Cancelled */}

                                                        {
                                                            status === "Cancelled"
                                                            && (

                                                                <span className="text-muted">

                                                                    <i className="fas fa-ban me-1" />

                                                                    Cancelled

                                                                </span>

                                                            )
                                                        }


                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )

                                }

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

}