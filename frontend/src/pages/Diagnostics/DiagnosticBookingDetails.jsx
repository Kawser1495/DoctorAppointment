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
                            Complete your payment for this diagnostic test.
                        </p>


                        <button
                            className="pay-now-button"
                            onClick={() =>
                                navigate(
                                    `/diagnostic-payment/${booking.id}`
                                )
                            }
                        >
                            Pay Now
                        </button>

                    </div>


                </div>

            </div>

        </>

    );

}


export default DiagnosticBookingDetails;