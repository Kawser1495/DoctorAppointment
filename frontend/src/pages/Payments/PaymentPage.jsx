import { useState } from "react";
import {
    useNavigate,
    useLocation,
    Link,
} from "react-router-dom";

import {
    createPayment,
} from "../../services/paymentService";

import "../../styles/payment.css";


function PaymentPage() {

    const navigate = useNavigate();

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

    const [paymentMethod, setPaymentMethod] =
        useState("Bkash");

    const [paymentMode, setPaymentMode] =
        useState("Full");

    const [transactionId, setTransactionId] =
        useState("");

    const [loading, setLoading] =
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


    // ==========================================================
    // Handle Payment
    // ==========================================================

    const handlePayment = async (
        event
    ) => {

        event.preventDefault();


        // ======================================================
        // Reset Error
        // ======================================================

        setError("");


        // ======================================================
        // Clean Transaction ID
        // ======================================================

        const cleanTransactionId =
            transactionId.trim();


        // ======================================================
        // Validation
        // ======================================================

        if (!cleanTransactionId) {

            setError(
                "Please enter the Transaction ID."
            );

            return;

        }


        if (cleanTransactionId.length < 4) {

            setError(
                "Transaction ID must be at least 4 characters."
            );

            return;

        }


        // ======================================================
        // Payload
        //
        // IMPORTANT:
        // amount is NOT sent.
        //
        // Backend calculates:
        //
        // Full    → Remaining Amount
        // Partial → 20% Minimum Policy
        // ======================================================

        const payload = {

            appointment:
                appointment.id,

            payment_mode:
                paymentMode,

            payment_method:
                paymentMethod,

            transaction_id:
                cleanTransactionId,

        };


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


            const paymentData =
                response.data?.data ||
                response.data?.payment ||
                response.data;


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


            const data =
                error.response?.data;


            // ==================================================
            // Network Error
            // ==================================================

            if (!data) {

                setError(
                    "Cannot connect to the server. Please try again."
                );

                return;

            }


            // ==================================================
            // General Message
            // ==================================================

            if (data.message) {

                setError(
                    data.message
                );

                return;

            }


            // ==================================================
            // Detail
            // ==================================================

            if (data.detail) {

                setError(
                    data.detail
                );

                return;

            }


            // ==================================================
            // Field Errors
            // ==================================================

            const fieldErrors = [

                "transaction_id",

                "appointment",

                "payment",

                "payment_for",

                "patient",

                "authentication",

                "payment_mode",

                "payment_method",

            ];


            for (
                const field of fieldErrors
            ) {

                if (data[field]) {

                    const message =
                        Array.isArray(
                            data[field]
                        )

                            ? data[field][0]

                            : data[field];


                    setError(
                        message
                    );

                    return;

                }

            }


            setError(
                "Payment failed. Please check your information."
            );

        }


        finally {

            setLoading(false);

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

                    <form
                        onSubmit={handlePayment}
                    >


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

                                disabled={loading}

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


                        {/* ==================================================
                            Payment Method
                        ================================================== */}

                        <div className="mb-3">

                            <label className="form-label">

                                Payment Method

                            </label>


                            <select

                                className="form-select"

                                value={paymentMethod}

                                onChange={
                                    (event) =>
                                        setPaymentMethod(
                                            event.target.value
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

                        <div className="mb-4">

                            <label className="form-label">

                                Transaction ID

                            </label>


                            <input

                                type="text"

                                className="form-control"

                                placeholder="Enter Transaction ID"

                                value={transactionId}

                                onChange={
                                    (event) =>
                                        setTransactionId(
                                            event.target.value
                                        )
                                }

                                disabled={loading}

                                required

                            />


                            <small className="text-muted">

                                Enter the transaction ID
                                provided by your payment service.

                            </small>

                        </div>


                        {/* ==================================================
                            Actions
                        ================================================== */}

                        <div className="d-flex gap-2">


                            <Link

                                to="/appointments"

                                className="btn btn-secondary w-50"

                            >

                                Cancel

                            </Link>


                            <button

                                type="submit"

                                className="btn btn-success w-50"

                                disabled={loading}

                            >

                                {
                                    loading

                                        ? "Processing Payment..."

                                        : "Confirm Payment"
                                }

                            </button>

                        </div>


                    </form>

                </div>

            </div>

        </div>

    );

}


export default PaymentPage;