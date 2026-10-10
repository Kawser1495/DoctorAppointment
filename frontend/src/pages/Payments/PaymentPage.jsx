import { useState } from "react";
import {
    useLocation,
    Link,
} from "react-router-dom";

import {
    createSSLCommerzPayment,
} from "../../services/paymentService";

import "../../styles/payment.css";


function PaymentPage() {

    const location = useLocation();


    // ==========================================================
    // Appointment Data
    // ==========================================================

    const appointment =
        location.state?.appointment ||
        location.state;


    // ==========================================================
    // State
    // ==========================================================

    const [paymentMode, setPaymentMode] =
        useState("Full");

    const [sslLoading, setSslLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==========================================================
    // Invalid Payment Request
    // ==========================================================

    if (!appointment?.id) {

        return (

            <div className="container mt-5">

                <div className="alert alert-danger">

                    Invalid payment request.
                    Please select an appointment first.

                </div>

                <Link
                    to="/appointments"
                    className="btn btn-primary"
                >
                    Go to Appointments
                </Link>

            </div>

        );

    }


    const handleSSLCommerzPayment = async () => {
        setError("");
        try {
            setSslLoading(true);
            const response = await createSSLCommerzPayment({
                appointment: appointment.id,
                payment_mode: paymentMode,
            });
            window.location.assign(response.data.gateway_url);
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                "Unable to start SSLCOMMERZ payment."
            );
        } finally {
            setSslLoading(false);
        }
    };


    // ==========================================================
    // Consultation Fee
    // ==========================================================

    const consultationFee =
        appointment.consultation_fee ||
        appointment.amount ||
        "N/A";


    // ==========================================================
    // UI
    // ==========================================================

    return (

        <div className="container mt-5 mb-5">

            <div className="card shadow">

                {/* ==================================================
                    Header
                ================================================== */}

                <div className="card-header bg-primary text-white">

                    <h3 className="mb-0">

                        Appointment Payment

                    </h3>

                </div>


                <div className="card-body">


                    {/* ==================================================
                        Error
                    ================================================== */}

                    {error && (

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    )}


                    {/* ==================================================
                        Appointment Information
                    ================================================== */}

                    <h5>

                        Appointment Information

                    </h5>

                    <hr />


                    <div className="row">


                        <div className="col-md-6 mb-3">

                            <strong>
                                Booking Number:
                            </strong>

                            <p className="mb-0">

                                {
                                    appointment.booking_number ||
                                    "N/A"
                                }

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Doctor:
                            </strong>

                            <p className="mb-0">

                                {
                                    appointment.doctor_name ||
                                    "N/A"
                                }

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Department:
                            </strong>

                            <p className="mb-0">

                                {
                                    appointment.department_name ||
                                    appointment.department ||
                                    "N/A"
                                }

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Specialization:
                            </strong>

                            <p className="mb-0">

                                {
                                    appointment.specialization ||
                                    "N/A"
                                }

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Appointment Date:
                            </strong>

                            <p className="mb-0">

                                {
                                    appointment.appointment_date ||
                                    "N/A"
                                }

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Appointment Time:
                            </strong>

                            <p className="mb-0">

                                {
                                    appointment.slot_time ||
                                    "N/A"
                                }

                            </p>

                        </div>

                    </div>


                    <hr />


                    {/* ==================================================
                        Total Fee
                    ================================================== */}

                    <div className="mb-4">

                        <h5>

                            Consultation Fee

                        </h5>

                        <h2 className="text-success">

                            ৳ {consultationFee}

                        </h2>

                    </div>


                    {/* ==================================================
                        Payment Form
                    ================================================== */}

                    <div>


                        {/* ==================================================
                            Payment Mode
                        ================================================== */}

                        <div className="mb-3">

                            <label className="form-label">

                                Payment Mode

                            </label>


                            <select

                                className="form-select"

                                value={paymentMode}

                                onChange={
                                    (event) =>
                                        setPaymentMode(
                                            event.target.value
                                        )
                                }

                                disabled={sslLoading}

                            >

                                <option value="Full">

                                    Full Payment

                                </option>


                                <option value="Partial">

                                    Partial Payment

                                </option>

                            </select>


                            <small className="text-muted">

                                Full payment pays the remaining balance.
                                Partial payment amount is calculated
                                according to the backend policy.

                            </small>

                        </div>


                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={handleSSLCommerzPayment}
                            disabled={sslLoading}
                        >
                            {sslLoading
                                ? "Redirecting to SSLCOMMERZ..."
                                : "Pay securely with SSLCOMMERZ"}
                        </button>

                        <Link
                            to="/appointments"
                            className="btn btn-secondary w-100 mt-3"
                        >
                            Cancel
                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );

}


export default PaymentPage;