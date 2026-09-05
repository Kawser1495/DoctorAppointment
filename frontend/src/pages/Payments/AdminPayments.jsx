import {
    useEffect,
    useState,
} from "react";

import {

    getAdminPayments,

    updatePaymentStatus,
    refundPayment,

} from "../../services/paymentService";


function AdminPayments() {


    // ======================================================
    // State
    // ======================================================

    const [payments, setPayments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [updatingId, setUpdatingId] =
        useState(null);

    const [refundingId, setRefundingId] =
        useState(null);


    // ======================================================
    // Load Admin Payments
    // ======================================================

    const loadPayments =
        async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await getAdminPayments();


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

            }

            catch (error) {

                console.error(
                    "Admin Payment Error:",
                    error
                );


                if (
                    error.response?.status === 403
                ) {

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


    useEffect(

        () => {

            loadPayments();

        },

        []

    );


    // ======================================================
    // Update Payment Status
    // ======================================================

    const handleStatusUpdate =
        async (
            paymentId,
            newStatus
        ) => {

            try {

                setUpdatingId(
                    paymentId
                );


                const response =
                    await updatePaymentStatus(

                        paymentId,

                        newStatus

                    );


                console.log(

                    "Payment Status Updated:",

                    response.data

                );


                // ==========================================
                // Update Local State
                // ==========================================

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

                console.error(
                    "Status Update Error:",
                    error
                );


                const message =

                    error.response?.data?.message ||

                    "Failed to update payment status.";


                alert(
                    message
                );

            }

            finally {

                setUpdatingId(
                    null
                );

            }

        };

    const handleRefund = async (paymentId) => {
        if (!window.confirm("Refund this payment?")) {
            return;
        }

        try {
            setRefundingId(paymentId);
            await refundPayment(paymentId);

            setPayments((previousPayments) =>
                previousPayments.map((payment) =>
                    payment.id === paymentId
                        ? {
                            ...payment,
                            payment_status: "Refunded",
                            is_refundable: false,
                        }
                        : payment
                )
            );
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to refund payment."
            );
        } finally {
            setRefundingId(null);
        }
    };


    // ======================================================
    // Status Badge
    // ======================================================

    const getStatusClass =
        (status) => {

            switch (status) {

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

    const totalRevenue = payments
        .filter((payment) => payment.payment_status === "Paid")
        .reduce((total, payment) => total + Number(payment.amount || 0), 0);

    const pendingAmount = payments
        .filter((payment) => payment.payment_status === "Pending")
        .reduce((total, payment) => total + Number(payment.amount || 0), 0);


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="container mt-5">

                <div className="text-center">

                    <h3>

                        Loading Payments...

                    </h3>

                </div>

            </div>

        );

    }


    // ======================================================
    // Error
    // ======================================================

    if (error) {

        return (

            <div className="container mt-5">

                <div className="alert alert-danger">

                    {error}

                </div>

            </div>

        );

    }


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="container mt-5">


            {/* ==============================================
                Header
            ============================================== */}

            <div className="mb-4">

                <h2>

                    Payment Management

                </h2>


                <p className="text-muted">

                    Review and manage all patient payments.

                </p>

            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <small className="text-muted">Collected revenue</small>
                            <h3 className="fw-bold text-success mb-0">
                                BDT {totalRevenue.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <small className="text-muted">Pending amount</small>
                            <h3 className="fw-bold text-warning mb-0">
                                BDT {pendingAmount.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <small className="text-muted">Payment records</small>
                            <h3 className="fw-bold mb-0">
                                {payments.length.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>


            {/* ==============================================
                No Payments
            ============================================== */}

            {
                payments.length === 0

                    ? (

                        <div className="alert alert-info">

                            No payments found.

                        </div>

                    )

                    : (

                        <div className="table-responsive">

                            <table className="table table-bordered table-hover align-middle">


                                {/* ==================================
                                    Table Header
                                ================================== */}

                                <thead className="table-light">

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

                                            Mode

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

                                            Update Status

                                        </th>

                                        <th>

                                            Refund

                                        </th>

                                    </tr>

                                </thead>


                                {/* ==================================
                                    Table Body
                                ================================== */}

                                <tbody>

                                    {
                                        payments.map(

                                            (payment) => (

                                                <tr
                                                    key={
                                                        payment.id
                                                    }
                                                >

                                                    <td>

                                                        #
                                                        {
                                                            payment.id
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            payment.patient_name
                                                            || "N/A"
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            payment.appointment_booking
                                                            || "N/A"
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            payment.doctor_name
                                                            || "N/A"
                                                        }

                                                    </td>


                                                    <td>

                                                        <strong>

                                                            ৳
                                                            {" "}
                                                            {
                                                                payment.amount
                                                            }

                                                        </strong>

                                                    </td>

                                                    <td>

                                                        <span className="badge bg-info text-dark">
                                                            {payment.payment_mode || "Full"}
                                                        </span>

                                                    </td>


                                                    <td>

                                                        {
                                                            payment.payment_method
                                                            || "N/A"
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            payment.transaction_id
                                                            || "N/A"
                                                        }

                                                    </td>


                                                    {/* Status */}

                                                    <td>

                                                        <span
                                                            className={
                                                                `badge ${
                                                                    getStatusClass(
                                                                        payment.payment_status
                                                                    )
                                                                }`
                                                            }
                                                        >

                                                            {
                                                                payment.payment_status
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* Update */}

                                                    <td>

                                                        <select

                                                            className="form-select form-select-sm"

                                                            value={
                                                                payment.payment_status
                                                            }

                                                            disabled={
                                                                updatingId ===
                                                                payment.id
                                                            }

                                                            onChange={
                                                                (event) =>

                                                                    handleStatusUpdate(

                                                                        payment.id,

                                                                        event.target.value

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


                                                        </select>

                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            disabled={
                                                                !payment.is_refundable ||
                                                                refundingId === payment.id
                                                            }
                                                            onClick={() =>
                                                                handleRefund(payment.id)
                                                            }
                                                        >
                                                            {refundingId === payment.id
                                                                ? "Refunding..."
                                                                : payment.is_refundable
                                                                    ? "Refund"
                                                                    : "Unavailable"}
                                                        </button>
                                                    </td>

                                                </tr>

                                            )

                                        )
                                    }

                                </tbody>

                            </table>

                        </div>

                    )

            }

        </div>

    );

}


export default AdminPayments;