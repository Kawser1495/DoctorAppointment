import {
    useState,
    useEffect,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    FaEye,
    FaFlask,
    FaCalendarAlt,
    FaCreditCard,
} from "react-icons/fa";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getMyDiagnosticBookings,
    cancelDiagnosticBooking,
    requestDiagnosticRefund,
} from "../../api/diagnosticBookingApi";

import "../../styles/myDiagnosticBookings.css";


function MyDiagnosticBookings() {

    const navigate = useNavigate();


    // ==========================================================
    // State
    // ==========================================================

    const [bookings, setBookings] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [cancellingId, setCancellingId] = useState(null);

    const [refundPaymentId, setRefundPaymentId] = useState(null);


    // ==========================================================
    // Load Diagnostic Bookings
    // ==========================================================

    const loadBookings = async () => {

        try {

            setLoading(true);


            const response =
                await getMyDiagnosticBookings();


            // ======================================================
            // Handle DRF Pagination
            // ======================================================

            const bookingData =
                response?.data?.results ||
                response?.data?.data ||
                response?.data ||
                [];


            if (Array.isArray(bookingData)) {

                setBookings(
                    bookingData
                );

            }

            else {

                setBookings([]);

            }

        }

        catch (error) {

            console.error(
                "Error loading diagnostic bookings:",
                error
            );


            console.error(
                "Backend Error:",
                error.response?.data
            );


            setBookings([]);

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================================
    // Load Data
    // ==========================================================

    useEffect(() => {

        loadBookings();

    }, []);


    // ==========================================================
    // Check Payment Status
    // ==========================================================

    const isBookingPaid = (booking) => {

        // ------------------------------------------------------
        // Direct payment status
        // ------------------------------------------------------

        const paymentStatus =
            String(
                booking?.payment_status || ""
            ).toLowerCase();


        if (
            paymentStatus === "paid" ||
            paymentStatus === "partially paid" ||
            paymentStatus === "completed" ||
            paymentStatus === "success" ||
            paymentStatus === "successful"
        ) {

            return true;

        }


        // ------------------------------------------------------
        // Boolean fields
        // ------------------------------------------------------

        if (
            booking?.is_paid === true ||
            booking?.paid === true
        ) {

            return true;

        }


        // ------------------------------------------------------
        // Payment object
        // ------------------------------------------------------

        const payment =
            booking?.payment;


        if (payment) {

            const status =
                String(
                    payment.status || ""
                ).toLowerCase();


            if (
                status === "paid" ||
                status === "completed" ||
                status === "success" ||
                status === "successful"
            ) {

                return true;

            }

        }


        return false;

    };

    const activeBookings = bookings.filter(
        (booking) => booking.status !== "Cancelled"
    );

    const hasSuccessfulPayment = (booking) => (
        ["paid", "partially paid"].includes(
            String(booking?.payment_status || "").toLowerCase()
        ) || booking?.is_paid === true
    );

    const getPaymentLabel = (booking) => (
        String(booking?.payment_status || "").toLowerCase() === "partially paid"
            ? "Partially Paid"
            : "Paid"
    );

    const monthlyBookings = Object.entries(
        bookings.reduce((months, booking) => {
            const monthKey = String(booking.booking_date || "").slice(0, 7);
            if (!monthKey) return months;
            months[monthKey] = months[monthKey] || [];
            months[monthKey].push(booking);
            return months;
        }, {})
    ).sort(([first], [second]) => second.localeCompare(first));

    const formatMonth = (monthKey) => new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const handleCancel = async (booking) => {
        if (!window.confirm("Cancel this diagnostic booking?")) return;
        try {
            setCancellingId(booking.id);
            await cancelDiagnosticBooking(booking.id);
            setBookings((current) => current.map((item) => (
                item.id === booking.id ? { ...item, status: "Cancelled" } : item
            )));
        } catch (error) {
            window.alert(error.response?.data?.message || "Unable to cancel this booking.");
        } finally {
            setCancellingId(null);
        }
    };

    const handleRefundRequest = async (booking) => {
        const reason = window.prompt("Why are you requesting a refund?", "Refund requested for diagnostic booking");
        if (reason === null) return;
        if (!reason.trim()) {
            window.alert("Please provide a refund reason.");
            return;
        }
        try {
            setRefundPaymentId(booking.refund_payment_id);
            await requestDiagnosticRefund(booking.refund_payment_id, reason.trim());
            setBookings((current) => current.map((item) => (
                item.id === booking.id
                    ? { ...item, can_request_refund: false, refund_request_status: "Pending" }
                    : item
            )));
            window.alert("Refund request sent to admin for review.");
        } catch (error) {
            window.alert(error.response?.data?.detail || "Unable to submit refund request.");
        } finally {
            setRefundPaymentId(null);
        }
    };


    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (

            <div>

                <Navbar />

                <div className="dashboard-container">

                    <Sidebar />

                    <div className="diagnostic-page">

                        <div className="diagnostic-loading">

                            Loading Diagnostic Bookings...

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================================
    // UI
    // ==========================================================

    return (

        <>

            <Navbar />


            <div className="dashboard-container">

                <Sidebar />


                <div className="diagnostic-page">


                    {/* ==================================================
                        Page Header
                    ================================================== */}

                    <div className="diagnostic-page-header">

                        <div>

                            <div className="page-title-row">

                                <div className="page-icon">

                                    <FaFlask />

                                </div>


                                <div>

                                    <h1>
                                        My Diagnostic Bookings
                                    </h1>

                                    <p>
                                        View your diagnostic test bookings
                                        and manage payments.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="booking-count">

                            <span>
                                Total Bookings
                            </span>


                            <strong>
                                {activeBookings.length}
                            </strong>

                        </div>

                    </div>


                    {/* ==================================================
                        Booking Card
                    ================================================== */}

                    <div className="diagnostic-booking-card">


                        <div className="booking-card-header">

                            <div>

                                <h2>
                                    Diagnostic Test History
                                </h2>

                                <p>
                                    All your diagnostic test bookings
                                </p>

                            </div>


                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate("/tests")
                                }
                            >
                                + Book New Test
                            </button>

                        </div>


                        {/* ==================================================
                            No Booking
                        ================================================== */}

                                {activeBookings.length === 0 ? (

                            <div className="no-diagnostic-booking">

                                <FaCalendarAlt />


                                <h3>
                                    No Diagnostic Bookings Found
                                </h3>


                                <p>
                                    You have not booked any diagnostic
                                    test yet.
                                </p>


                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate("/tests")
                                    }
                                >
                                    Book Diagnostic Test
                                </button>

                            </div>

                        ) : (


                            <div className="diagnostic-table-wrapper">


                                <table className="diagnostic-table">


                                    <thead>

                                        <tr>

                                            <th>
                                                Booking No.
                                            </th>

                                            <th>
                                                Test Name
                                            </th>

                                            <th>
                                                Category
                                            </th>

                                            <th>
                                                For
                                            </th>

                                            <th>
                                                Booking Date
                                            </th>

                                            <th>
                                                Booking Time
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Payment
                                            </th>

                                            <th className="action-column">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>


                                        {activeBookings.map(
                                            (booking) => {

                                                const paid =
                                                    isBookingPaid(
                                                        booking
                                                    );


                                                return (

                                                    <tr
                                                        key={
                                                            booking.id
                                                        }
                                                    >


                                                        {/* =========================
                                                            Booking Number
                                                        ========================== */}

                                                        <td>

                                                            <span className="booking-number">

                                                                {
                                                                    booking.booking_number ||
                                                                    `#${booking.id}`
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* =========================
                                                            Test Name
                                                        ========================== */}

                                                        <td>

                                                            <strong className="test-name">

                                                                {
                                                                    booking.diagnostic_test_name ||
                                                                    booking.test_name ||
                                                                    booking.diagnostic_test?.name ||
                                                                    "N/A"
                                                                }

                                                            </strong>

                                                        </td>


                                                        {/* =========================
                                                            Category
                                                        ========================== */}

                                                        <td>

                                                            <span className="category-badge">

                                                                {
                                                                    booking.category_name ||
                                                                    booking.diagnostic_test?.category_name ||
                                                                    booking.diagnostic_test?.category?.name ||
                                                                    "N/A"
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* =========================
                                                            For
                                                        ========================== */}

                                                        <td>

                                                            {
                                                                    booking.booking_person_name ||
                                                                    booking.family_member_name ||
                                                                booking.family_member?.name ||
                                                                "Self"
                                                            }

                                                        </td>


                                                        {/* =========================
                                                            Date
                                                        ========================== */}

                                                        <td>

                                                            {
                                                                booking.booking_date ||
                                                                "N/A"
                                                            }

                                                        </td>


                                                        {/* =========================
                                                            Time
                                                        ========================== */}

                                                        <td>

                                                            {
                                                                booking.booking_time ||
                                                                "N/A"
                                                            }

                                                        </td>


                                                        {/* =========================
                                                            Booking Status
                                                        ========================== */}

                                                        <td>

                                                            <span
                                                                className={
                                                                    `diagnostic-status ${
                                                                        String(
                                                                            booking.status || ""
                                                                        )
                                                                            .toLowerCase()
                                                                            .replace(
                                                                                /\s+/g,
                                                                                "-"
                                                                            )
                                                                    }`
                                                                }
                                                            >

                                                                {
                                                                    booking.status ||
                                                                    "Pending"
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* =========================
                                                            Payment
                                                        ========================== */}

                                                        <td>

                                                            {paid ? (
                                                                <span className="payment-paid-badge">
                                                                    {getPaymentLabel(booking)}
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    className="payment-button"
                                                                    onClick={() => navigate(`/diagnostic-payment/${booking.id}`)}
                                                                >
                                                                    <FaCreditCard />
                                                                    <span>Pay Now</span>
                                                                </button>
                                                            )}

                                                        </td>


                                                        {/* =========================
                                                            Actions
                                                        ========================== */}

                                                        <td className="action-column">
                                                            <div className="diagnostic-action-stack">

                                                            <button
                                                                type="button"
                                                                className="view-details-btn"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/my-diagnostic-bookings/${booking.id}`
                                                                    )
                                                                }
                                                            >

                                                                <FaEye />

                                                                <span>
                                                                    View Details
                                                                </span>

                                                            </button>

                                                            {booking.status !== "Completed" && !hasSuccessfulPayment(booking) && (
                                                                <button
                                                                    type="button"
                                                                    className="cancel-booking-btn"
                                                                    disabled={cancellingId === booking.id}
                                                                    onClick={() => handleCancel(booking)}
                                                                >
                                                                    {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                                                                </button>
                                                            )}

                                                            {booking.can_request_refund && booking.refund_payment_id && (
                                                                <button
                                                                    type="button"
                                                                    className="refund-booking-btn"
                                                                    disabled={refundPaymentId === booking.refund_payment_id}
                                                                    onClick={() => handleRefundRequest(booking)}
                                                                >
                                                                    {refundPaymentId === booking.refund_payment_id ? "Sending..." : "Request Refund"}
                                                                </button>
                                                            )}

                                                            {booking.refund_request_status === "Pending" && (
                                                                <span className="refund-request-status">Refund pending</span>
                                                            )}

                                                            </div>
                                                        </td>


                                                    </tr>

                                                );

                                            }
                                        )}


                                    </tbody>


                                </table>


                            </div>

                        )}


                    </div>

                    <details className="diagnostic-monthly-history">
                        <summary>
                            <strong>Monthly Diagnostic History</strong>
                            <span>{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                        </summary>
                        <div className="diagnostic-monthly-content">
                            {monthlyBookings.length === 0 ? (
                                <p>No diagnostic history yet.</p>
                            ) : monthlyBookings.map(([monthKey, monthItems]) => (
                                <details className="diagnostic-month" key={monthKey}>
                                    <summary>
                                        <span>{formatMonth(monthKey)}</span>
                                        <strong>{monthItems.length} Bookings</strong>
                                    </summary>
                                    <div className="diagnostic-month-list">
                                        {monthItems.map((booking) => (
                                            <div className="diagnostic-month-row" key={booking.id}>
                                                <span>{booking.booking_number}</span>
                                                <span>{booking.test_name || "Diagnostic Test"}</span>
                                                <span>{booking.booking_person_name || "Self"}</span>
                                                <span className={`diagnostic-status ${String(booking.status || "").toLowerCase()}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </details>


                </div>


            </div>

        </>

    );

}


export default MyDiagnosticBookings;