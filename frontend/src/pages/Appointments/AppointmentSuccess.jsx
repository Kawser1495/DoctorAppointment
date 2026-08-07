import { Link } from "react-router-dom";

export default function AppointmentSuccess() {
    return (
        <div className="success-page">

            <div className="success-card">

                <div className="success-icon">
                    ✅
                </div>

                <h2>
                    Appointment Booked Successfully
                </h2>

                <p>
                    Your appointment request has been submitted successfully.
                </p>

                <p>
                    Please wait until the doctor confirms your appointment.
                </p>

                <div className="success-buttons">

                    <Link
                        to="/my-appointments"
                        className="btn btn-primary"
                    >
                        View My Appointments
                    </Link>

                    <Link
                        to="/dashboard"
                        className="btn btn-secondary"
                    >
                        Dashboard
                    </Link>

                </div>

            </div>

        </div>
    );
}