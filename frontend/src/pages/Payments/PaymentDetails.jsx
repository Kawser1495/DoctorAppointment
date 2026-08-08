import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPaymentDetails } from "../../services/paymentService";

function PaymentDetails() {

    const { id } = useParams();

    const [payment, setPayment] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================================
    // Load Payment Details
    // ==========================================================

    useEffect(() => {

        const loadPaymentDetails = async () => {

            try {

                setLoading(true);

                setError("");

                const response =
                    await getPaymentDetails(id);

                console.log(
                    "Payment Details:",
                    response.data
                );

                const data =
                    response.data?.data ||
                    response.data;

                setPayment(data);

            } catch (error) {

                console.error(
                    "Payment Details Error:",
                    error
                );

                if (error.response?.status === 404) {

                    setError(
                        "Payment not found."
                    );

                } else if (
                    error.response?.status === 401
                ) {

                    setError(
                        "Authentication required. Please login again."
                    );

                } else {

                    setError(
                        "Failed to load payment details."
                    );

                }

            } finally {

                setLoading(false);

            }

        };

        loadPaymentDetails();

    }, [id]);


    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (

            <div className="container mt-5">

                <div className="text-center">

                    <h3>
                        Loading Payment Details...
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
                    Back to Payment History
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

                    Payment information not found.

                </div>

                <Link
                    to="/payments"
                    className="btn btn-primary"
                >
                    Back to Payment History
                </Link>

            </div>

        );

    }


    // ==========================================================
    // Payment Details
    // ==========================================================

    return (

        <div className="container mt-5">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2>
                        Payment Details
                    </h2>

                    <p className="text-muted mb-0">

                        Complete information about your payment.

                    </p>

                </div>

                <Link
                    to="/payments"
                    className="btn btn-secondary"
                >
                    Back
                </Link>

            </div>


            {/* ==================================================
                Payment Card
            ================================================== */}

            <div className="card shadow-sm">

                <div className="card-header bg-primary text-white">

                    <h4 className="mb-0">

                        Payment Information

                    </h4>

                </div>


                <div className="card-body">

                    {/* ==================================================
                        Payment Information
                    ================================================== */}

                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <strong>
                                Payment ID
                            </strong>

                            <p className="mb-0">

                                #{payment.id}

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Booking Number
                            </strong>

                            <p className="mb-0">

                                {payment.appointment_booking ||
                                    "N/A"}

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Doctor
                            </strong>

                            <p className="mb-0">

                                {payment.doctor_name ||
                                    "N/A"}

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Patient
                            </strong>

                            <p className="mb-0">

                                {payment.patient_name ||
                                    "N/A"}

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Amount
                            </strong>

                            <p className="mb-0 text-success fw-bold">

                                ৳ {payment.amount}

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Payment Method
                            </strong>

                            <p className="mb-0">

                                {payment.payment_method ||
                                    "N/A"}

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Transaction ID
                            </strong>

                            <p className="mb-0">

                                {payment.transaction_id ||
                                    "N/A"}

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Payment Status
                            </strong>

                            <p className="mb-0">

                                <span
                                    className={`badge ${
                                        payment.payment_status
                                            ?.toLowerCase()
                                            .replace(
                                                /\s+/g,
                                                "-"
                                            )
                                    }`}
                                >

                                    {payment.payment_status ||
                                        "Pending"}

                                </span>

                            </p>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Payment Date
                            </strong>

                            <p className="mb-0">

                                {payment.payment_date

                                    ? new Date(
                                        payment.payment_date
                                    ).toLocaleString()

                                    : "N/A"}

                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Bottom Actions
            ================================================== */}

            <div className="mt-4 d-flex gap-2">

                <Link
                    to="/payments"
                    className="btn btn-primary"
                >
                    Back to Payment History
                </Link>

                <Link
                    to={`/payments/${payment.id}/receipt`}
                    className="btn btn-success"
                >
                    🧾 View Receipt
                </Link>
                <Link
                    to={`/payments/${payment.id}/invoice`}
                    className="btn btn-warning"
                >
                    📄 View Invoice
                </Link>



            </div>

        </div>

    );

}

export default PaymentDetails;