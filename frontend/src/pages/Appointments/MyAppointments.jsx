import { useEffect, useState } from "react";
import {
    getMyAppointments,
    cancelAppointment,
} from "../../services/appointmentService";

import "../../styles/appointment.css";

function MyAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // Load Appointments
    // ==========================================

    const loadAppointments = async () => {

        try {

            const response = await getMyAppointments();

            setAppointments(response.data);

        } catch (error) {

            console.error(error);

            alert("Failed to load appointments.");

        } finally {

            setLoading(false);

        }

    };

    // ==========================================
    // Load Data on Page Load
    // ==========================================

    useEffect(() => {

        loadAppointments();

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

            alert("Appointment cancelled successfully.");

            loadAppointments();

        } catch (error) {

            console.error(error);

            alert("Cancellation failed.");

        }

    };

    if (loading) {

        return <h2>Loading...</h2>;

    }

    return (

        <div className="appointment-page">

            <div className="appointment-container">

                <h2>My Appointments</h2>

                {appointments.length === 0 ? (

                    <p>No appointment found.</p>

                ) : (

                    <table className="appointment-table">

                        <thead>

                            <tr>

                                <th>Booking No</th>
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

                                    <td>{appointment.booking_number}</td>

                                    <td>{appointment.doctor_name}</td>

                                    <td>{appointment.department}</td>

                                    <td>{appointment.appointment_date}</td>

                                    <td>{appointment.slot_time}</td>

                                    <td>

                                        <span
                                            className={`status ${appointment.status
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")}`}
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

        </div>

    );

}

export default MyAppointments;