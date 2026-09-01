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

import {
    fetchFamilyMembers,
} from "../../services/patientService";


function DiagnosticTestBooking() {

    // ======================================================
    // Router
    // ======================================================

    const { testId } = useParams();

    const navigate = useNavigate();


    // ======================================================
    // Test States
    // ======================================================

    const [test, setTest] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [bookingLoading, setBookingLoading] =
        useState(false);


    // ======================================================
    // Family Member States
    // ======================================================

    const [familyMembers, setFamilyMembers] =
        useState([]);

    const [familyMembersLoading, setFamilyMembersLoading] =
        useState(false);

    const [familyMember, setFamilyMember] =
        useState("");


    // ======================================================
    // Booking Form States
    // ======================================================

    const [bookingDate, setBookingDate] =
        useState("");

    const [bookingTime, setBookingTime] =
        useState("");

    const [notes, setNotes] =
        useState("");


    // ======================================================
    // Load Diagnostic Test Details
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


        if (testId) {

            loadTestDetails();

        }

    }, [testId]);


    // ======================================================
    // Load Family Members
    // ======================================================

    useEffect(() => {

        const loadFamilyMembers = async () => {

            try {

                setFamilyMembersLoading(true);


                const response =
                    await fetchFamilyMembers();


                console.log(
                    "Diagnostic Family Members:",
                    response
                );


                /*
                ==================================================
                fetchFamilyMembers() may return:

                1. Axios response
                   {
                       data: {
                           count: 1,
                           results: [...]
                       }
                   }

                2. Direct API data
                   {
                       count: 1,
                       results: [...]
                   }

                3. Direct array
                   [...]
                ==================================================
                */


                let members = [];


                // ----------------------------------------------
                // Axios response + DRF pagination
                // ----------------------------------------------

                if (
                    Array.isArray(
                        response?.data?.results
                    )
                ) {

                    members =
                        response.data.results;

                }


                // ----------------------------------------------
                // Axios response + direct array
                // ----------------------------------------------

                else if (
                    Array.isArray(
                        response?.data
                    )
                ) {

                    members =
                        response.data;

                }


                // ----------------------------------------------
                // Direct DRF pagination object
                // ----------------------------------------------

                else if (
                    Array.isArray(
                        response?.results
                    )
                ) {

                    members =
                        response.results;

                }


                // ----------------------------------------------
                // Direct array
                // ----------------------------------------------

                else if (
                    Array.isArray(response)
                ) {

                    members =
                        response;

                }


                console.log(
                    "Parsed Family Members:",
                    members
                );


                setFamilyMembers(
                    members
                );

            }

            catch (err) {

                console.error(
                    "Family Members Loading Error:",
                    err
                );


                console.error(
                    "Backend Error:",
                    err.response?.data
                );


                /*
                --------------------------------------------------
                Family member loading failure should NOT prevent
                booking for the patient himself.
                --------------------------------------------------
                */

                setFamilyMembers([]);

            }

            finally {

                setFamilyMembersLoading(false);

            }

        };


        loadFamilyMembers();

    }, []);


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
    // Error Message Helper
    // ======================================================

    const getErrorMessage = (errorData) => {

        if (!errorData) {

            return (
                "Unable to book the diagnostic test. " +
                "Please try again."
            );

        }


        const getFirstValue = (value) => {

            if (Array.isArray(value)) {

                return value[0];

            }

            return value;

        };


        if (errorData.diagnostic_test) {

            return getFirstValue(
                errorData.diagnostic_test
            );

        }


        if (errorData.booking_date) {

            return getFirstValue(
                errorData.booking_date
            );

        }


        if (errorData.booking_time) {

            return getFirstValue(
                errorData.booking_time
            );

        }


        if (errorData.family_member) {

            return getFirstValue(
                errorData.family_member
            );

        }


        if (errorData.non_field_errors) {

            return getFirstValue(
                errorData.non_field_errors
            );

        }


        if (errorData.patient) {

            return getFirstValue(
                errorData.patient
            );

        }


        if (errorData.authentication) {

            return getFirstValue(
                errorData.authentication
            );

        }


        if (errorData.detail) {

            return errorData.detail;

        }


        if (errorData.message) {

            return errorData.message;

        }


        const firstKey =
            Object.keys(errorData)[0];


        if (firstKey) {

            return getFirstValue(
                errorData[firstKey]
            );

        }


        return (
            "Unable to book the diagnostic test. " +
            "Please try again."
        );

    };


    // ======================================================
    // Submit Booking
    // ======================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        // ==================================================
        // Test Validation
        // ==================================================

        if (!test) {

            alert(
                "Diagnostic test information is not available."
            );

            return;

        }


        // ==================================================
        // Date Validation
        // ==================================================

        if (!bookingDate) {

            alert(
                "Please select a booking date."
            );

            return;

        }


        // ==================================================
        // Time Validation
        // ==================================================

        if (!bookingTime) {

            alert(
                "Please select a preferred time."
            );

            return;

        }


        try {

            setBookingLoading(true);


            // ==================================================
            // Booking Data
            // ==================================================

            const bookingData = {

                diagnostic_test:
                    Number(testId),

                booking_date:
                    bookingDate,

                booking_time:
                    bookingTime,

            };


            // ==================================================
            // Family Member
            // ==================================================
            //
            // Empty = Myself
            //
            // Selected ID = Family Member
            // ==================================================

            if (familyMember) {

                bookingData.family_member =
                    Number(familyMember);

            }


            /*
            ==================================================
            NOTES

            Do NOT send notes unless your backend serializer
            accepts a "notes" field.

            Currently notes is only frontend state.
            ==================================================
            */


            console.log(
                "Diagnostic Booking Data Sending:",
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
                "Diagnostic Booking Success:",
                response
            );


            // ==================================================
            // Success Message
            // ==================================================

            alert(
                response?.message ||
                "Diagnostic test booked successfully!"
            );


            // ==================================================
            // SUCCESS REDIRECT
            // ==================================================
            //
            // IMPORTANT:
            //
            // AppRoutes.jsx has:
            //
            // /tests
            //
            // NOT:
            //
            // /diagnostics
            //
            // Therefore use /tests.
            // ==================================================

            navigate(
                "/tests"
            );

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


            const errorMessage =
                getErrorMessage(
                    err.response?.data
                );


            alert(
                errorMessage
            );

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
                        Please wait while we prepare
                        your booking.
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
                            navigate("/tests")
                        }
                    >
                        ← Back to Diagnostic Tests
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


            {/* ==================================================
                Header
            ================================================== */}

            <section className="booking-header">

                <div className="booking-header-content">


                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate("/tests")
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


            {/* ==================================================
                Main Content
            ================================================== */}

            <main className="booking-container">

                <div className="booking-layout">


                    {/* ==================================================
                        Test Summary
                    ================================================== */}

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

                            {test?.category_name ||
                                "Diagnostic Test"}

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
                                        ৳
                                        {formatPrice(
                                            test?.price
                                        )}
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
                                Your booking information is
                                secure and protected.
                            </p>

                        </div>

                    </aside>


                    {/* ==================================================
                        Booking Form
                    ================================================== */}

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


                            {/* ==================================================
                                Book For
                            ================================================== */}

                            <div className="form-group">


                                <label
                                    htmlFor="familyMember"
                                >

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
                                    disabled={
                                        familyMembersLoading ||
                                        bookingLoading
                                    }
                                >

                                    <option value="">
                                        Myself
                                    </option>


                                    {familyMembers.map(
                                        (member) => (

                                            <option
                                                key={member.id}
                                                value={member.id}
                                            >
                                                {member.name}
                                            </option>

                                        )
                                    )}

                                </select>


                                <small className="form-help">

                                    {familyMembersLoading

                                        ? (
                                            "Loading family members..."
                                        )

                                        : familyMembers.length > 0

                                            ? (
                                                "Select a family member "
                                                + "if you are booking this "
                                                + "test for them."
                                            )

                                            : (
                                                "No family members found. "
                                                + "You can book this test "
                                                + "for yourself."
                                            )
                                    }

                                </small>

                            </div>


                            {/* ==================================================
                                Date + Time
                            ================================================== */}

                            <div className="form-row">


                                <div className="form-group">

                                    <label
                                        htmlFor="bookingDate"
                                    >

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
                                        disabled={
                                            bookingLoading
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label
                                        htmlFor="bookingTime"
                                    >

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
                                        disabled={
                                            bookingLoading
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* ==================================================
                                Notes
                            ================================================== */}

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
                                    disabled={
                                        bookingLoading
                                    }
                                />

                            </div>


                            {/* ==================================================
                                Booking Notice
                            ================================================== */}

                            <div className="booking-notice">

                                <span>
                                    ℹ
                                </span>


                                <p>
                                    Please review your selected
                                    date and time carefully before
                                    confirming the booking.
                                </p>

                            </div>


                            {/* ==================================================
                                Actions
                            ================================================== */}

                            <div className="booking-actions">


                                <button
                                    type="button"
                                    className="cancel-booking-button"
                                    disabled={
                                        bookingLoading
                                    }
                                    onClick={() =>
                                        navigate(
                                            "/tests"
                                        )
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="confirm-booking-button"
                                    disabled={
                                        bookingLoading ||
                                        !test
                                    }
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