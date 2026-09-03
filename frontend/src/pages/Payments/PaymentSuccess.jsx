import {
    Link,
    useLocation,
    Navigate,
} from "react-router-dom";


function PaymentSuccess() {

    const location =
        useLocation();


    const payment =
        location.state?.payment;


    const appointment =
        location.state?.appointment;


    const diagnosticBooking =
        location.state?.diagnosticBooking;


    // ======================================================
    // Direct URL Access
    // ======================================================

    if (
        !payment ||
        (
            !appointment &&
            !diagnosticBooking
        )
    ) {

        return (

            <Navigate
                to="/payments"
                replace
            />

        );

    }


    // ======================================================
    // Payment Status
    // ======================================================

    const paymentStatus =
        payment.payment_status ||
        "Pending";


    const isPaid =
        paymentStatus === "Paid";


    const isDiagnosticPayment =
        !!diagnosticBooking;


    return (

        <div className="container mt-5">

            <div className="card shadow">

                <div className="card-body text-center">


                    {/* ======================================
                        Payment Status
                    ====================================== */}

                    {isPaid ? (

                        <>

                            <h1 className="text-success mb-3">

                                ✅ Payment Successful

                            </h1>

                            <p className="lead">

                                Your payment has been
                                successfully verified.

                            </p>

                        </>

                    ) : (

                        <>

                            <h1 className="text-warning mb-3">

                                ⏳ Payment Submitted

                            </h1>

                            <p className="lead">

                                Your payment information has
                                been submitted successfully.

                            </p>

                            <div className="alert alert-warning">

                                Your payment is currently
                                pending verification by the
                                administrator.

                            </div>

                        </>

                    )}


                    <hr />


                    {/* ======================================
                        Appointment Payment
                    ====================================== */}

                    {
                        !isDiagnosticPayment && (

                            <div className="text-start">

                                <h5>

                                    Appointment Information

                                </h5>


                                <p>

                                    <strong>
                                        Booking Number:
                                    </strong>

                                    {" "}

                                    {
                                        appointment?.booking_number
                                        || "N/A"
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Doctor:
                                    </strong>

                                    {" "}

                                    {
                                        appointment?.doctor_name
                                        || "N/A"
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Department:
                                    </strong>

                                    {" "}

                                    {
                                        appointment?.department_name
                                        ||
                                        appointment?.department
                                        ||
                                        "N/A"
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Date:
                                    </strong>

                                    {" "}

                                    {
                                        appointment?.appointment_date
                                        || "N/A"
                                    }

                                </p>

                            </div>

                        )

                    }


                    {/* ======================================
                        Diagnostic Payment
                    ====================================== */}

                    {
                        isDiagnosticPayment && (

                            <div className="text-start">

                                <h5>

                                    Diagnostic Booking Information

                                </h5>


                                <p>

                                    <strong>
                                        Booking Number:
                                    </strong>

                                    {" "}

                                    {
                                        diagnosticBooking?.booking_number
                                        || "N/A"
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Test:
                                    </strong>

                                    {" "}

                                    {
                                        diagnosticBooking?.test_name
                                        ||
                                        diagnosticBooking?.diagnostic_test_name
                                        ||
                                        diagnosticBooking?.diagnostic_test?.name
                                        ||
                                        "Diagnostic Test"
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Category:
                                    </strong>

                                    {" "}

                                    {
                                        diagnosticBooking?.category_name
                                        ||
                                        diagnosticBooking?.diagnostic_test
                                            ?.category?.name
                                        ||
                                        "N/A"
                                    }

                                </p>

                            </div>

                        )

                    }


                    <hr />


                    {/* ======================================
                        Payment Information
                    ====================================== */}

                    <div className="text-start">

                        <h5>

                            Payment Information

                        </h5>


                        <p>

                            <strong>
                                Payment ID:
                            </strong>

                            {" "}

                            #{payment.id}

                        </p>


                        <p>

                            <strong>
                                Payment Type:
                            </strong>

                            {" "}

                            {
                                payment.payment_type
                                || (
                                    isDiagnosticPayment
                                        ? "Diagnostic Test"
                                        : "Appointment"
                                )
                            }

                        </p>


                        <p>

                            <strong>
                                Payment Mode:
                            </strong>

                            {" "}

                            {
                                payment.payment_mode
                                || "N/A"
                            }

                        </p>


                        <p>

                            <strong>
                                Amount:
                            </strong>

                            {" "}

                            ৳ {payment.amount}

                        </p>


                        <p>

                            <strong>
                                Transaction ID:
                            </strong>

                            {" "}

                            {
                                payment.transaction_id
                                || "N/A"
                            }

                        </p>


                        <p>

                            <strong>
                                Payment Method:
                            </strong>

                            {" "}

                            {
                                payment.payment_method
                                || "N/A"
                            }

                        </p>


                        <p>

                            <strong>
                                Status:
                            </strong>

                            {" "}

                            <span

                                className={

                                    `badge ${

                                        paymentStatus === "Paid"

                                            ? "bg-success"

                                            : paymentStatus === "Failed"

                                            ? "bg-danger"

                                            : paymentStatus === "Refunded"

                                            ? "bg-secondary"

                                            : "bg-warning text-dark"

                                    }`

                                }

                            >

                                {paymentStatus}

                            </span>

                        </p>

                    </div>


                    {/* ======================================
                        Actions
                    ====================================== */}

                    <div className="mt-4">


                        <Link

                            to={`/payments/${payment.id}`}

                            className="btn btn-primary me-2"

                        >

                            View Payment

                        </Link>


                        <Link

                            to="/payments"

                            className="btn btn-secondary me-2"

                        >

                            Payment History

                        </Link>


                        <Link

                            to={

                                isDiagnosticPayment

                                    ? "/my-diagnostic-bookings"

                                    : "/appointments"

                            }

                            className="btn btn-success"

                        >

                            {

                                isDiagnosticPayment

                                    ? "My Diagnostic Bookings"

                                    : "My Appointments"

                            }

                        </Link>


                    </div>

                </div>

            </div>

        </div>

    );

}


export default PaymentSuccess;