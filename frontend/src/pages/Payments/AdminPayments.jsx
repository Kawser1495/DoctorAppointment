import {
    useEffect,
    useState,
} from "react";

import {

    getAdminPayments,

    updatePaymentStatus,

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


                                                            <option value="Refunded">

                                                                Refunded

                                                            </option>

                                                        </select>

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