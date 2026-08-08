import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPaymentDetails } from "../../services/paymentService";

function PaymentReceipt() {

    const { id } = useParams();

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

                if (error.response?.status === 404) {

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


    if (!payment) {

        return (

            <div className="container mt-5">

                <div className="alert alert-warning">

                    Payment information not available.

                </div>

            </div>

        );

    }


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


                <div className="card-body p-4">


                    {/* ==================================================
                        Payment Status
                    ================================================== */}

                    <div className="text-center mb-4">

                        <span
                            className={`badge ${
                                payment.payment_status
                                    ?.toLowerCase()
                                    .replace(
                                        /\s+/g,
                                        "-"
                                    )
                            } fs-6`}
                        >

                            {payment.payment_status ||
                                "Pending"}

                        </span>

                    </div>


                    {/* ==================================================
                        Receipt Information
                    ================================================== */}

                    <div className="row mb-4">

                        <div className="col-md-6">

                            <p className="mb-2">

                                <strong>
                                    Receipt ID:
                                </strong>{" "}

                                #{payment.id}

                            </p>

                            <p className="mb-2">

                                <strong>
                                    Transaction ID:
                                </strong>{" "}

                                {payment.transaction_id ||
                                    "N/A"}

                            </p>

                            <p className="mb-2">

                                <strong>
                                    Payment Date:
                                </strong>{" "}

                                {payment.payment_date

                                    ? new Date(
                                        payment.payment_date
                                    ).toLocaleString()

                                    : "N/A"}

                            </p>

                        </div>


                        <div className="col-md-6">

                            <p className="mb-2">

                                <strong>
                                    Payment Method:
                                </strong>{" "}

                                {payment.payment_method ||
                                    "N/A"}

                            </p>

                            <p className="mb-2">

                                <strong>
                                    Booking Number:
                                </strong>{" "}

                                {payment.appointment_booking ||
                                    "N/A"}

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

                            <p>

                                <strong>
                                    Patient Name:
                                </strong>{" "}

                                {payment.patient_name ||
                                    "N/A"}

                            </p>

                        </div>

                        <div className="col-md-6">

                            <p>

                                <strong>
                                    Doctor:
                                </strong>{" "}

                                {payment.doctor_name ||
                                    "N/A"}

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

                        <table className="table table-bordered">

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

                                <tr>

                                    <td>
                                        Doctor Consultation
                                    </td>

                                    <td className="text-end">

                                        ৳ {payment.amount}

                                    </td>

                                </tr>

                                <tr>

                                    <th>
                                        Total Paid
                                    </th>

                                    <th className="text-end text-success">

                                        ৳ {payment.amount}

                                    </th>

                                </tr>

                            </tbody>

                        </table>

                    </div>


                    {/* ==================================================
                        Footer
                    ================================================== */}

                    <div className="text-center mt-5">

                        <p className="text-muted mb-1">

                            Thank you for using our service.

                        </p>

                        <small className="text-muted">

                            This is a computer-generated payment receipt.

                        </small>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default PaymentReceipt;