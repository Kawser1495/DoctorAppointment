import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyPayments } from "../../services/paymentService";

function PaymentHistory() {

    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // ==========================================
    // Load My Payment History
    // ==========================================

    useEffect(() => {

        const loadPayments = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await getMyPayments();

                console.log(
                    "Payment History Response:",
                    response.data
                );

                /*
                    DRF pagination হলে:
                    response.data.results

                    Pagination না থাকলে:
                    response.data

                    কিছু API-তে data wrapper থাকলে:
                    response.data.data
                */

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

                    if (error.response.status === 401) {

                        setError(
                            "Authentication required. Please login again."
                        );

                    } else {

                        setError(
                            "Failed to load payment history."
                        );

                    }

                } else {

                    setError(
                        "Cannot connect to the server."
                    );

                }

            } finally {

                setLoading(false);

            }

        };

        loadPayments();

    }, []);

    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (

            <div className="container mt-5">

                <div className="text-center">

                    <h3>
                        Loading Payment History...
                    </h3>

                </div>

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

            </div>

        );

    }

    // ==========================================
    // Payment History
    // ==========================================

    return (

        <div className="container mt-5">

            {/* ==========================================
                Header
            ========================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2>
                        My Payment History
                    </h2>

                    <p className="text-muted mb-0">

                        View all your payment transactions.

                    </p>

                </div>

                <Link
                    to="/appointments"
                    className="btn btn-primary"
                >
                    My Appointments
                </Link>

            </div>

            {/* ==========================================
                No Payment
            ========================================== */}

            {payments.length === 0 ? (

                <div className="alert alert-info">

                    No payment history found.

                </div>

            ) : (

                <div className="table-responsive">

                    <table className="table table-bordered table-hover align-middle">

                        {/* ==========================================
                            Table Header
                        ========================================== */}

                        <thead className="table-light">

                            <tr>

                                <th>
                                    Booking
                                </th>

                                <th>
                                    Doctor
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Method
                                </th>

                                <th>
                                    Transaction ID
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Payment Date
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>

                        {/* ==========================================
                            Table Body
                        ========================================== */}

                        <tbody>

                            {payments.map((payment) => (

                                <tr
                                    key={payment.id}
                                >

                                    {/* Booking */}

                                    <td>

                                        {payment.appointment_booking
                                            || "N/A"}

                                    </td>

                                    {/* Doctor */}

                                    <td>

                                        {payment.doctor_name
                                            || "N/A"}

                                    </td>

                                    {/* Amount */}

                                    <td>

                                        <strong>

                                            ৳ {payment.amount}

                                        </strong>

                                    </td>

                                    {/* Payment Method */}

                                    <td>

                                        {payment.payment_method
                                            || "N/A"}

                                    </td>

                                    {/* Transaction ID */}

                                    <td>

                                        {payment.transaction_id
                                            || "N/A"}

                                    </td>

                                    {/* Status */}

                                    <td>

                                        <span
                                            className={
                                                `badge ${
                                                    payment.payment_status
                                                        ?.toLowerCase()
                                                        .replace(
                                                            /\s+/g,
                                                            "-"
                                                        )
                                                }`
                                            }
                                        >

                                            {payment.payment_status
                                                || "Pending"}

                                        </span>

                                    </td>

                                    {/* Payment Date */}

                                    <td>

                                        {payment.payment_date

                                            ? new Date(
                                                payment.payment_date
                                            ).toLocaleDateString()

                                            : "N/A"}

                                    </td>

                                    {/* Action */}

                                    <td>

                                        <Link
                                            to={`/payments/${payment.id}`}
                                            className="btn btn-sm btn-primary"
                                        >

                                            View

                                        </Link>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}

export default PaymentHistory;