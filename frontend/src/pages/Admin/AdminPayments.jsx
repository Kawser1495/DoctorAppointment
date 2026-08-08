import { useEffect, useState } from "react";

import {
    getAdminPayments,
    updatePaymentStatus,
} from "../../services/paymentService";


function AdminPayments() {

    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================================
    // Load All Payments
    // ==========================================================

    const loadPayments = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await getAdminPayments();

            const data =
                response.data.results ||
                response.data.data ||
                response.data;

            setPayments(data || []);

        }

        catch (error) {

            console.error(error);

            if (error.response?.status === 403) {

                setError(
                    "Admin access required."
                );

            }

            else {

                setError(
                    "Failed to load payments."
                );

            }

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================================
    // Load Payments on Page Load
    // ==========================================================

    useEffect(() => {

        loadPayments();

    }, []);


    // ==========================================================
    // Update Payment Status
    // ==========================================================

    const handleStatusChange = async (
        paymentId,
        newStatus
    ) => {

        try {

            await updatePaymentStatus(
                paymentId,
                newStatus
            );

            // Update UI immediately
            setPayments(
                (previousPayments) =>
                    previousPayments.map(
                        (payment) =>
                            payment.id === paymentId
                                ? {
                                    ...payment,
                                    payment_status:
                                        newStatus,
                                }
                                : payment
                    )
            );

            alert(
                "Payment status updated successfully."
            );

        }

        catch (error) {

            console.error(error);

            if (error.response?.status === 403) {

                alert(
                    "Admin access required."
                );

            }

            else {

                alert(
                    "Failed to update payment status."
                );

            }

        }

    };


    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (

            <div className="container mt-5">

                <h3>
                    Loading Payments...
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

            </div>

        );

    }


    // ==========================================================
    // UI
    // ==========================================================

    return (

        <div className="container mt-5">

            <div className="mb-4">

                <h2>
                    Admin Payment Management
                </h2>

                <p className="text-muted">

                    Manage patient payment transactions
                    and update payment status.

                </p>

            </div>


            {payments.length === 0 ? (

                <div className="alert alert-info">

                    No payments found.

                </div>

            ) : (

                <div className="table-responsive">

                    <table className="table table-bordered table-hover">

                        <thead className="table-dark">

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Patient
                                </th>

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
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {payments.map(
                                (payment) => (

                                    <tr
                                        key={
                                            payment.id
                                        }
                                    >

                                        <td>

                                            {
                                                payment.id
                                            }

                                        </td>


                                        <td>

                                            {
                                                payment.patient_name ||
                                                "N/A"
                                            }

                                        </td>


                                        <td>

                                            {
                                                payment.appointment_booking ||
                                                "N/A"
                                            }

                                        </td>


                                        <td>

                                            {
                                                payment.doctor_name ||
                                                "N/A"
                                            }

                                        </td>


                                        <td>

                                            ৳ {payment.amount}

                                        </td>


                                        <td>

                                            {
                                                payment.payment_method
                                            }

                                        </td>


                                        <td>

                                            {
                                                payment.transaction_id ||
                                                "N/A"
                                            }

                                        </td>


                                        <td>

                                            <span className="badge bg-secondary">

                                                {
                                                    payment.payment_status
                                                }

                                            </span>

                                        </td>


                                        <td>

                                            <select

                                                className="form-select form-select-sm"

                                                value={
                                                    payment.payment_status
                                                }

                                                onChange={(
                                                    event
                                                ) =>
                                                    handleStatusChange(
                                                        payment.id,
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }

                                            >

                                                <option value="Pending">
                                                    Pending
                                                </option>

                                                <option value="Paid">
                                                    Paid
                                                </option>

                                                <option value="Failed">
                                                    Failed
                                                </option>

                                                <option value="Refunded">
                                                    Refunded
                                                </option>

                                            </select>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}


export default AdminPayments;