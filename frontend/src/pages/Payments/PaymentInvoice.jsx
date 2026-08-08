import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPaymentDetails } from "../../services/paymentService";

function PaymentInvoice() {

    const { id } = useParams();

    const [payment, setPayment] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {

        const loadPayment = async () => {

            try {

                const response =
                    await getPaymentDetails(id);

                const data =
                    response.data?.data ||
                    response.data;

                setPayment(data);

            } catch (error) {

                console.error(error);

                setError(
                    "Failed to load invoice."
                );

            } finally {

                setLoading(false);

            }

        };

        loadPayment();

    }, [id]);


    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (

            <div className="container mt-5 text-center">

                <h3>
                    Loading Invoice...
                </h3>

            </div>

        );

    }


    // ==========================================
    // Error
    // ==========================================

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

                    Invoice not found.

                </div>

            </div>

        );

    }


    return (

        <div className="container mt-5">

            {/* ======================================
                Invoice
            ====================================== */}

            <div
                id="invoice"
                className="card shadow mx-auto"
                style={{
                    maxWidth: "850px"
                }}
            >

                {/* Header */}

                <div className="card-header bg-primary text-white">

                    <div className="row align-items-center">

                        <div className="col-md-7">

                            <h2 className="mb-1">

                                Doctor Appointment System

                            </h2>

                            <p className="mb-0">

                                Medical Appointment & Payment

                            </p>

                        </div>

                        <div className="col-md-5 text-md-end">

                            <h3 className="mb-1">

                                INVOICE

                            </h3>

                            <p className="mb-0">

                                Invoice #INV-{payment.id}

                            </p>

                        </div>

                    </div>

                </div>


                {/* Invoice Body */}

                <div className="card-body p-4">

                    {/* Invoice Information */}

                    <div className="row mb-4">

                        <div className="col-md-6">

                            <h5>

                                Patient Information

                            </h5>

                            <p className="mb-1">

                                <strong>
                                    Name:
                                </strong>

                                {" "}

                                {payment.patient_name ||
                                    "N/A"}

                            </p>

                        </div>


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

                                {payment.payment_date
                                    ? new Date(
                                        payment.payment_date
                                    ).toLocaleDateString()
                                    : "N/A"}

                            </p>

                        </div>

                    </div>


                    <hr />


                    {/* Appointment */}

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

                                    <td>

                                        {payment.appointment_booking ||
                                            "N/A"}

                                    </td>

                                    <td>

                                        {payment.doctor_name ||
                                            "N/A"}

                                    </td>

                                    <td className="text-end">

                                        ৳ {payment.amount}

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>


                    {/* Payment Information */}

                    <div className="row mt-4">

                        <div className="col-md-6">

                            <h5>

                                Payment Information

                            </h5>

                            <p className="mb-1">

                                <strong>
                                    Method:
                                </strong>

                                {" "}

                                {payment.payment_method ||
                                    "N/A"}

                            </p>

                            <p className="mb-1">

                                <strong>
                                    Transaction ID:
                                </strong>

                                {" "}

                                {payment.transaction_id ||
                                    "N/A"}

                            </p>

                            <p className="mb-1">

                                <strong>
                                    Status:
                                </strong>

                                {" "}

                                {payment.payment_status ||
                                    "Pending"}

                            </p>

                        </div>


                        <div className="col-md-6">

                            <div className="text-md-end">

                                <h5>
                                    Total
                                </h5>

                                <h2 className="text-success">

                                    ৳ {payment.amount}

                                </h2>

                            </div>

                        </div>

                    </div>


                    <hr />


                    <div className="text-center mt-4">

                        <p className="text-muted mb-0">

                            Thank you for using
                            Doctor Appointment System.

                        </p>

                        <small className="text-muted">

                            This is a computer-generated invoice.

                        </small>

                    </div>

                </div>

            </div>


            {/* ======================================
                Actions
            ====================================== */}

            <div className="text-center mt-4 mb-5">

                <button
                    className="btn btn-success me-2"
                    onClick={() => window.print()}
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