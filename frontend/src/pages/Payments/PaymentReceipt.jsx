import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPaymentDetails } from "../../services/paymentService";


function PaymentReceipt() {

    const { id } = useParams();


    // ==========================================================
    // State
    // ==========================================================

    const [payment, setPayment] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================================
    // Load Payment
    // ==========================================================

    useEffect(() => {

        const loadPayment = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await getPaymentDetails(id);


                console.log(
                    "Payment Receipt Data:",
                    response.data
                );


                const data =
                    response.data?.data ||
                    response.data;


                setPayment(data);

            } catch (error) {

                console.error(
                    "Receipt Error:",
                    error
                );


                if (
                    error.response?.status === 404
                ) {

                    setError(
                        "Payment receipt not found."
                    );

                } else if (
                    error.response?.status === 401
                ) {

                    setError(
                        "Authentication required. Please login again."
                    );

                } else {

                    setError(
                        "Failed to load payment receipt."
                    );

                }

            } finally {

                setLoading(false);

            }

        };


        loadPayment();

    }, [id]);


    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (

            <div className="container mt-5">

                <div className="text-center">

                    <h3>

                        Loading Payment Receipt...

                    </h3>

                </div>

            </div>

        );

    }


    // ==========================================================
    // Error
    // ==========================================================

    if (error) {

        return (

            <div className="container mt-5">

                <div className="alert alert-danger">

                    {error}

                </div>


                <Link
                    to="/payments"
                    className="btn btn-primary"
                >

                    Back to Payments

                </Link>

            </div>

        );

    }


    // ==========================================================
    // Payment Not Found
    // ==========================================================

    if (!payment) {

        return (

            <div className="container mt-5">

                <div className="alert alert-warning">

                    Payment information not available.

                </div>


                <Link
                    to="/payments"
                    className="btn btn-primary"
                >

                    Back to Payments

                </Link>

            </div>

        );

    }


    // ==========================================================
    // Payment Values
    // ==========================================================

    const paymentOption =
        payment.payment_option ||
        "Full";


    const totalAmount =
        Number(
            payment.total_amount ??
            payment.expected_amount ??
            payment.amount ??
            0
        );


    const paidAmount =
        Number(
            payment.amount ??
            0
        );


    const remainingAmount =
        Number(
            payment.remaining_amount ??
            Math.max(
                totalAmount - paidAmount,
                0
            )
        );


    const refundAmount =
        Number(
            payment.refund_amount ??
            0
        );


    const isPartialPayment =
        paymentOption === "Partial";


    const isFullPayment =
        paymentOption === "Full";


    // ==========================================================
    // Refund Eligibility
    // ==========================================================

    const isRefundable =

        payment.is_refundable === true

        &&

        isFullPayment;


    // ==========================================================
    // Status Badge Class
    // ==========================================================

    const getPaymentStatusClass = (
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
    // Refund Status Badge Class
    // ==========================================================

    const getRefundStatusClass = (
        refundStatus
    ) => {

        switch (
            refundStatus
        ) {

            case "Requested":

                return "bg-warning text-dark";


            case "Approved":

                return "bg-info text-dark";


            case "Rejected":

                return "bg-danger";


            case "Refunded":

                return "bg-success";


            default:

                return "bg-secondary";

        }

    };


    // ==========================================================
    // Print Receipt
    // ==========================================================

    const handlePrint = () => {

        window.print();

    };


    // ==========================================================
    // Receipt
    // ==========================================================

    return (

        <div className="container mt-5">


            {/* ==================================================
                Action Buttons
            ================================================== */}

            <div className="d-flex justify-content-between mb-4 no-print">

                <Link
                    to={`/payments/${payment.id}`}
                    className="btn btn-secondary"
                >

                    ← Payment Details

                </Link>


                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handlePrint}
                >

                    🖨 Print / Save PDF

                </button>

            </div>


            {/* ==================================================
                Receipt
            ================================================== */}

            <div
                className="card shadow-sm"
                id="payment-receipt"
            >


                {/* ==================================================
                    Header
                ================================================== */}

                <div className="card-header text-center py-4">

                    <h2 className="mb-1">

                        Doctor Appointment System

                    </h2>


                    <p className="mb-0 text-muted">

                        Payment Receipt

                    </p>

                </div>


                {/* ==================================================
                    Body
                ================================================== */}

                <div className="card-body p-4">


                    {/* ==================================================
                        Payment Status
                    ================================================== */}

                    <div className="text-center mb-4">

                        <span
                            className={
                                `badge ${getPaymentStatusClass(
                                    payment.payment_status
                                )} fs-6`
                            }
                        >

                            {
                                payment.payment_status ||
                                "Pending"
                            }

                        </span>

                    </div>


                    {/* ==================================================
                        Receipt Information
                    ================================================== */}

                    <div className="row mb-4">


                        {/* Left */}

                        <div className="col-md-6">

                            <p className="mb-2">

                                <strong>

                                    Receipt ID:

                                </strong>

                                {" "}

                                #{payment.id}

                            </p>


                            <p className="mb-2">

                                <strong>

                                    Transaction ID:

                                </strong>

                                {" "}

                                {
                                    payment.transaction_id ||
                                    "N/A"
                                }

                            </p>


                            <p className="mb-2">

                                <strong>

                                    Payment Date:

                                </strong>

                                {" "}

                                {

                                    payment.payment_date

                                        ? new Date(
                                            payment.payment_date
                                        ).toLocaleString()

                                        : "N/A"

                                }

                            </p>

                        </div>


                        {/* Right */}

                        <div className="col-md-6">

                            <p className="mb-2">

                                <strong>

                                    Payment Method:

                                </strong>

                                {" "}

                                {
                                    payment.payment_method ||
                                    "N/A"
                                }

                            </p>


                            <p className="mb-2">

                                <strong>

                                    Booking Number:

                                </strong>

                                {" "}

                                {
                                    payment.appointment_booking ||
                                    "N/A"
                                }

                            </p>


                            <p className="mb-2">

                                <strong>

                                    Payment Type:

                                </strong>

                                {" "}

                                {

                                    isPartialPayment

                                        ? (

                                            <span className="badge bg-warning text-dark">

                                                Partial Payment

                                            </span>

                                        )

                                        : (

                                            <span className="badge bg-success">

                                                Full Payment

                                            </span>

                                        )

                                }

                            </p>

                        </div>

                    </div>


                    <hr />


                    {/* ==================================================
                        Patient Information
                    ================================================== */}

                    <h5 className="mb-3">

                        Patient Information

                    </h5>


                    <div className="row mb-4">


                        <div className="col-md-6">

                            <p className="mb-2">

                                <strong>

                                    Patient Name:

                                </strong>

                                {" "}

                                {
                                    payment.patient_name ||
                                    "N/A"
                                }

                            </p>

                        </div>


                        <div className="col-md-6">

                            <p className="mb-2">

                                <strong>

                                    Doctor:

                                </strong>

                                {" "}

                                {
                                    payment.doctor_name ||
                                    "N/A"
                                }

                            </p>

                        </div>

                    </div>


                    <hr />


                    {/* ==================================================
                        Payment Summary
                    ================================================== */}

                    <h5 className="mb-3">

                        Payment Summary

                    </h5>


                    <div className="table-responsive">

                        <table className="table table-bordered align-middle">


                            <thead className="table-light">

                                <tr>

                                    <th>

                                        Description

                                    </th>


                                    <th className="text-end">

                                        Amount

                                    </th>

                                </tr>

                            </thead>


                            <tbody>


                                {/* Total */}

                                <tr>

                                    <td>

                                        Total Consultation Fee

                                    </td>


                                    <td className="text-end">

                                        ৳ {
                                            totalAmount
                                                .toFixed(2)
                                        }

                                    </td>

                                </tr>


                                {/* Payment Type */}

                                <tr>

                                    <td>

                                        Payment Type

                                    </td>


                                    <td className="text-end">

                                        {

                                            isPartialPayment

                                                ? "Partial Payment"

                                                : "Full Payment"

                                        }

                                    </td>

                                </tr>


                                {/* Paid */}

                                <tr>

                                    <td>

                                        Amount Paid
                                        (This Transaction)

                                    </td>


                                    <td className="text-end text-success">

                                        ৳ {
                                            paidAmount
                                                .toFixed(2)
                                        }

                                    </td>

                                </tr>


                                {/* Remaining */}

                                <tr>

                                    <td>

                                        Remaining Amount

                                    </td>


                                    <td
                                        className={
                                            `text-end ${
                                                remainingAmount > 0

                                                    ? "text-danger"

                                                    : "text-success"
                                            }`
                                        }
                                    >

                                        ৳ {
                                            remainingAmount
                                                .toFixed(2)
                                        }

                                    </td>

                                </tr>


                                {/* Total Paid */}

                                <tr className="table-light">

                                    <th>

                                        Total Paid

                                    </th>


                                    <th className="text-end text-success">

                                        ৳ {
                                            paidAmount
                                                .toFixed(2)
                                        }

                                    </th>

                                </tr>

                            </tbody>

                        </table>

                    </div>


                    {/* ==================================================
                        Refund Information
                    ================================================== */}

                    <div className="mt-4">

                        <h5 className="mb-3">

                            Refund Information

                        </h5>


                        {/* Partial Payment */}

                        {

                            isPartialPayment

                            &&

                            (

                                <div className="alert alert-warning">

                                    <strong>

                                        Non-Refundable Payment

                                    </strong>

                                    <br />

                                    This is a partial payment.
                                    According to the payment policy,
                                    partial payments cannot be refunded.

                                </div>

                            )

                        }


                        {/* Full Payment */}

                        {

                            isFullPayment

                            &&

                            !payment.refund_status

                            &&

                            (

                                <div
                                    className={
                                        `alert ${
                                            isRefundable

                                                ? "alert-success"

                                                : "alert-secondary"
                                        }`
                                    }
                                >

                                    <strong>

                                        Refund Eligibility:

                                    </strong>

                                    {" "}

                                    {

                                        isRefundable

                                            ? (
                                                "This full payment is eligible for refund according to hospital policy."
                                            )

                                            : (
                                                "Refund is not currently available for this payment."
                                            )

                                    }

                                </div>

                            )

                        }


                        {/* Refund Status */}

                        {

                            payment.refund_status

                            &&

                            (

                                <div className="alert alert-light border">

                                    <p className="mb-2">

                                        <strong>

                                            Refund Status:

                                        </strong>

                                        {" "}

                                        <span
                                            className={
                                                `badge ${getRefundStatusClass(
                                                    payment.refund_status
                                                )}`
                                            }
                                        >

                                            {
                                                payment.refund_status
                                            }

                                        </span>

                                    </p>


                                    {

                                        refundAmount > 0

                                        &&

                                        (

                                            <p className="mb-0">

                                                <strong>

                                                    Refund Amount:

                                                </strong>

                                                {" "}

                                                <span className="text-danger">

                                                    ৳ {
                                                        refundAmount
                                                            .toFixed(2)
                                                    }

                                                </span>

                                            </p>

                                        )

                                    }

                                </div>

                            )

                        }

                    </div>


                    {/* ==================================================
                        Footer
                    ================================================== */}

                    <div className="text-center mt-5">

                        <p className="text-muted mb-1">

                            Thank you for using our service.

                        </p>


                        <small className="text-muted">

                            This is a computer-generated
                            payment receipt.

                        </small>

                    </div>

                </div>

            </div>

        </div>

    );

}


export default PaymentReceipt;