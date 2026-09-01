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


    // ==========================================================
    // Load Diagnostic Bookings
    // ==========================================================

    const loadBookings = async () => {

        try {

            setLoading(true);


            const response =
                await getMyDiagnosticBookings();


            console.log(
                "Diagnostic Bookings API Response:",
                response
            );


            console.log(
                "Diagnostic Bookings Data:",
                response.data
            );


            // ======================================================
            // Handle DRF Pagination
            // ======================================================

            const bookingData =
                response.data?.results ||
                response.data ||
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
                                {bookings.length}
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

                        {bookings.length === 0 ? (

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


                                        {bookings.map(
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

                                                                    Paid

                                                                </span>

                                                            ) : (

                                                                <button
                                                                    type="button"
                                                                    className="payment-button"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/diagnostic-payment/${booking.id}`
                                                                        )
                                                                    }
                                                                >

                                                                    <FaCreditCard />

                                                                    <span>
                                                                        Pay Now
                                                                    </span>

                                                                </button>

                                                            )}

                                                        </td>


                                                        {/* =========================
                                                            Actions
                                                        ========================== */}

                                                        <td
                                                            className="action-column"
                                                        >

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


                </div>


            </div>

        </>

    );

}


export default MyDiagnosticBookings;