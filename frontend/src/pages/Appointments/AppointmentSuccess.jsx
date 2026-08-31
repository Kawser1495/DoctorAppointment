import {
    Link,
} from "react-router-dom";


// ==========================================================
// Appointment Success
// ==========================================================

export default function AppointmentSuccess() {

    return (

        <div className="success-page">


            {/* ==================================================
                Success Card
            ================================================== */}

            <div className="success-card">


                {/* ==================================================
                    Success Icon
                ================================================== */}

                <div className="success-icon">
                    ✅
                </div>


                {/* ==================================================
                    Title
                ================================================== */}

                <h2>
                    Appointment Booked Successfully
                </h2>


                {/* ==================================================
                    Message
                ================================================== */}

                <p>
                    Your appointment request has been submitted
                    successfully.
                </p>


                <p>
                    Please wait until the doctor confirms your
                    appointment.
                </p>


                {/* ==================================================
                    Buttons
                ================================================== */}

                <div className="success-buttons">


                    {/* ==================================================
                        My Appointments
                    ================================================== */}

                    <Link
                        to="/appointments"
                        className="btn btn-primary"
                    >

                        View My Appointments

                    </Link>


                    {/* ==================================================
                        Patient Dashboard
                    ================================================== */}

                    <Link
                        to="/patient/dashboard"
                        className="btn btn-secondary"
                    >

                        Dashboard

                    </Link>


                </div>


            </div>

        </div>

    );

}