import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { createPayment } from "../../services/paymentService";

import "../../styles/payment.css";


function PaymentPage() {

    const navigate = useNavigate();

    const location = useLocation();


    // ==========================================================
    // Appointment data received from BookAppointment page
    // ==========================================================

    const appointment = location.state;


    // ==========================================================
    // State
    // ==========================================================

    const [paymentMethod, setPaymentMethod] =
        useState("Bkash");

    const [transactionId, setTransactionId] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    // ==========================================================
    // Debug Appointment Data
    // ==========================================================

    console.log(
        "Appointment received:",
        appointment
    );

    if (appointment) {

        console.log(
            "Consultation Fee:",
            appointment.consultation_fee
        );

    }


    // ==========================================================
    // Invalid Payment Request
    // ==========================================================

    if (!appointment) {

        return (

            <div className="container mt-5">

                <div className="alert alert-danger">

                    Invalid payment request.

                </div>

            </div>

        );

    }


    // ==========================================================
    // Handle Payment
    // ==========================================================

    const handlePayment = async () => {

        // ======================================================
        // Clean Transaction ID
        // ======================================================

        const cleanTransactionId =
            transactionId.trim();


        // ======================================================
        // Transaction ID Validation
        // ======================================================

        if (!cleanTransactionId) {

            alert(
                "Please enter the Transaction ID."
            );

            return;

        }


        if (cleanTransactionId.length < 4) {

            alert(
                "Transaction ID must be at least 4 characters."
            );

            return;

        }


        // ======================================================
        // Consultation Fee
        // ======================================================

        const amount =
            Number(
                appointment.consultation_fee
            );


        // ======================================================
        // Amount Validation
        // ======================================================

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            console.error(
                "Invalid consultation fee:",
                appointment.consultation_fee
            );

            alert(
                "Invalid payment amount. Please go back and select the appointment again."
            );

            return;

        }


        // ======================================================
        // Payment Payload
        // ======================================================

        const payload = {

            appointment:
                appointment.id,

            amount:
                amount,

            payment_method:
                paymentMethod,

            transaction_id:
                cleanTransactionId,

        };


        // ======================================================
        // Debug Payload
        // ======================================================

        console.log(
            "Payment Payload:",
            payload
        );


        // ======================================================
        // API Request
        // ======================================================

        try {

            setLoading(true);


            const response =
                await createPayment(
                    payload
                );


            console.log(
                "Payment Response:",
                response.data
            );


            // ==================================================
            // Backend response:
            //
            // {
            //     success: true,
            //     message: "...",
            //     data: {...}
            // }
            // ==================================================

            const paymentData =
                response.data?.data ||
                response.data;


            // ==================================================
            // Navigate to Payment Success
            // ==================================================

            navigate(
                "/payment-success",
                {

                    state: {

                        payment:
                            paymentData,

                        appointment:
                            appointment,

                    },

                }
            );

        }


        // ======================================================
        // Error Handling
        // ======================================================

        catch (error) {

            console.error(
                "Payment Error:",
                error
            );


            // ==================================================
            // Backend Error
            // ==================================================

            if (error.response) {

                const data =
                    error.response.data;


                console.log(
                    "Backend Payment Error:",
                    data
                );


                // ==================================================
                // Transaction ID Error
                // ==================================================

                if (data.transaction_id) {

                    const message =
                        Array.isArray(
                            data.transaction_id
                        )
                            ? data.transaction_id[0]
                            : data.transaction_id;


                    alert(message);

                    return;

                }


                // ==================================================
                // Appointment Error
                // ==================================================

                if (data.appointment) {

                    const message =
                        Array.isArray(
                            data.appointment
                        )
                            ? data.appointment[0]
                            : data.appointment;


                    alert(message);

                    return;

                }


                // ==================================================
                // Amount Error
                // ==================================================

                if (data.amount) {

                    const message =
                        Array.isArray(
                            data.amount
                        )
                            ? data.amount[0]
                            : data.amount;


                    alert(message);

                    return;

                }


                // ==================================================
                // Payment For Error
                // ==================================================

                if (data.payment_for) {

                    const message =
                        Array.isArray(
                            data.payment_for
                        )
                            ? data.payment_for[0]
                            : data.payment_for;


                    alert(message);

                    return;

                }


                // ==================================================
                // Patient Error
                // ==================================================

                if (data.patient) {

                    const message =
                        Array.isArray(
                            data.patient
                        )
                            ? data.patient[0]
                            : data.patient;


                    alert(message);

                    return;

                }


                // ==================================================
                // Authentication Error
                // ==================================================

                if (data.authentication) {

                    const message =
                        Array.isArray(
                            data.authentication
                        )
                            ? data.authentication[0]
                            : data.authentication;


                    alert(message);

                    return;

                }


                // ==================================================
                // General Backend Message
                // ==================================================

                if (data.message) {

                    alert(
                        data.message
                    );

                    return;

                }


                // ==================================================
                // Detail Message
                // ==================================================

                if (data.detail) {

                    alert(
                        data.detail
                    );

                    return;

                }


                // ==================================================
                // Fallback
                // ==================================================

                alert(
                    "Payment failed. Please check your information."
                );

            }


            // ======================================================
            // Server Connection Error
            // ======================================================

            else {

                alert(
                    "Cannot connect to the server."
                );

            }

        }


        // ======================================================
        // Stop Loading
        // ======================================================

        finally {

            setLoading(false);

        }

    };


    // ==========================================================
    // UI
    // ==========================================================

    return (

        <div className="container mt-5">

            <div className="card shadow">

                {/* ==================================================
                    Header
                ================================================== */}

                <div className="card-header bg-primary text-white">

                    <h3>

                        Appointment Payment

                    </h3>

                </div>


                {/* ==================================================
                    Body
                ================================================== */}

                <div className="card-body">


                    {/* ==================================================
                        Appointment Information
                    ================================================== */}

                    <h5>

                        Appointment Information

                    </h5>


                    <hr />


                    <p>

                        <strong>
                            Booking Number:
                        </strong>

                        {" "}

                        {appointment.booking_number}

                    </p>


                    <p>

                        <strong>
                            Doctor:
                        </strong>

                        {" "}

                        {appointment.doctor_name}

                    </p>


                    <p>

                        <strong>
                            Department:
                        </strong>

                        {" "}

                        {
                            appointment.department_name ||
                            appointment.department ||
                            "N/A"
                        }

                    </p>


                    <p>

                        <strong>
                            Specialization:
                        </strong>

                        {" "}

                        {
                            appointment.specialization ||
                            "N/A"
                        }

                    </p>


                    <p>

                        <strong>
                            Date:
                        </strong>

                        {" "}

                        {appointment.appointment_date}

                    </p>


                    <p>

                        <strong>
                            Time:
                        </strong>

                        {" "}

                        {appointment.slot_time}

                    </p>


                    <hr />


                    {/* ==================================================
                        Amount
                    ================================================== */}

                    <h4>

                        Total Amount

                    </h4>


                    <h2 className="text-success">

                        ৳ {appointment.consultation_fee}

                    </h2>


                    <hr />


                    {/* ==================================================
                        Payment Method
                    ================================================== */}

                    <div className="mb-3">

                        <label
                            className="form-label"
                        >

                            Payment Method

                        </label>


                        <select

                            className="form-select"

                            value={paymentMethod}

                            onChange={(e) =>
                                setPaymentMethod(
                                    e.target.value
                                )
                            }

                            disabled={loading}

                        >

                            <option value="Bkash">
                                Bkash
                            </option>

                            <option value="Nagad">
                                Nagad
                            </option>

                            <option value="Rocket">
                                Rocket
                            </option>

                            <option value="Card">
                                Card
                            </option>

                            <option value="Cash">
                                Cash
                            </option>

                        </select>

                    </div>


                    {/* ==================================================
                        Transaction ID
                    ================================================== */}

                    <div className="mb-3">

                        <label
                            className="form-label"
                        >

                            Transaction ID

                        </label>


                        <input

                            type="text"

                            className="form-control"

                            required

                            placeholder="Enter Transaction ID"

                            value={transactionId}

                            onChange={(e) =>
                                setTransactionId(
                                    e.target.value
                                )
                            }

                            disabled={loading}

                        />


                        <small className="text-muted">

                            Enter your payment transaction ID.

                        </small>

                    </div>


                    {/* ==================================================
                        Confirm Payment Button
                    ================================================== */}

                    <button

                        type="button"

                        className="btn btn-success w-100"

                        onClick={handlePayment}

                        disabled={loading}

                    >

                        {
                            loading
                                ? "Processing Payment..."
                                : "Confirm Payment"
                        }

                    </button>


                </div>

            </div>

        </div>

    );

}


export default PaymentPage;