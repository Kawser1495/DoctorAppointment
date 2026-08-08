import { Link, useLocation, Navigate } from "react-router-dom";

function PaymentSuccess() {

    const location = useLocation();

    const payment = location.state?.payment;
    const appointment = location.state?.appointment;

    // Direct URL access হলে
    if (!payment || !appointment) {
        return <Navigate to="/payments" replace />;
    }

    return (

        <div className="container mt-5">

            <div className="card shadow">

                <div className="card-body text-center">

                    <h1 className="text-success mb-3">
                        ✅ Payment Successful
                    </h1>

                    <p className="lead">
                        Your appointment payment has been completed successfully.
                    </p>

                    <hr />

                    <div className="text-start">

                        <h5>Appointment Information</h5>

                        <p>
                            <strong>Booking Number:</strong>{" "}
                            {appointment.booking_number}
                        </p>

                        <p>
                            <strong>Doctor:</strong>{" "}
                            {appointment.doctor_name}
                        </p>

                        <p>
                            <strong>Department:</strong>{" "}
                            {appointment.department}
                        </p>

                        <p>
                            <strong>Date:</strong>{" "}
                            {appointment.appointment_date}
                        </p>

                        <p>
                            <strong>Time:</strong>{" "}
                            {appointment.slot_time}
                        </p>

                        <hr />

                        <h5>Payment Information</h5>

                        <p>
                            <strong>Amount:</strong> ৳{" "}
                            {appointment.consultation_fee}
                        </p>

                        <p>
                            <strong>Transaction ID:</strong>{" "}
                            {payment.transaction_id}
                        </p>

                        <p>
                            <strong>Payment Method:</strong>{" "}
                            {payment.payment_method}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            <span className="badge bg-success">
                                {payment.payment_status}
                            </span>
                        </p>

                    </div>

                    <div className="mt-4">

                        <Link
                            to="/payments"
                            className="btn btn-primary me-2"
                        >
                            Payment History
                        </Link>

                        <Link
                            to="/appointments"
                            className="btn btn-success"
                        >
                            My Appointments
                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default PaymentSuccess;