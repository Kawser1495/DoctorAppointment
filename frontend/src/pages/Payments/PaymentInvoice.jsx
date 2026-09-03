import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPaymentDetails } from "../../services/paymentService";


function PaymentInvoice() {

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
                    "Payment Invoice Response:",
                    response.data
                );


                const data =

                    response.data?.data

                    ||

                    response.data;


                setPayment(data);

            } catch (error) {

                console.error(
                    "Payment Invoice Error:",
                    error
                );


                if (
                    error.response?.status === 404
                ) {

                    setError(
                        "Payment or invoice not found."
                    );

                } else if (
                    error.response?.status === 401
                ) {

                    setError(
                        "Authentication required. Please login again."
                    );

                } else {

                    setError(
                        "Failed to load invoice."
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

            <div className="container mt-5 text-center">

                <h3>

                    Loading Invoice...

                </h3>

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

                    Invoice not found.

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
    // Refund Information
    // ==========================================================

    const refundEligible =

        payment.is_refundable === true

        &&

        isFullPayment;


    // ==========================================================
    // Payment Status Badge
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
    // Refund Status Badge
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
    // Invoice
    // ==========================================================

    return (

        <div className="container mt-5">


            {/* ==================================================
                Invoice Card
            ================================================== */}

            <div
                id="invoice"
                className="card shadow mx-auto"
                style={{

                    maxWidth:
                        "900px"

                }}
            >


                {/* ==================================================
                    Header
                ================================================== */}

                <div className="card-header bg-primary text-white">

                    <div className="row align-items-center">


                        <div className="col-md-7">

                            <h2 className="mb-1">

                                Doctor Appointment System

                            </h2>


                            <p className="mb-0">

                                Medical Appointment
                                & Payment

                            </p>

                        </div>


                        <div className="col-md-5 text-md-end">

                            <h3 className="mb-1">

                                INVOICE

                            </h3>


                            <p className="mb-0">

                                Invoice #
                                INV-{payment.id}

                            </p>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    Invoice Body
                ================================================== */}

                <div className="card-body p-4">


                    {/* ==================================================
                        Patient + Invoice Information
                    ================================================== */}

                    <div className="row mb-4">


                        {/* Patient */}

                        <div className="col-md-6">

                            <h5>

                                Patient Information

                            </h5>


                            <p className="mb-1">

                                <strong>

                                    Name:

                                </strong>

                                {" "}

                                {

                                    payment.patient_name

                                    ||

                                    "N/A"

                                }

                            </p>

                        </div>


                        {/* Invoice */}

                        <div className="col-md-6 text-md-end">

                            <h5>

                                Invoice Information

                            </h5>


                            <p className="mb-1">

                                <strong>

                                    Invoice No:

                                </strong>

                                {" "}

                                INV-{payment.id}

                            </p>


                            <p className="mb-1">

                                <strong>

                                    Date:

                                </strong>

                                {" "}

                                {

                                    payment.payment_date

                                        ? new Date(
                                            payment.payment_date
                                        ).toLocaleDateString()

                                        : "N/A"

                                }

                            </p>


                            <p className="mb-1">

                                <strong>

                                    Payment ID:

                                </strong>

                                {" "}

                                #{payment.id}

                            </p>

                        </div>

                    </div>


                    <hr />


                    {/* ==================================================
                        Appointment Details
                    ================================================== */}

                    <h5 className="mb-3">

                        Appointment Details

                    </h5>


                    <div className="table-responsive">

                        <table className="table table-bordered">


                            <thead className="table-light">

                                <tr>

                                    <th>

                                        Description

                                    </th>


                                    <th>

                                        Booking

                                    </th>


                                    <th>

                                        Doctor

                                    </th>


                                    <th className="text-center">

                                        Payment Type

                                    </th>


                                    <th className="text-end">

                                        Total Fee

                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                <tr>


                                    <td>

                                        Doctor Consultation

                                    </td>


                                    <td>

                                        {

                                            payment.appointment_booking

                                            ||

                                            "N/A"

                                        }

                                    </td>


                                    <td>

                                        {

                                            payment.doctor_name

                                            ||

                                            "N/A"

                                        }

                                    </td>


                                    <td className="text-center">

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

                                    </td>


                                    <td className="text-end">

                                        ৳ {totalAmount.toFixed(2)}

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>


                    {/* ==================================================
                        Payment Summary
                    ================================================== */}

                    <div className="row mt-4">


                        {/* Left */}

                        <div className="col-md-6">

                            <h5>

                                Payment Information

                            </h5>


                            <p className="mb-1">

                                <strong>

                                    Payment Method:

                                </strong>

                                {" "}

                                {

                                    payment.payment_method

                                    ||

                                    "N/A"

                                }

                            </p>


                            <p className="mb-1">

                                <strong>

                                    Transaction ID:

                                </strong>

                                {" "}

                                {

                                    payment.transaction_id

                                    ||

                                    "N/A"

                                }

                            </p>


                            <p className="mb-1">

                                <strong>

                                    Payment Status:

                                </strong>

                                {" "}

                                <span
                                    className={
                                        `badge ${getPaymentStatusClass(
                                            payment.payment_status
                                        )}`
                                    }
                                >

                                    {

                                        payment.payment_status

                                        ||

                                        "Pending"

                                    }

                                </span>

                            </p>

                        </div>


                        {/* Right */}

                        <div className="col-md-6">

                            <div className="text-md-end">


                                <p className="mb-2">

                                    <strong>

                                        Total Amount:

                                    </strong>

                                    {" "}

                                    ৳ {totalAmount.toFixed(2)}

                                </p>


                                <p className="mb-2">

                                    <strong>

                                        Paid Amount:

                                    </strong>

                                    {" "}

                                    <span className="text-success">

                                        ৳ {paidAmount.toFixed(2)}

                                    </span>

                                </p>


                                <p className="mb-2">

                                    <strong>

                                        Remaining Amount:

                                    </strong>

                                    {" "}

                                    <span
                                        className={
                                            remainingAmount > 0

                                                ? "text-danger"

                                                : "text-success"
                                        }
                                    >

                                        ৳ {
                                            remainingAmount
                                                .toFixed(2)
                                        }

                                    </span>

                                </p>


                                <hr />


                                <h5>

                                    Amount Paid

                                </h5>


                                <h2 className="text-success">

                                    ৳ {paidAmount.toFixed(2)}

                                </h2>

                            </div>

                        </div>

                    </div>


                    <hr />


                    {/* ==================================================
                        Refund Information
                    ================================================== */}

                    <div className="mt-4">


                        <h5>

                            Refund Information

                        </h5>


                        {/* Partial Payment */}

                        {

                            isPartialPayment

                            &&

                            (

                                <div className="alert alert-warning mb-0">

                                    <strong>

                                        Partial Payment Policy:

                                    </strong>

                                    {" "}

                                    This payment is
                                    non-refundable.

                                </div>

                            )

                        }


                        {/* Full Payment Refundable */}

                        {

                            isFullPayment

                            &&

                            refundEligible

                            &&

                            !payment.refund_status

                            &&

                            (

                                <div className="alert alert-success mb-0">

                                    <strong>

                                        Refund Available:

                                    </strong>

                                    {" "}

                                    This full payment may be
                                    eligible for refund according
                                    to hospital refund policy.

                                </div>

                            )

                        }


                        {/* Refund Status */}

                        {

                            payment.refund_status

                            &&

                            (

                                <div className="alert alert-light border mb-0">

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

                                                ৳ {
                                                    refundAmount
                                                        .toFixed(2)
                                                }

                                            </p>

                                        )

                                    }

                                </div>

                            )

                        }


                        {/* Full but not refundable */}

                        {

                            isFullPayment

                            &&

                            !refundEligible

                            &&

                            !payment.refund_status

                            &&

                            (

                                <div className="alert alert-secondary mb-0">

                                    Refund is currently
                                    unavailable for this payment.

                                </div>

                            )

                        }

                    </div>


                    <hr />


                    {/* ==================================================
                        Footer
                    ================================================== */}

                    <div className="text-center mt-4">


                        <p className="text-muted mb-0">

                            Thank you for using
                            Doctor Appointment System.

                        </p>


                        <small className="text-muted">

                            This is a
                            computer-generated invoice.

                        </small>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Actions
            ================================================== */}

            <div className="text-center mt-4 mb-5">


                <button

                    className="btn btn-success me-2"

                    onClick={() =>
                        window.print()
                    }

                >

                    🖨 Print / Save PDF

                </button>


                <Link

                    to={`/payments/${payment.id}`}

                    className="btn btn-secondary"

                >

                    Back to Payment Details

                </Link>

            </div>

        </div>

    );

}


export default PaymentInvoice;