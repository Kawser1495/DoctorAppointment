import { useEffect, useState } from "react";
import {
    getMyAppointments,
    cancelAppointment,
} from "../../services/appointmentService";

import "../../styles/appointment.css";

function MyAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchAppointments = async () => {

            try {

                const response = await getMyAppointments();

                const data = response.data.data || response.data;

                setAppointments(data);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        fetchAppointments();

    }, []);

    const handleCancel = async (id) => {

        const confirm = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (!confirm) return;

        try {

            await cancelAppointment(id);

            setAppointments((previous) =>
                previous.map((appointment) =>
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

            alert("Failed to cancel appointment.");

        }

    };

    if (loading) {

        return (

            <div className="appointment-loading">

                Loading Appointment History...

            </div>

        );

    }

    return (

        <div className="appointment-history">

            <div className="history-header">

                <h2>My Appointment History</h2>

                <p>
                    View all your booked appointments.
                </p>

            </div>

            {appointments.length === 0 ? (

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

                        {appointments.map((appointment) => (

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
                                        className={`status-badge ${appointment.status.toLowerCase().replace(/\s+/g, "-")}`}
                                    >
                                        {appointment.status}
                                    </span>

                                </td>

                                <td>

                                    {appointment.status === "Pending" ? (

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

                                    ) : (

                                        "-"

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