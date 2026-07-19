import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getMyAppointments,
    cancelAppointment,
} from "../../services/appointmentService";

import "../../styles/appointment.css";

function MyAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // ==========================================
    // Load Appointments
    // ==========================================

    useEffect(() => {

        const fetchAppointments = async () => {

            try {

                const response = await getMyAppointments();

                const data = response.data.data || response.data;

                setAppointments(data);

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
                        ? {
                            ...appointment,
                            status: "Cancelled",
                        }
                        : appointment
                )
            );

            alert("Appointment cancelled successfully.");

        } catch (error) {

            console.error(error);

            alert("Cancellation failed.");

        }

    };

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

    // ==========================================
    // Search & Filter
    // ==========================================

    const filteredAppointments = appointments.filter((appointment) => {

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

    return (

        <div className="appointment-history">

            <div className="history-header">

                <h2>My Appointment History</h2>

                <p>

                    View all your booked appointments.

                </p>

            </div>

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

                    <option value="Cancelled">
                        Cancelled
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

                <table className="history-table">

                    <thead>

                        <tr>

                            <th>Booking</th>
                            <th>Doctor</th>
                            <th>Department</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {filteredAppointments.map((appointment) => (

                            <tr key={appointment.id}>

                                <td>
                                    {appointment.booking_number}
                                </td>

                                <td>
                                    {appointment.doctor_name}
                                </td>

                                <td>
                                    {appointment.department}
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

                                </td>

                                <td>

                                    <Link
                                        to={`/appointments/${appointment.id}`}
                                        className="view-btn"
                                    >
                                        View
                                    </Link>

                                    {" "}

                                    {appointment.status === "Pending" && (

                                        <button
                                            className="cancel-btn"
                                            onClick={() =>
                                                handleCancel(
                                                    appointment.id
                                                )
                                            }
                                        >
                                            Cancel
                                        </button>

                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

        </div>

    );

}

export default MyAppointments;