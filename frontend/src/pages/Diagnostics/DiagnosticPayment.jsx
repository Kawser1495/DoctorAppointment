import {
    useState,
    useEffect,
    useCallback,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getDiagnosticBookingDetails,
} from "../../api/diagnosticBookingApi";

import {
    createPayment,
} from "../../services/paymentService";

import "../../styles/payment.css";


function DiagnosticPayment() {

    const navigate = useNavigate();

    const { id } = useParams();


    // ==========================================================
    // State
    // ==========================================================

    const [booking, setBooking] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [paymentLoading, setPaymentLoading] =
        useState(false);

    const [paymentMethod, setPaymentMethod] =
        useState("Bkash");

    const [paymentMode, setPaymentMode] =
        useState("Full");

    const [transactionId, setTransactionId] =
        useState("");


    // ==========================================================
    // Load Diagnostic Booking
    // ==========================================================

    const loadBookingDetails =
        useCallback(async () => {

            try {

                setLoading(true);


                const response =
                    await getDiagnosticBookingDetails(
                        id
                    );


                console.log(
                    "Diagnostic Booking Response:",
                    response.data
                );


                const data =
                    response.data?.data ||
                    response.data;


                setBooking(data);

            }

            catch (error) {

                console.error(
                    "Diagnostic Booking Error:",
                    error
                );

                console.error(
                    "Backend Error:",
                    error.response?.data
                );


                alert(
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    "Unable to load diagnostic booking."
                );

            }

            finally {

                setLoading(false);

            }

        }, [id]);


    // ==========================================================
    // Load Booking
    // ==========================================================

    useEffect(() => {

        loadBookingDetails();

    }, [loadBookingDetails]);


    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (

            <div className="container mt-5">

                <div className="card shadow">

                    <div className="card-body text-center">

                        <h4>
                            Loading Payment Details...
                        </h4>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================================
    // Booking Not Found
    // ==========================================================

    if (!booking) {

        return (

            <div className="container mt-5">

                <div className="alert alert-danger">

                    Diagnostic booking not found.

                </div>

            </div>

        );

    }


    // ==========================================================
    // Test Name
    // ==========================================================

    const testName =
        booking.test_name ||
        booking.diagnostic_test_name ||
        booking.diagnostic_test?.name ||
        "Diagnostic Test";


    // ==========================================================
    // Category
    // ==========================================================

    const categoryName =
        booking.category_name ||
        booking.diagnostic_test?.category?.name ||
        "N/A";


    // ==========================================================
    // Get Amount Safely
    // ==========================================================

    const rawAmount =

        booking.remaining_amount ??

        booking.amount ??

        booking.test_price ??

        booking.price ??

        booking.diagnostic_test_price ??

        booking.diagnostic_test?.price ??

        0;


    const amount =
        Number(rawAmount);


    // ==========================================================
    // Handle Payment
    // ==========================================================

    const handlePayment = async () => {

        const cleanTransactionId =
            transactionId.trim();


        // ------------------------------------------------------
        // Transaction ID Validation
        // ------------------------------------------------------

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


        // ------------------------------------------------------
        // Amount Validation
        // ------------------------------------------------------

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            console.error(
                "Invalid booking amount:",
                booking
            );


            alert(
                "Invalid diagnostic test amount."
            );

            return;

        }


        // ======================================================
        // Payment Payload
        //
        // IMPORTANT:
        // amount is calculated by Django backend.
        // Do not depend on frontend amount.
        // ======================================================

        const payload = {

            test_booking:
                Number(booking.id),

            payment_mode:
                paymentMode,

            payment_method:
                paymentMethod,

            transaction_id:
                cleanTransactionId,

        };


        console.log(
            "Diagnostic Payment Payload:",
            payload
        );


        try {

            setPaymentLoading(true);


            const response =
                await createPayment(
                    payload
                );


            console.log(
                "Diagnostic Payment Response:",
                response.data
            );


            const paymentData =
                response.data?.data ||
                response.data?.payment ||
                response.data;


            if (!paymentData?.id) {

                console.error(
                    "Invalid Payment Response:",
                    response.data
                );


                alert(
                    response.data?.message ||
                    "Payment was created but payment information could not be loaded."
                );

                return;

            }


            // ==================================================
            // Success
            // ==================================================

            alert(
                response.data?.message ||
                "Payment submitted successfully."
            );


            // ==================================================
            // Navigate
            // ==================================================

            navigate(

                "/payment-success",

                {

                    state: {

                        payment:
                            paymentData,

                        diagnosticBooking:
                            booking,

                    },

                }

            );

        }

        catch (error) {

            console.error(
                "Diagnostic Payment Error:",
                error
            );


            const data =
                error.response?.data;


            console.error(
                "Backend Payment Error:",
                data
            );


            // ==================================================
            // No Server Response
            // ==================================================

            if (!error.response) {

                alert(
                    "Cannot connect to the payment server."
                );

                return;

            }


            // ==================================================
            // Backend General Message
            // ==================================================

            if (data?.message) {

                alert(
                    data.message
                );

                return;

            }


            if (data?.detail) {

                alert(
                    data.detail
                );

                return;

            }


            // ==================================================
            // Validation Errors
            // ==================================================

            const validationFields = [

                "payment_mode",

                "test_booking",

                "appointment",

                "transaction_id",

                "payment_method",

                "payment_for",

                "patient",

                "authentication",

                "payment",

                "amount",

            ];


            for (
                const field of validationFields
            ) {

                if (data?.[field]) {

                    const message =
                        Array.isArray(
                            data[field]
                        )

                            ? data[field][0]

                            : data[field];


                    alert(message);

                    return;

                }

            }


            // ==================================================
            // Generic DRF Object Error
            // ==================================================

            if (data) {

                const firstError =
                    Object.values(data)
                        .flat()
                        .find(
                            (value) =>
                                typeof value ===
                                "string"
                        );


                if (firstError) {

                    alert(
                        firstError
                    );

                    return;

                }

            }


            alert(
                "Payment failed. Please try again."
            );

        }

        finally {

            setPaymentLoading(false);

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

                    <h3 className="mb-0">

                        Diagnostic Test Payment

                    </h3>

                </div>


                <div className="card-body">


                    {/* Back */}

                    <button

                        type="button"

                        className="btn btn-outline-secondary mb-4"

                        onClick={() =>
                            navigate(
                                `/my-diagnostic-bookings/${booking.id}`
                            )
                        }

                        disabled={paymentLoading}

                    >

                        ← Back to Booking Details

                    </button>


                    {/* ==================================================
                        Booking Information
                    ================================================== */}

                    <h5>

                        Diagnostic Booking Information

                    </h5>

                    <hr />


                    <p>

                        <strong>
                            Booking Number:
                        </strong>

                        {" "}

                        {booking.booking_number || "N/A"}

                    </p>


                    <p>

                        <strong>
                            Test Name:
                        </strong>

                        {" "}

                        {testName}

                    </p>


                    <p>

                        <strong>
                            Category:
                        </strong>

                        {" "}

                        {categoryName}

                    </p>


                    <hr />


                    {/* ==================================================
                        Amount
                    ================================================== */}

                    <h5>

                        Payment Amount

                    </h5>


                    <h2 className="text-success mb-4">

                        ৳ {
                            Number.isFinite(amount)

                                ? amount.toFixed(2)

                                : "0.00"
                        }

                    </h2>


                    <hr />


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

                            onChange={(e) =>
                                setPaymentMode(
                                    e.target.value
                                )
                            }

                            disabled={paymentLoading}

                        >

                            <option value="Full">

                                Full Payment

                            </option>

                            <option value="Partial">

                                Partial Payment

                            </option>

                        </select>

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

                            onChange={(e) =>
                                setPaymentMethod(
                                    e.target.value
                                )
                            }

                            disabled={paymentLoading}

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

                            onChange={(e) =>
                                setTransactionId(
                                    e.target.value
                                )
                            }

                            disabled={paymentLoading}

                        />


                        <small className="text-muted">

                            Enter your payment transaction ID.

                        </small>

                    </div>


                    {/* ==================================================
                        Confirm Payment
                    ================================================== */}

                    <button

                        type="button"

                        className="btn btn-success w-100"

                        onClick={handlePayment}

                        disabled={
                            paymentLoading ||
                            !transactionId.trim()
                        }

                    >

                        {

                            paymentLoading

                                ? "Processing Payment..."

                                : `Confirm ${paymentMode} Payment`

                        }

                    </button>


                </div>

            </div>

        </div>

    );

}


export default DiagnosticPayment;