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
                    await getDiagnosticBookingDetails(id);

                console.log(
                    "Diagnostic Booking:",
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
    // Amount
    // ==========================================================

    const amount =
        Number(
            booking.amount ||
            booking.price ||
            booking.test_price ||
            booking.diagnostic_test?.price ||
            0
        );


    // ==========================================================
    // Handle Diagnostic Payment
    // ==========================================================

    const handlePayment = async () => {

        // ------------------------------------------------------
        // Clean Transaction ID
        // ------------------------------------------------------

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

            alert(
                "Invalid diagnostic test amount."
            );

            return;

        }


        // ======================================================
        // IMPORTANT
        //
        // Django PaymentSerializer expects:
        //
        // test_booking
        //
        // NOT:
        //
        // diagnostic_booking
        // ======================================================

        const payload = {

            test_booking:
                booking.id,

            amount:
                amount,

            payment_method:
                paymentMethod,

            transaction_id:
                cleanTransactionId,

        };


        // ------------------------------------------------------
        // Debug
        // ------------------------------------------------------

        console.log(
            "Diagnostic Payment Payload:",
            payload
        );


        // ======================================================
        // API Request
        // ======================================================

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


            // ==================================================
            // Backend Response
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
            // Success
            // ==================================================

            alert(
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


        // ======================================================
        // Error
        // ======================================================

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
            // No Response
            // ==================================================

            if (!error.response) {

                alert(
                    "Cannot connect to the payment server."
                );

                return;

            }


            // ==================================================
            // DRF errors
            //
            // Example:
            //
            // {
            //     "test_booking": [
            //         "A payment already exists..."
            //     ]
            // }
            // ==================================================

            if (data?.test_booking) {

                const message =
                    Array.isArray(
                        data.test_booking
                    )
                        ? data.test_booking[0]
                        : data.test_booking;


                alert(message);

                return;

            }


            // ==================================================
            // Transaction ID Error
            // ==================================================

            if (data?.transaction_id) {

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
            // Amount Error
            // ==================================================

            if (data?.amount) {

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

            if (data?.payment_for) {

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

            if (data?.patient) {

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

            if (data?.authentication) {

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
            // errors Object
            // ==================================================

            if (data?.errors) {

                const errors =
                    data.errors;


                const firstError =
                    Object.values(errors)
                        .flat()
                        .find(Boolean);


                if (firstError) {

                    alert(firstError);

                    return;

                }

            }


            // ==================================================
            // General Message
            // ==================================================

            alert(
                data?.message ||
                data?.detail ||
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


                {/* ==================================================
                    Body
                ================================================== */}

                <div className="card-body">


                    {/* ==================================================
                        Back Button
                    ================================================== */}

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
                        Diagnostic Information
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


                    <p>

                        <strong>
                            Booking Date:
                        </strong>

                        {" "}

                        {booking.booking_date || "N/A"}

                    </p>


                    <p>

                        <strong>
                            Booking Time:
                        </strong>

                        {" "}

                        {booking.booking_time || "N/A"}

                    </p>


                    <hr />


                    {/* ==================================================
                        Amount
                    ================================================== */}

                    <h5>

                        Total Amount

                    </h5>


                    <h2 className="text-success mb-4">

                        ৳ {amount.toFixed(2)}

                    </h2>


                    <hr />


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

                    <div className="mb-3">

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

                                : "Confirm Payment"

                        }

                    </button>


                </div>

            </div>

        </div>

    );

}


export default DiagnosticPayment;