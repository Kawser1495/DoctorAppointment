import "./DiagnosticTestBooking.css";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    bookDiagnosticTest,
    getDiagnosticTestDetails,
} from "../../services/diagnosticService";


function DiagnosticTestBooking() {

    // ======================================================
    // Router
    // ======================================================

    const { testId } = useParams();

    const navigate = useNavigate();


    // ======================================================
    // States
    // ======================================================

    const [test, setTest] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [bookingLoading, setBookingLoading] =
        useState(false);


    // Family Member
    const [familyMember, setFamilyMember] =
        useState("");


    // Booking Form
    const [bookingDate, setBookingDate] =
        useState("");

    const [bookingTime, setBookingTime] =
        useState("");

    const [notes, setNotes] =
        useState("");


    // ======================================================
    // Load Test Details
    // ======================================================

    useEffect(() => {

        const loadTestDetails = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await getDiagnosticTestDetails(
                        testId
                    );


                console.log(
                    "Diagnostic Test Details:",
                    response
                );


                setTest(response);

            }

            catch (err) {

                console.error(
                    "Diagnostic Test Details Error:",
                    err
                );


                console.error(
                    "Backend Error:",
                    err.response?.data
                );


                setError(
                    "Unable to load diagnostic test details."
                );

            }

            finally {

                setLoading(false);

            }

        };


        loadTestDetails();

    }, [testId]);


    // ======================================================
    // Format Price
    // ======================================================

    const formatPrice = (price) => {

        if (
            price === null ||
            price === undefined
        ) {

            return "0";

        }


        return Number(price).toLocaleString(
            "en-BD",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        );

    };


    // ======================================================
    // Get Today's Date
    // ======================================================

    const getTodayDate = () => {

        const today = new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;

    };


    // ======================================================
    // Submit Booking
    // ======================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!bookingDate) {

            alert(
                "Please select a booking date."
            );

            return;

        }


        if (!bookingTime) {

            alert(
                "Please select a preferred time."
            );

            return;

        }


        try {

            setBookingLoading(true);


            // ==================================================
            // Backend Booking Data
            // ==================================================

            const bookingData = {

                diagnostic_test: Number(testId),

                booking_date: bookingDate,

                booking_time: bookingTime,

            };


            // ==================================================
            // Family Member
            // ==================================================

            if (familyMember) {

                bookingData.family_member =
                    Number(familyMember);

            }


            /*
            ===================================================
            Add notes only if backend serializer accepts notes.
            ===================================================
            */

            // if (notes.trim()) {
            //
            //     bookingData.notes =
            //         notes.trim();
            //
            // }


            console.log(
                "Booking Data Sending:",
                bookingData
            );


            // ==================================================
            // API Request
            // ==================================================

            const response =
                await bookDiagnosticTest(
                    bookingData
                );


            console.log(
                "Booking Success:",
                response
            );


            alert(
                response?.message ||
                "Diagnostic test booked successfully!"
            );


            navigate("/diagnostics");

        }

        catch (err) {

            console.error(
                "Diagnostic Booking Error:",
                err
            );


            console.error(
                "Backend Error:",
                err.response?.data
            );


            let errorMessage =
                "Unable to book the diagnostic test. Please try again.";


            const errorData =
                err.response?.data;


            // ==================================================
            // Backend Validation Errors
            // ==================================================

            if (errorData) {

                if (errorData.diagnostic_test) {

                    errorMessage =
                        Array.isArray(
                            errorData.diagnostic_test
                        )
                            ? errorData.diagnostic_test[0]
                            : errorData.diagnostic_test;

                }

                else if (errorData.booking_date) {

                    errorMessage =
                        Array.isArray(
                            errorData.booking_date
                        )
                            ? errorData.booking_date[0]
                            : errorData.booking_date;

                }

                else if (errorData.booking_time) {

                    errorMessage =
                        Array.isArray(
                            errorData.booking_time
                        )
                            ? errorData.booking_time[0]
                            : errorData.booking_time;

                }

                else if (errorData.family_member) {

                    errorMessage =
                        Array.isArray(
                            errorData.family_member
                        )
                            ? errorData.family_member[0]
                            : errorData.family_member;

                }

                else if (errorData.non_field_errors) {

                    errorMessage =
                        Array.isArray(
                            errorData.non_field_errors
                        )
                            ? errorData.non_field_errors[0]
                            : errorData.non_field_errors;

                }

                else if (errorData.detail) {

                    errorMessage =
                        errorData.detail;

                }

                else {

                    const firstKey =
                        Object.keys(errorData)[0];


                    if (firstKey) {

                        const firstError =
                            errorData[firstKey];


                        errorMessage =
                            Array.isArray(firstError)
                                ? firstError[0]
                                : String(firstError);

                    }

                }

            }


            alert(errorMessage);

        }

        finally {

            setBookingLoading(false);

        }

    };


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="diagnostic-booking-page">

                <div className="booking-loading">

                    <div className="booking-spinner"></div>

                    <h3>
                        Loading Test Details...
                    </h3>

                    <p>
                        Please wait while we prepare your booking.
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // Error
    // ======================================================

    if (error) {

        return (

            <div className="diagnostic-booking-page">

                <div className="booking-error">

                    <div className="booking-error-icon">
                        ⚠
                    </div>

                    <h3>
                        Something Went Wrong
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/diagnostics")
                        }
                    >
                        ← Back to Tests
                    </button>

                </div>

            </div>

        );

    }


    // ======================================================
    // Main UI
    // ======================================================

    return (

        <div className="diagnostic-booking-page">


            {/* ==============================================
                Header
            =============================================== */}

            <section className="booking-header">

                <div className="booking-header-content">

                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate("/diagnostics")
                        }
                    >
                        ← Back to Diagnostic Tests
                    </button>


                    <div className="booking-badge">

                        🧪 DIAGNOSTIC BOOKING

                    </div>


                    <h1>
                        Book Your Diagnostic Test
                    </h1>


                    <p>
                        Select your preferred date and time
                        to book your laboratory test online.
                    </p>

                </div>

            </section>


            {/* ==============================================
                Main Content
            =============================================== */}

            <main className="booking-container">


                <div className="booking-layout">


                    {/* ==========================================
                        Test Information
                    =========================================== */}

                    <aside className="test-summary-card">


                        <div className="test-summary-header">

                            <div className="test-summary-icon">
                                🧪
                            </div>

                            <span>
                                SELECTED TEST
                            </span>

                        </div>


                        <h2>
                            {test?.name}
                        </h2>


                        <div className="test-category-badge">

                            {test?.category_name || "Diagnostic Test"}

                        </div>


                        {test?.description && (

                            <p className="test-summary-description">

                                {test.description}

                            </p>

                        )}


                        <div className="summary-divider"></div>


                        <div className="summary-details">


                            <div className="summary-detail">

                                <div className="summary-detail-icon">
                                    💰
                                </div>

                                <div>

                                    <span>
                                        Test Fee
                                    </span>

                                    <strong>
                                        ৳{formatPrice(test?.price)}
                                    </strong>

                                </div>

                            </div>


                            {test?.duration && (

                                <div className="summary-detail">

                                    <div className="summary-detail-icon">
                                        ⏱
                                    </div>

                                    <div>

                                        <span>
                                            Duration
                                        </span>

                                        <strong>
                                            {test.duration}
                                        </strong>

                                    </div>

                                </div>

                            )}

                        </div>


                        {test?.preparation && (

                            <div className="preparation-info">

                                <div className="preparation-title">

                                    <span>
                                        ℹ
                                    </span>

                                    <strong>
                                        Preparation Instructions
                                    </strong>

                                </div>

                                <p>
                                    {test.preparation}
                                </p>

                            </div>

                        )}


                        <div className="secure-booking-info">

                            <span>
                                🔒
                            </span>

                            <p>
                                Your booking information is secure
                                and protected.
                            </p>

                        </div>

                    </aside>


                    {/* ==========================================
                        Booking Form Card
                    =========================================== */}

                    <section className="booking-form-card">


                        <div className="form-card-header">

                            <div>

                                <span>
                                    BOOKING DETAILS
                                </span>

                                <h2>
                                    Choose Your Preferred Schedule
                                </h2>

                                <p>
                                    Fill in the information below
                                    to confirm your booking.
                                </p>

                            </div>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="booking-form"
                        >


                            {/* Date + Time */}

                            <div className="form-row">


                                {/* Booking Date */}

                                <div className="form-group">

                                    <label htmlFor="bookingDate">

                                        <span>
                                            📅
                                        </span>

                                        Booking Date *

                                    </label>


                                    <input
                                        id="bookingDate"
                                        type="date"
                                        value={bookingDate}
                                        min={getTodayDate()}
                                        onChange={(event) =>
                                            setBookingDate(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                {/* Booking Time */}

                                <div className="form-group">

                                    <label htmlFor="bookingTime">

                                        <span>
                                            🕐
                                        </span>

                                        Preferred Time *

                                    </label>


                                    <input
                                        id="bookingTime"
                                        type="time"
                                        value={bookingTime}
                                        onChange={(event) =>
                                            setBookingTime(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* Family Member */}

                            <div className="form-group">

                                <label htmlFor="familyMember">

                                    <span>
                                        👤
                                    </span>

                                    Book For

                                </label>


                                <select
                                    id="familyMember"
                                    value={familyMember}
                                    onChange={(event) =>
                                        setFamilyMember(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Myself
                                    </option>

                                </select>


                                <small className="form-help">

                                    You can select a family member
                                    when family member options are
                                    available.

                                </small>

                            </div>


                            {/* Notes */}

                            <div className="form-group">

                                <label htmlFor="notes">

                                    <span>
                                        📝
                                    </span>

                                    Additional Notes

                                    <small>
                                        Optional
                                    </small>

                                </label>


                                <textarea
                                    id="notes"
                                    rows="6"
                                    value={notes}
                                    placeholder="Write any additional information or special requirements..."
                                    onChange={(event) =>
                                        setNotes(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* Booking Notice */}

                            <div className="booking-notice">

                                <span>
                                    ℹ
                                </span>

                                <p>
                                    Please review your selected date
                                    and time carefully before
                                    confirming the booking.
                                </p>

                            </div>


                            {/* Buttons */}

                            <div className="booking-actions">

                                <button
                                    type="button"
                                    className="cancel-booking-button"
                                    disabled={bookingLoading}
                                    onClick={() =>
                                        navigate("/diagnostics")
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="confirm-booking-button"
                                    disabled={bookingLoading}
                                >

                                    {bookingLoading ? (

                                        <>
                                            <span className="button-spinner"></span>
                                            Booking...
                                        </>

                                    ) : (

                                        <>
                                            Confirm Booking
                                            <span>
                                                →
                                            </span>
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </section>

                </div>

            </main>

        </div>

    );

}


export default DiagnosticTestBooking;