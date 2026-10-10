import {
    useState,
    useEffect,
} from "react";

import {
    useParams,
    useNavigate,
} from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getDiagnosticBookingDetails,
} from "../../api/diagnosticBookingApi";

import "../../styles/diagnosticBookingDetails.css";


function DiagnosticBookingDetails() {

    const { id } =
        useParams();

    const navigate =
        useNavigate();


    const [booking, setBooking] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    // ======================================================
    // Load Booking Details
    // ======================================================

    useEffect(() => {

        const loadBookingDetails =
            async () => {

                try {

                    setLoading(true);


                    const response =
                        await getDiagnosticBookingDetails(
                            id
                        );


                    console.log(
                        "Diagnostic Booking Details:",
                        response.data
                    );


                    setBooking(
                        response.data?.data ||
                        response.data
                    );

                }

                catch (error) {

                    console.error(
                        "Error loading booking details:",
                        error
                    );

                }

                finally {

                    setLoading(false);

                }

            };


        loadBookingDetails();

    }, [id]);


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div>

                <Navbar />

                <div className="dashboard-container">

                    <Sidebar />

                    <div className="booking-details-page">

                        <h3>
                            Loading Booking Details...
                        </h3>

                    </div>

                </div>

            </div>

        );

    }


    // ======================================================
    // No Booking
    // ======================================================

    if (!booking) {

        return (

            <div>

                <Navbar />

                <div className="dashboard-container">

                    <Sidebar />

                    <div className="booking-details-page">

                        <h3>
                            Booking not found.
                        </h3>

                        <button
                            onClick={() =>
                                navigate(
                                    "/my-diagnostic-bookings"
                                )
                            }
                        >
                            Back to My Bookings
                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // ======================================================
    // UI
    // ======================================================

    return (

        <>

            <Navbar />

            <div className="dashboard-container">

                <Sidebar />

                <div className="booking-details-page">


                    {/* ===================================== */}
                    {/* Page Header */}
                    {/* ===================================== */}

                    <div className="booking-details-header">

                        <div>

                            <h2>
                                Diagnostic Booking Details
                            </h2>

                            <p>
                                View your diagnostic test booking information
                            </p>

                        </div>


                        <button
                            className="back-button"
                            onClick={() =>
                                navigate(
                                    "/my-diagnostic-bookings"
                                )
                            }
                        >
                            ← Back
                        </button>

                    </div>

                    {(booking.diagnostic_result || booking.prescription || booking.report_file_url) && <div className="booking-details-card diagnostic-result-card">
                        <h3>Diagnostic Test Result</h3>
                        {booking.diagnostic_result && <div className="details-row">
                            <span>Result</span>
                            <strong>{booking.diagnostic_result}</strong>
                        </div>}
                        {booking.prescription && <div className="details-row">
                            <span>Prescription</span>
                            <strong>{booking.prescription}</strong>
                        </div>}
                        {booking.report_file_url && <a className="view-details-btn" href={booking.report_file_url} target="_blank" rel="noreferrer">
                            View Result File
                        </a>}
                    </div>}


                    {/* ===================================== */}
                    {/* Booking Details Card */}
                    {/* ===================================== */}

                    <div className="booking-details-card">


                        <div className="details-row">

                            <span>
                                Booking Number
                            </span>

                            <strong>
                                {booking.booking_number}
                            </strong>

                        </div>


                        <div className="details-row">

                            <span>
                                Test Name
                            </span>

                            <strong>
                                {booking.diagnostic_test?.name ||
                                    booking.test_name ||
                                    "N/A"}
                            </strong>

                        </div>


                        <div className="details-row">

                            <span>
                                Category
                            </span>

                            <strong>
                                {booking.diagnostic_test?.category?.name ||
                                    booking.category_name ||
                                    "N/A"}
                            </strong>

                        </div>


                        <div className="details-row">

                            <span>
                                Booking Date
                            </span>

                            <strong>
                                {booking.booking_date}
                            </strong>

                        </div>


                        <div className="details-row">

                            <span>
                                Booking Time
                            </span>

                            <strong>
                                {booking.booking_time}
                            </strong>

                        </div>

                        <div className="details-row report-availability-row">
                            <span>Report Expected</span>
                            <strong>
                                {!booking.is_paid && booking.payment_status !== "Paid"
                                    ? "Available after payment"
                                    : booking.report_available_at
                                    ? new Date(booking.report_available_at).toLocaleString([], {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })
                                    : "Will be updated by the diagnostic centre"}
                            </strong>
                        </div>

                        {booking.is_paid && booking.report_available_note && <div className="details-row">
                            <span>Centre Note</span>
                            <strong>{booking.report_available_note}</strong>
                        </div>}


                        <div className="details-row">

                            <span>
                                Patient
                            </span>

                            <strong>
                                {booking.family_member?.name ||
                                    booking.family_member_name ||
                                    "Self"}
                            </strong>

                        </div>


                        <div className="details-row">

                            <span>
                                Status
                            </span>

                            <span
                                className={
                                    `booking-status ${
                                        booking.status
                                            ?.toLowerCase()
                                    }`
                                }
                            >
                                {booking.status}
                            </span>

                        </div>


                    </div>


                    {/* ===================================== */}
                    {/* Payment Section */}
                    {/* ===================================== */}

                    <div className="diagnostic-payment-section">

                        <h3>
                            Payment
                        </h3>

                        <p>
                            {booking.is_paid
                                ? "Your payment is complete. The report availability time is set by the diagnostic centre."
                                : "Complete your payment for this diagnostic test to begin report processing."}
                        </p>


                        {!booking.is_paid && <button
                            className="pay-now-button"
                            onClick={() =>
                                navigate(
                                    `/diagnostic-payment/${booking.id}`
                                )
                            }
                        >
                            Pay Now
                        </button>}

                    </div>


                </div>

            </div>

        </>

    );

}


export default DiagnosticBookingDetails;