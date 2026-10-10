import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { createRefundRequest, getMyPayments } from "../../services/paymentService";


function PaymentHistory() {

    // ==========================================================
    // State
    // ==========================================================

    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [requestingRefundId, setRequestingRefundId] = useState(null);

    const completedPaymentStatuses = [
        "Paid",
        "Partially Paid",
        "Refunded",
    ];

    const getPaymentAmount = (payment) => Number(
        payment.net_amount ?? payment.amount ?? 0
    );


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


                // ==================================================
                // Support Different Backend Response Structures
                // ==================================================

                const data =

                    response?.data?.results ||

                    response?.data?.data ||

                    response?.data ||

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

    const handleRefundRequest = async (payment) => {
        const reason = window.prompt("Why are you requesting a refund?", "I need to cancel this appointment.");
        if (!reason?.trim()) return;
        try {
            setRequestingRefundId(payment.id);
            const response = await createRefundRequest(payment.id, reason.trim());
            setPayments((current) => current.map((item) => (
                item.id === payment.id
                    ? { ...item, refund_request_status: response.data.refund_status, can_request_refund: false }
                    : item
            )));
            alert("Refund request sent to the doctor and admin.");
        } catch (requestError) {
            alert(requestError.response?.data?.detail || "Unable to send refund request.");
        } finally {
            setRequestingRefundId(null);
        }
    };


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

                    Refunded ৳{payment.refund_amount || 0} (80%) · Retained ৳{payment.refund_retained_amount || 0} (20%)

                </span>

            );

        }

        if (payment.refund_request_status === "Pending") {
            return (
                <span className="badge bg-warning text-dark">
                    Refund Requested
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

    const appointmentPayments = payments.filter(
        (payment) => payment.payment_type !== "Diagnostic Test"
    );

    const diagnosticPayments = payments.filter(
        (payment) => payment.payment_type === "Diagnostic Test"
    );

    const completedPayments = payments.filter(
        (payment) => completedPaymentStatuses.includes(payment.payment_status)
    );

    const completedAppointmentPayments = appointmentPayments.filter(
        (payment) => completedPaymentStatuses.includes(payment.payment_status)
    );

    const completedDiagnosticPayments = diagnosticPayments.filter(
        (payment) => completedPaymentStatuses.includes(payment.payment_status)
    );

    const totalPaidAmount = payments.reduce(
        (total, payment) => completedPaymentStatuses.includes(payment.payment_status)
            ? total + getPaymentAmount(payment)
            : total,
        0
    );

    const formatAmount = (amount) => `৳ ${amount.toLocaleString()}`;

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

                    <div className="col-md-3 mb-3">

                        <div className="card shadow-sm h-100">

                            <div className="card-body">

                                <small className="text-muted">

                                    Total Transactions

                                </small>


                                <h3 className="mb-0">

                                    {completedPayments.length}

                                </h3>

                            </div>

                        </div>

                    </div>


                    {/* Completed Payments */}

                    <div className="col-md-3 mb-3">

                        <div className="card shadow-sm h-100">

                            <div className="card-body">

                                <small className="text-muted">

                                    Completed Payments

                                </small>


                                <h3 className="mb-0 text-success">

                                    {
                                        payments.filter(

                                            (
                                                payment
                                            ) =>

                                                completedPaymentStatuses.includes(
                                                    payment.payment_status
                                                )

                                        ).length
                                    }

                                </h3>

                            </div>

                        </div>

                    </div>


                                    {/* Refund Payments */}

                    <div className="col-md-3 mb-3">

                        <div className="card shadow-sm h-100">

                            <div className="card-body">

                                <small className="text-muted">

                                                Refund Payments

                                </small>


                                <h3 className="mb-0 text-warning">

                                    {
                                        payments.filter(

                                            (
                                                payment
                                            ) =>

                                                payment.payment_status === "Refunded"

                                        ).length
                                    }

                                </h3>

                            </div>

                        </div>

                    </div>


                    {/* Refund Eligible */}

                    <div className="col-md-3 mb-3">

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


                    {/* Total Paid Amount */}

                    <div className="col-md-3 mb-3">

                        <div className="card shadow-sm h-100">

                            <div className="card-body">

                                <small className="text-muted">

                                    Total Paid Amount

                                </small>


                                <h3 className="mb-0 text-success">

                                    {formatAmount(totalPaidAmount)}

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

                                            <tr className="table-primary">

                                                <th colSpan="11">

                                                    Doctor Appointment Payments ({completedAppointmentPayments.length})
                                                    <span className="float-end">
                                                        {formatAmount(completedAppointmentPayments.reduce(
                                                            (total, payment) => total + getPaymentAmount(payment),
                                                            0
                                                        ))}
                                                    </span>

                                                </th>

                                            </tr>

                                            {

                                                appointmentPayments.map(

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

                                                                        payment.payment_mode

                                                                    )
                                                                }

                                                            </td>


                                                            {/* Paid Amount */}

                                                            <td>

                                                                <strong className="text-success">

                                                                    ৳ {
                                                                        payment.net_amount ?? payment.amount
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

                                                                {payment.can_request_refund && payment.payment_status === "Paid" && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-warning ms-2"
                                                                        disabled={requestingRefundId === payment.id}
                                                                        onClick={() => handleRefundRequest(payment)}
                                                                    >
                                                                        {requestingRefundId === payment.id ? "Sending..." : "Request Refund"}
                                                                    </button>
                                                                )}

                                                            </td>

                                                        </tr>

                                                    )

                                                )

                                            }

                                            <tr className="table-warning">

                                                <th colSpan="11">

                                                    Diagnostics Payments ({completedDiagnosticPayments.length})
                                                    <span className="float-end">
                                                        {formatAmount(completedDiagnosticPayments.reduce(
                                                            (total, payment) => total + getPaymentAmount(payment),
                                                            0
                                                        ))}
                                                    </span>

                                                </th>

                                            </tr>

                                            {

                                                diagnosticPayments.map(

                                                    (payment) => (

                                                        <tr key={payment.id}>

                                                            <td><strong>#{payment.id}</strong></td>

                                                            <td>{payment.diagnostic_test_name || "Diagnostic Test"}</td>

                                                            <td>{payment.booking_person_name || payment.patient_name || "N/A"}</td>

                                                            <td>{getPaymentTypeBadge(payment.payment_mode)}</td>

                                                            <td>
                                                                <strong className="text-success">
                                                                    {formatAmount(getPaymentAmount(payment))}
                                                                </strong>
                                                            </td>

                                                            <td>
                                                                {payment.remaining_amount !== undefined ? (
                                                                    <strong className={Number(payment.remaining_amount) > 0 ? "text-danger" : "text-success"}>
                                                                        {formatAmount(Number(payment.remaining_amount))}
                                                                    </strong>
                                                                ) : "N/A"}
                                                            </td>

                                                            <td>{payment.payment_method || "N/A"}</td>

                                                            <td>
                                                                <span className={`badge ${getStatusBadge(payment.payment_status)}`}>
                                                                    {payment.payment_status || "Pending"}
                                                                </span>
                                                            </td>

                                                            <td>{getRefundBadge(payment)}</td>

                                                            <td>
                                                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "N/A"}
                                                            </td>

                                                            <td>
                                                                <Link to={`/payments/${payment.id}`} className="btn btn-sm btn-primary">
                                                                    View
                                                                </Link>

                                                                {payment.can_request_refund && payment.payment_status === "Paid" && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-warning ms-2"
                                                                        disabled={requestingRefundId === payment.id}
                                                                        onClick={() => handleRefundRequest(payment)}
                                                                    >
                                                                        {requestingRefundId === payment.id ? "Sending..." : "Request Refund"}
                                                                    </button>
                                                                )}
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