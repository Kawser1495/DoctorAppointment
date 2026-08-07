import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getAppointmentDetails } from "../../services/appointmentService";

import "../../styles/appointment.css";

function AppointmentDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);

    const [loading, setLoading] = useState(true);

    // ==========================================
    // Load Appointment Details
    // ==========================================

    useEffect(() => {

        const fetchAppointment = async () => {

            try {

                const response =
                    await getAppointmentDetails(id);

                setAppointment(response.data);

            }

            catch (error) {

                console.error(error);

                alert("Failed to load appointment.");

            }

            finally {

                setLoading(false);

            }

        };

        fetchAppointment();

    }, [id]);

    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (

            <div className="appointment-loading">

                Loading Appointment Details...

            </div>

        );

    }

    if (!appointment) {

        return (

            <div className="appointment-loading">

                Appointment Not Found

            </div>

        );

    }

    return (

        <div className="appointment-page">

            <div className="appointment-container">

                <h2>

                    Appointment Details

                </h2>

                {/* Booking Information */}

                <div className="details-card">

                    <h3>

                        Booking Information

                    </h3>

                    <p>

                        <strong>Booking Number :</strong>{" "}

                        {appointment.booking_number}

                    </p>

                    <p>

                        <strong>Status :</strong>{" "}

                        <span
                            className={`status-badge ${appointment.status
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                }`}
                        >

                            {appointment.status}

                        </span>

                    </p>

                </div>

                {/* Patient */}

                <div className="details-card">

                    <h3>

                        Patient Information

                    </h3>

                    <p>

                        <strong>Patient :</strong>{" "}

                        {appointment.patient_name}

                    </p>

                </div>

                {/* Doctor */}

                <div className="details-card">

                    <h3>

                        Doctor Information

                    </h3>

                    <p>

                        <strong>Doctor :</strong>{" "}

                        Dr. {appointment.doctor_name}

                    </p>

                    <p>

                        <strong>Department :</strong>{" "}

                        {appointment.department}

                    </p>

                </div>

                {/* Appointment */}

                <div className="details-card">

                    <h3>

                        Appointment Information

                    </h3>

                    <p>

                        <strong>Date :</strong>{" "}

                        {appointment.appointment_date}

                    </p>

                    <p>

                        <strong>Time :</strong>{" "}

                        {appointment.slot_time}

                    </p>

                    <p>

                        <strong>Reason :</strong>{" "}

                        {appointment.reason}

                    </p>

                    <p>

                        <strong>Symptoms :</strong>{" "}

                        {

                            appointment.symptoms ||

                            "Not Provided"

                        }

                    </p>

                </div>

                {/* Payment */}

                <div className="details-card">

                    <h3>

                        Payment Information

                    </h3>

                    <p>

                        <strong>Status :</strong>{" "}

                        {appointment.payment_status || "Pending"}

                    </p>

                    <p>

                        <strong>Amount :</strong>{" "}

                        {

                            appointment.payment_amount

                                ? `৳ ${appointment.payment_amount}`

                                : "N/A"

                        }

                    </p>

                    <p>

                        <strong>Method :</strong>{" "}

                        {

                            appointment.payment_method ||

                            "N/A"

                        }

                    </p>

                    <p>

                        <strong>Transaction ID :</strong>{" "}

                        {

                            appointment.transaction_id ||

                            "N/A"

                        }

                    </p>

                </div>

                {/* Buttons */}

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "25px",
                    }}
                >

                    <button
                        className="appointment-btn"
                        onClick={() => navigate(-1)}
                    >

                        ← Back

                    </button>

                </div>

            </div>

        </div>

    );

}

export default AppointmentDetails;