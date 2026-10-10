import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getMyAppointments,
    cancelAppointment,
} from "../../services/appointmentService";
import { createRefundRequest, getMyPayments } from "../../services/paymentService";

import "../../styles/appointment.css";

const normalizeAppointments = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.results)) return responseData.results;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.data?.results)) return responseData.data.results;
    return [];
};

const getMonthKey = (appointment) => (
    String(appointment?.appointment_date || "").slice(0, 7)
);

const formatMonth = (monthKey) => {
    if (!/^\d{4}-\d{2}$/.test(monthKey)) return "Unknown month";
    return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
};

const getCurrentMonthKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

function MyAppointments() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [requestingRefundId, setRequestingRefundId] = useState(null);

    // Search & Filter
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    const appointmentsPerPage = 5;

    // ==========================================
    // Load Appointments
    // ==========================================

    useEffect(() => {
        const fetchAppointments = async () => {

            try {

                const [response, paymentResponse] = await Promise.all([
                    getMyAppointments(),
                    getMyPayments(),
                ]);

                console.log("Appointments Response:", response.data);

                setAppointments(normalizeAppointments(response.data));
                const paymentData = paymentResponse.data?.results || paymentResponse.data?.data || paymentResponse.data || [];
                setPayments(Array.isArray(paymentData) ? paymentData : []);

            } catch (error) {

                console.error(error);

                alert("Failed to load appointments.");

            } finally {

                setLoading(false);

            }

        };

        fetchAppointments();

    }, []);

    // ==========================================
    // Reset Page When Search/Filter Changes
    // ==========================================

    useEffect(() => {

        setCurrentPage(1);

    }, [search, statusFilter]);

    // ==========================================
    // Cancel Appointment
    // ==========================================

    const handleCancel = async (id) => {

        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (!confirmCancel) return;

        try {

            await cancelAppointment(id);

            setAppointments((previousAppointments) =>
                previousAppointments.map((appointment) =>
                    appointment.id === id
                        ? { ...appointment, status: "Cancelled" }
                        : appointment
                )
            );

            alert("Appointment cancelled successfully.");

        } catch (error) {

            console.error(error);

            alert("Cancellation failed.");

        }

    };

    const handleRefundRequest = async (appointment) => {
        const payment = payments.find((item) => item.appointment === appointment.id && item.can_request_refund);
        if (!payment) return;
        const reason = window.prompt("Why are you requesting a refund?", "I need to cancel this appointment.");
        if (!reason?.trim()) return;
        try {
            setRequestingRefundId(appointment.id);
            await createRefundRequest(payment.id, reason.trim());
            setAppointments((current) => current.map((item) => item.id === appointment.id
                ? { ...item, refund_request_status: "Pending", can_request_refund: false }
                : item));
            setPayments((current) => current.map((item) => item.id === payment.id
                ? { ...item, refund_request_status: "Pending", can_request_refund: false }
                : item));
            alert("Refund request sent to the doctor and admin.");
        } catch (requestError) {
            const responseData = requestError.response?.data;
            const serverMessage = responseData?.detail || responseData?.message || Object.values(responseData || {}).flat().join(" ");
            alert(serverMessage || "Unable to send refund request.");
        } finally {
            setRequestingRefundId(null);
        }
    };

    const visibleAppointments = appointments.filter(
        (appointment) => !appointment.refund_approved
    );

    const statusSummary = [
        "Pending",
        "Confirmed",
        "Completed",
        "Rejected",
        "Cancelled",
    ].reduce((summary, status) => ({
        ...summary,
        [status]: visibleAppointments.filter((appointment) => appointment.status === status).length,
    }), {});

    const activeAppointments = visibleAppointments.filter(
        (appointment) => appointment.status !== "Cancelled"
    );

    const monthlyAppointments = Object.entries(
        visibleAppointments.reduce((months, appointment) => {
            const monthKey = getMonthKey(appointment);
            if (!monthKey) return months;
            months[monthKey] = months[monthKey] || [];
            months[monthKey].push(appointment);
            return months;
        }, {})
    ).sort(([firstMonth], [secondMonth]) => secondMonth.localeCompare(firstMonth));

    const getMonthlySummary = (monthAppointments) => (
        ["Completed", "Pending", "Cancelled"].reduce((summary, status) => ({
            ...summary,
            [status]: monthAppointments.filter((appointment) => appointment.status === status).length,
        }), {})
    );

    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (

            <div className="appointment-loading">
                Loading Appointment History...
            </div>
        );
    }

    const filteredAppointments = activeAppointments.filter((appointment) => {

        const matchesSearch =

            appointment.doctor_name
                ?.toLowerCase()
                .includes(search.toLowerCase())

            ||

            appointment.booking_number
                ?.toLowerCase()
                .includes(search.toLowerCase());

        const matchesStatus =

            statusFilter === "All"

                ? true

                : appointment.status === statusFilter;

        return matchesSearch && matchesStatus;

    });

    // ==========================================
    // Pagination
    // ==========================================

    const indexOfLastAppointment =
        currentPage * appointmentsPerPage;

    const indexOfFirstAppointment =
        indexOfLastAppointment - appointmentsPerPage;

    const currentAppointments =
        filteredAppointments.slice(
            indexOfFirstAppointment,
            indexOfLastAppointment
        );

    const totalPages = Math.ceil(
        filteredAppointments.length /
        appointmentsPerPage
    );

    return (

        <div className="appointment-history">

            <div className="history-header">

                <h2>My Appointment History</h2>

                <p>

                    View all your booked appointments.

                </p>

            </div>

            <section className="appointment-overview" aria-label="Appointment overview">
                <h3>Overview</h3>
                <div className="appointment-summary-grid">
                    <div className="appointment-summary-card total">
                        <span>Total Appointments</span>
                        <strong>{activeAppointments.length}</strong>
                    </div>
                    {Object.entries(statusSummary).map(([status, count]) => (
                        <div className={`appointment-summary-card ${status.toLowerCase()}`} key={status}>
                            <span>{status}</span>
                            <strong>{count}</strong>
                        </div>
                    ))}
                </div>
            </section>

            {/* Search & Filter */}

            <div className="history-filter">

                <input
                    type="text"
                    placeholder="Search by Doctor or Booking No..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
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

                    <option value="No Show">
                        No Show
                    </option>

                </select>

            </div>

            {filteredAppointments.length === 0 ? (

                <div className="empty-history">

                    No Appointment Found

                </div>

            ) : (

                <>

                    <table className="history-table">

                        <thead>

                            <tr>

                                <th>Booking</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {currentAppointments.map((appointment) => (

                                <tr key={appointment.id}>

                                    <td>
                                        {appointment.booking_number}
                                    </td>

                                    <td>
                                        {appointment.family_member_name ||
                                            appointment.patient_name ||
                                            "Self"}
                                    </td>

                                    <td>
                                        {appointment.doctor_name}
                                    </td>

                                    <td>
                                        {appointment.department_name || "-"}
                                    </td>

                                    <td>
                                        {appointment.appointment_date}
                                    </td>

                                    <td>
                                        {appointment.slot_time}
                                    </td>

                                    <td>

                                        <span
                                            className={`status-badge ${appointment.status
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")}`}
                                        >
                                            {appointment.status}
                                        </span>

                                        {appointment.status === "Rejected" &&
                                            appointment.rejection_reason && (
                                                <small className="d-block text-danger mt-1">
                                                    Reason: {appointment.rejection_reason}
                                                </small>
                                            )}

                                    </td>
                                    
                                    <td>

                                        <div className="appointment-actions">
                                            <Link
                                                to={`/appointments/details/${appointment.id}`}
                                                className="view-btn"
                                            >
                                                View
                                            </Link>

                                            {["Pending", "Confirmed", "Rejected"].includes(appointment.status) && !appointment.is_paid && !appointment.refund_approved && (
                                                <>
                                                    {appointment.status !== "Rejected" && (
                                                        <button
                                                            className="pay-btn"
                                                            onClick={() =>
                                                                navigate("/payment", {
                                                                    state: appointment,
                                                                })
                                                            }
                                                        >
                                                            Pay Now
                                                        </button>
                                                    )}

                                                    <button
                                                        className="cancel-btn"
                                                        onClick={() =>
                                                            handleCancel(appointment.id)
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {appointment.refund_approved && appointment.status !== "Cancelled" && (
                                                <button
                                                    className="cancel-btn"
                                                    onClick={() => handleCancel(appointment.id)}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {appointment.is_paid && !appointment.refund_approved && appointment.can_request_refund && (
                                                <button
                                                    className="pay-btn"
                                                    disabled={requestingRefundId === appointment.id}
                                                    onClick={() => handleRefundRequest(appointment)}
                                                >
                                                    {requestingRefundId === appointment.id ? "Sending..." : "Request Refund"}
                                                </button>
                                            )}
                                            {appointment.is_paid && appointment.refund_request_status === "Pending" && (
                                                <span className="status-badge pending">Refund Pending</span>
                                            )}
                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                    {/* Pagination */}

                    <div className="pagination">

                        <button
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage(currentPage - 1)
                            }
                        >
                            Previous
                        </button>

                        <span>

                            Page {currentPage} of {totalPages || 1}

                        </span>

                        <button
                            disabled={
                                currentPage === totalPages ||
                                totalPages === 0
                            }
                            onClick={() =>
                                setCurrentPage(currentPage + 1)
                            }
                        >
                            Next
                        </button>

                    </div>

                </>

            )}

            <details className="appointment-months" aria-label="Monthly appointment history">
                <summary className="monthly-history-toggle">
                    <span>Monthly History</span>
                    <span>{formatMonth(getCurrentMonthKey())}</span>
                </summary>
                <div className="monthly-history-content">
                    {monthlyAppointments.length === 0 ? (
                        <p className="monthly-empty">No monthly appointment history yet.</p>
                    ) : (
                        monthlyAppointments.map(([monthKey, monthAppointments]) => {
                            const monthSummary = getMonthlySummary(monthAppointments);
                            return (
                                <details className="appointment-month" key={monthKey}>
                                    <summary>
                                        <span>{formatMonth(monthKey)}</span>
                                        <strong>{monthAppointments.length} Appointments</strong>
                                        <span className="month-counts">
                                            Completed: {monthSummary.Completed} | Pending: {monthSummary.Pending} | Cancelled: {monthSummary.Cancelled}
                                        </span>
                                    </summary>
                                    <div className="monthly-appointment-list">
                                        {monthAppointments.map((appointment) => (
                                            <div className="monthly-appointment-row" key={appointment.id}>
                                                <span>{appointment.booking_number}</span>
                                                <span>
                                                    {appointment.family_member_name ||
                                                        appointment.patient_name ||
                                                        "Self"}
                                                </span>
                                                <span>{appointment.doctor_name || "Doctor"}</span>
                                                <span>{appointment.appointment_date}</span>
                                                <span className={`status-badge ${String(appointment.status || "").toLowerCase().replace(/\s+/g, "-")}`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            );
                        })
                    )}
                </div>
            </details>

        </div>

    );

}

export default MyAppointments;