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
} from "react-icons/fa";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getMyDiagnosticBookings,
} from "../../api/diagnosticBookingApi";

import "../../styles/myDiagnosticBookings.css";


function MyDiagnosticBookings() {

    const navigate = useNavigate();

    const [bookings, setBookings] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    // ============================================
    // Load Diagnostic Bookings
    // ============================================

    const loadBookings = async () => {

        try {

            setLoading(true);

            const response =
                await getMyDiagnosticBookings();


            console.log(
                "Diagnostic Bookings:",
                response.data
            );


            const bookingData =
                response.data?.results ||
                response.data ||
                [];


            setBookings(bookingData);

        }

        catch (error) {

            console.error(
                "Error loading diagnostic bookings:",
                error
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ============================================
    // Load Data
    // ============================================

    useEffect(() => {

        loadBookings();

    }, []);


    // ============================================
    // Loading
    // ============================================

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


    // ============================================
    // UI
    // ============================================

    return (

        <>

            <Navbar />

            <div className="dashboard-container">

                <Sidebar />


                <div className="diagnostic-page">


                    {/* =====================================
                        Page Header
                    ===================================== */}

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
                                        View your diagnostic test booking
                                        details and payment status.
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


                    {/* =====================================
                        Booking Table Card
                    ===================================== */}

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

                        </div>


                        {/* =====================================
                            No Booking
                        ===================================== */}

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

                                            <th className="action-column">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>


                                        {bookings.map(
                                            (booking) => (

                                                <tr
                                                    key={booking.id}
                                                >


                                                    {/* Booking Number */}

                                                    <td>

                                                        <span className="booking-number">

                                                            {
                                                                booking.booking_number
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* Test Name */}

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


                                                    {/* Category */}

                                                    <td>

                                                        <span className="category-badge">

                                                            {
                                                                booking.category_name ||
                                                                booking.diagnostic_test?.category?.name ||
                                                                "N/A"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* Family / Self */}

                                                    <td>

                                                        {
                                                            booking.family_member_name ||
                                                            booking.family_member?.name ||
                                                            "Self"
                                                        }

                                                    </td>


                                                    {/* Date */}

                                                    <td>

                                                        {
                                                            booking.booking_date
                                                        }

                                                    </td>


                                                    {/* Time */}

                                                    <td>

                                                        {
                                                            booking.booking_time
                                                        }

                                                    </td>


                                                    {/* Status */}

                                                    <td>

                                                        <span
                                                            className={
                                                                `diagnostic-status ${
                                                                    booking.status
                                                                        ?.toLowerCase()
                                                                        .replace(
                                                                            " ",
                                                                            "-"
                                                                        )
                                                                }`
                                                            }
                                                        >

                                                            {
                                                                booking.status
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* Action */}

                                                    <td
                                                        className="action-column"
                                                    >

                                                        <button

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

                                            )
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