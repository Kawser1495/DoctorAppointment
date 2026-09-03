import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyPayments } from "../../services/paymentService";


function PaymentHistory() {

    // ==========================================================
    // State
    // ==========================================================

    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================================
    // Load My Payment History
    // ==========================================================

    useEffect(() => {

        const loadPayments = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await getMyPayments();


                console.log(
                    "Payment History Response:",
                    response.data
                );


                // ==================================================
                // Support Different Backend Response Structures
                // ==================================================

                const data =

                    response.data?.results ||

                    response.data?.data ||

                    response.data ||

                    [];


                setPayments(

                    Array.isArray(data)

                        ? data

                        : []

                );


            } catch (error) {

                console.error(
                    "Payment History Error:",
                    error
                );


                if (error.response) {

                    console.error(
                        "Backend Response:",
                        error.response.data
                    );


                    if (
                        error.response.status === 401
                    ) {

                        setError(
                            "Authentication required. Please login again."
                        );

                    }

                    else if (
                        error.response.status === 403
                    ) {

                        setError(
                            "You do not have permission to view payment history."
                        );

                    }

                    else {

                        setError(
                            error.response.data?.message ||
                            "Failed to load payment history."
                        );

                    }

                }

                else {

                    setError(
                        "Cannot connect to the server."
                    );

                }

            }

            finally {

                setLoading(false);

            }

        };


        loadPayments();

    }, []);


    // ==========================================================
    // Helper
    // Payment Status Badge
    // ==========================================================

    const getStatusBadge = (
        paymentStatus
    ) => {

        switch (
            paymentStatus
        ) {

            case "Paid":

                return "bg-success";


            case "Pending":

                return "bg-warning text-dark";


            case "Failed":

                return "bg-danger";


            case "Refunded":

                return "bg-secondary";


            default:

                return "bg-secondary";

        }

    };


    // ==========================================================
    // Helper
    // Payment Type Badge
    // ==========================================================

    const getPaymentTypeBadge = (
        paymentKind
    ) => {

        if (
            paymentKind === "Full"
        ) {

            return (
                <span className="badge bg-primary">

                    Full Payment

                </span>
            );

        }


        if (
            paymentKind === "Partial"
        ) {

            return (
                <span className="badge bg-info text-dark">

                    Partial Payment

                </span>
            );

        }


        return (

            <span className="badge bg-secondary">

                {paymentKind || "N/A"}

            </span>

        );

    };


    // ==========================================================
    // Helper
    // Refund Badge
    // ==========================================================

    const getRefundBadge = (
        payment
    ) => {

        // ======================================================
        // Already Refunded
        // ======================================================

        if (
            payment.payment_status ===
            "Refunded"
        ) {

            return (

                <span className="badge bg-secondary">

                    Refunded

                </span>

            );

        }


        // ======================================================
        // Refund Eligible
        // ======================================================

        if (
            payment.is_refundable
        ) {

            return (

                <span className="badge bg-success">

                    Refund Eligible

                </span>

            );

        }


        // ======================================================
        // Partial Payment
        // Non-refundable
        // ======================================================

        return (

            <span className="badge bg-danger">

                Non-Refundable

            </span>

        );

    };


    // ==========================================================
    // Loading
    // ==========================================================

    if (
        loading
    ) {

        return (

            <div className="container mt-5">

                <div className="text-center">

                    <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                    >
                        <span className="visually-hidden">

                            Loading...

                        </span>
                    </div>


                    <h4>

                        Loading Payment History...

                    </h4>

                </div>

            </div>

        );

    }


    // ==========================================================
    // Error
    // ==========================================================

    if (
        error
    ) {

        return (

            <div className="container mt-5">

                <div className="alert alert-danger">

                    {error}

                </div>


                <Link
                    to="/appointments"
                    className="btn btn-primary"
                >

                    Back to Appointments

                </Link>

            </div>

        );

    }


    // ==========================================================
    // Payment History
    // ==========================================================

    return (

        <div className="container mt-5 mb-5">


            {/* ==================================================
                Header
            ================================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2>

                        My Payment History

                    </h2>


                    <p className="text-muted mb-0">

                        View all your appointment and diagnostic payment transactions.

                    </p>

                </div>


                <Link
                    to="/appointments"
                    className="btn btn-primary"
                >

                    My Appointments

                </Link>

            </div>


            {/* ==================================================
                Payment Summary
            ================================================== */}

            {payments.length > 0 && (

                <div className="row mb-4">


                    {/* Total Payments */}

                    <div className="col-md-4 mb-3">

                        <div className="card shadow-sm h-100">

                            <div className="card-body">

                                <small className="text-muted">

                                    Total Transactions

                                </small>


                                <h3 className="mb-0">

                                    {payments.length}

                                </h3>

                            </div>

                        </div>

                    </div>


                    {/* Successful Payments */}

                    <div className="col-md-4 mb-3">

                        <div className="card shadow-sm h-100">

                            <div className="card-body">

                                <small className="text-muted">

                                    Successful Payments

                                </small>


                                <h3 className="mb-0 text-success">

                                    {
                                        payments.filter(

                                            (
                                                payment
                                            ) =>

                                                payment.payment_status ===
                                                "Paid"

                                        ).length
                                    }

                                </h3>

                            </div>

                        </div>

                    </div>


                    {/* Refund Eligible */}

                    <div className="col-md-4 mb-3">

                        <div className="card shadow-sm h-100">

                            <div className="card-body">

                                <small className="text-muted">

                                    Refund Eligible

                                </small>


                                <h3 className="mb-0 text-primary">

                                    {
                                        payments.filter(

                                            (
                                                payment
                                            ) =>

                                                payment.is_refundable &&
                                                payment.payment_status ===
                                                "Paid"

                                        ).length
                                    }

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                No Payment
            ================================================== */}

            {
                payments.length === 0

                    ? (

                        <div className="alert alert-info">

                            <h5>

                                No Payment History Found

                            </h5>


                            <p className="mb-0">

                                You have not made any payment yet.

                            </p>

                        </div>

                    )

                    : (

                        <div className="card shadow-sm">

                            <div className="card-body p-0">

                                <div className="table-responsive">

                                    <table className="table table-bordered table-hover align-middle mb-0">


                                        {/* ==================================
                                            Table Header
                                        ================================== */}

                                        <thead className="table-light">

                                            <tr>

                                                <th>

                                                    Payment ID

                                                </th>


                                                <th>

                                                    Booking

                                                </th>


                                                <th>

                                                    Doctor

                                                </th>


                                                <th>

                                                    Type

                                                </th>


                                                <th>

                                                    Paid Amount

                                                </th>


                                                <th>

                                                    Due

                                                </th>


                                                <th>

                                                    Method

                                                </th>


                                                <th>

                                                    Status

                                                </th>


                                                <th>

                                                    Refund

                                                </th>


                                                <th>

                                                    Date

                                                </th>


                                                <th>

                                                    Action

                                                </th>

                                            </tr>

                                        </thead>


                                        {/* ==================================
                                            Table Body
                                        ================================== */}

                                        <tbody>

                                            {

                                                payments.map(

                                                    (
                                                        payment
                                                    ) => (

                                                        <tr
                                                            key={
                                                                payment.id
                                                            }
                                                        >


                                                            {/* Payment ID */}

                                                            <td>

                                                                <strong>

                                                                    #
                                                                    {
                                                                        payment.id
                                                                    }

                                                                </strong>

                                                            </td>


                                                            {/* Booking */}

                                                            <td>

                                                                {
                                                                    payment.appointment_booking ||
                                                                    (
                                                                        payment.payment_type ===
                                                                        "Diagnostic Test"

                                                                            ? "Diagnostic Test"

                                                                            : "N/A"
                                                                    )
                                                                }

                                                            </td>


                                                            {/* Doctor */}

                                                            <td>

                                                                {
                                                                    payment.doctor_name ||
                                                                    "N/A"
                                                                }

                                                            </td>


                                                            {/* Payment Type */}

                                                            <td>

                                                                {
                                                                    getPaymentTypeBadge(

                                                                        payment.payment_kind

                                                                    )
                                                                }

                                                            </td>


                                                            {/* Paid Amount */}

                                                            <td>

                                                                <strong className="text-success">

                                                                    ৳ {
                                                                        payment.amount
                                                                    }

                                                                </strong>

                                                            </td>


                                                            {/* Remaining Due */}

                                                            <td>

                                                                {

                                                                    payment.remaining_amount !==
                                                                    undefined

                                                                        ? (

                                                                            <strong
                                                                                className={
                                                                                    Number(
                                                                                        payment.remaining_amount
                                                                                    ) >
                                                                                    0

                                                                                        ? "text-danger"

                                                                                        : "text-success"
                                                                                }
                                                                            >

                                                                                ৳ {
                                                                                    payment.remaining_amount
                                                                                }

                                                                            </strong>

                                                                        )

                                                                        : (

                                                                            "N/A"

                                                                        )

                                                                }

                                                            </td>


                                                            {/* Payment Method */}

                                                            <td>

                                                                {
                                                                    payment.payment_method ||
                                                                    "N/A"
                                                                }

                                                            </td>


                                                            {/* Payment Status */}

                                                            <td>

                                                                <span
                                                                    className={
                                                                        `badge ${

                                                                            getStatusBadge(

                                                                                payment.payment_status

                                                                            )

                                                                        }`
                                                                    }
                                                                >

                                                                    {
                                                                        payment.payment_status ||
                                                                        "Pending"
                                                                    }

                                                                </span>

                                                            </td>


                                                            {/* Refund Status */}

                                                            <td>

                                                                {
                                                                    getRefundBadge(

                                                                        payment

                                                                    )
                                                                }

                                                            </td>


                                                            {/* Payment Date */}

                                                            <td>

                                                                {
                                                                    payment.payment_date

                                                                        ? new Date(

                                                                            payment.payment_date

                                                                        ).toLocaleDateString()

                                                                        : "N/A"
                                                                }

                                                            </td>


                                                            {/* Action */}

                                                            <td>

                                                                <Link
                                                                    to={
                                                                        `/payments/${

                                                                            payment.id

                                                                        }`
                                                                    }
                                                                    className="btn btn-sm btn-primary"
                                                                >

                                                                    View

                                                                </Link>

                                                            </td>

                                                        </tr>

                                                    )

                                                )

                                            }

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                    )

            }


            {/* ==================================================
                Payment Policy Information
            ================================================== */}

            <div className="alert alert-light border mt-4">

                <h6>

                    Payment & Refund Policy

                </h6>


                <ul className="mb-0">

                    <li>

                        <strong>

                            Partial Payments

                        </strong>

                        {" "}

                        are non-refundable.

                    </li>


                    <li>

                        <strong>

                            Full Payments

                        </strong>

                        {" "}

                        may be eligible for refund according to hospital policy.

                    </li>


                    <li>

                        A payment marked as

                        {" "}

                        <strong>

                            Refunded

                        </strong>

                        {" "}

                        cannot be refunded again.

                    </li>

                </ul>

            </div>


        </div>

    );

}


export default PaymentHistory;