import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import useAuth from "../../context/useAuth";

import {
    getMyAppointments,
} from "../../services/appointmentService";


// ==========================================================
// Patient Dashboard
// ==========================================================

export default function PatientDashboard() {

    const {
        logout,
    } = useAuth();


    // ==========================================================
    // State
    // ==========================================================

    const [appointments, setAppointments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==========================================================
    // Normalize API Response
    // ==========================================================

    const normalizeAppointments = (response) => {

        const data = response?.data;


        // ------------------------------------------------------
        // Direct array
        // ------------------------------------------------------

        if (Array.isArray(data)) {

            return data;

        }


        // ------------------------------------------------------
        // Django REST Framework pagination
        // ------------------------------------------------------

        if (Array.isArray(data?.results)) {

            return data.results;

        }


        // ------------------------------------------------------
        // Nested data array
        // ------------------------------------------------------

        if (Array.isArray(data?.data)) {

            return data.data;

        }


        // ------------------------------------------------------
        // Nested appointments
        // ------------------------------------------------------

        if (
            Array.isArray(
                data?.appointments
            )
        ) {

            return data.appointments;

        }


        // ------------------------------------------------------
        // Nested results
        // ------------------------------------------------------

        if (
            Array.isArray(
                data?.data?.results
            )
        ) {

            return data.data.results;

        }


        // ------------------------------------------------------
        // No valid array
        // ------------------------------------------------------

        console.warn(
            "Unexpected appointments API response:",
            response
        );


        return [];

    };


    // ==========================================================
    // Load Appointments
    // ==========================================================

    useEffect(() => {

        let mounted = true;


        const loadAppointments = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await getMyAppointments();


                console.log(
                    "Patient Appointments Response:",
                    response
                );


                const appointmentData =
                    normalizeAppointments(
                        response
                    );


                if (mounted) {

                    setAppointments(
                        appointmentData
                    );

                }

            } catch (err) {

                console.error(
                    "Load patient appointments error:",
                    err
                );


                if (mounted) {

                    setAppointments([]);


                    setError(
                        err?.response?.data?.detail ||
                        err?.response?.data?.message ||
                        "Unable to load your appointments."
                    );

                }

            } finally {

                if (mounted) {

                    setLoading(false);

                }

            }

        };


        loadAppointments();


        return () => {

            mounted = false;

        };

    }, []);


    // ==========================================================
    // Safety Check
    //
    // appointments must ALWAYS be an array.
    // ==========================================================

    const safeAppointments =
        Array.isArray(appointments)
            ? appointments
            : [];


    // ==========================================================
    // Statistics
    // ==========================================================

    const pending =
        safeAppointments.filter(
            (appointment) =>
                String(
                    appointment?.status || ""
                )
                    .trim()
                    .toLowerCase()
                === "pending"
        ).length;


    const confirmed =
        safeAppointments.filter(
            (appointment) =>
                String(
                    appointment?.status || ""
                )
                    .trim()
                    .toLowerCase()
                === "confirmed"
        ).length;


    const completed =
        safeAppointments.filter(
            (appointment) =>
                String(
                    appointment?.status || ""
                )
                    .trim()
                    .toLowerCase()
                === "completed"
        ).length;


    // ==========================================================
    // Dashboard
    // ==========================================================

    return (

        <div className="container-fluid py-4">


            {/* ==================================================
                Header
            ================================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">
                        Patient Dashboard
                    </h2>

                    <p className="text-muted mb-0">
                        Manage your healthcare appointments
                    </p>

                </div>


                <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={logout}
                >

                    Logout

                </button>

            </div>


            {/* ==================================================
                Welcome
            ================================================== */}

            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body">

                    <h4 className="fw-bold">
                        Welcome to MediCare
                    </h4>

                    <p className="text-muted mb-0">

                        Book appointments, manage your
                        healthcare records and track your
                        upcoming visits.

                    </p>

                </div>

            </div>


            {/* ==================================================
                Statistics
            ================================================== */}

            <div className="row g-4 mb-4">


                {/* Pending */}

                <div className="col-md-4">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <p className="text-muted mb-1">
                                Pending
                            </p>

                            <h2 className="fw-bold mb-0">
                                {pending}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* Confirmed */}

                <div className="col-md-4">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <p className="text-muted mb-1">
                                Confirmed
                            </p>

                            <h2 className="fw-bold mb-0">
                                {confirmed}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* Completed */}

                <div className="col-md-4">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <p className="text-muted mb-1">
                                Completed
                            </p>

                            <h2 className="fw-bold mb-0">
                                {completed}
                            </h2>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Quick Actions
            ================================================== */}

            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body">

                    <h5 className="fw-bold mb-3">
                        Quick Actions
                    </h5>


                    <div className="d-flex gap-2 flex-wrap">

                        <Link
                            to="/doctors"
                            className="btn btn-primary"
                        >
                            Find a Doctor
                        </Link>


                        <Link
                            to="/appointments/book"
                            className="btn btn-success"
                        >
                            Book Appointment
                        </Link>


                        <Link
                            to="/appointments"
                            className="btn btn-outline-primary"
                        >
                            My Appointments
                        </Link>


                        <Link
                            to="/reports"
                            className="btn btn-outline-secondary"
                        >
                            Medical Reports
                        </Link>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Appointments
            ================================================== */}

            <div className="card border-0 shadow-sm">

                <div className="card-body">


                    {/* --------------------------------------------------
                        Header
                    -------------------------------------------------- */}

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h5 className="fw-bold mb-0">
                            My Recent Appointments
                        </h5>


                        <Link
                            to="/appointments"
                            className="btn btn-sm btn-outline-primary"
                        >
                            View All
                        </Link>

                    </div>


                    {/* --------------------------------------------------
                        Loading
                    -------------------------------------------------- */}

                    {loading && (

                        <div className="text-center py-4">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >

                                <span className="visually-hidden">
                                    Loading...
                                </span>

                            </div>


                            <p className="text-muted mt-3 mb-0">
                                Loading appointments...
                            </p>

                        </div>

                    )}


                    {/* --------------------------------------------------
                        Error
                    -------------------------------------------------- */}

                    {!loading && error && (

                        <div
                            className="alert alert-danger"
                            role="alert"
                        >

                            {error}

                        </div>

                    )}


                    {/* --------------------------------------------------
                        Empty
                    -------------------------------------------------- */}

                    {!loading &&
                        !error &&
                        safeAppointments.length === 0 && (

                            <div className="text-center py-4">

                                <p className="text-muted">
                                    You don't have any appointments yet.
                                </p>


                                <Link
                                    to="/appointments/book"
                                    className="btn btn-primary"
                                >
                                    Book Your First Appointment
                                </Link>

                            </div>

                        )}


                    {/* --------------------------------------------------
                        Appointment Table
                    -------------------------------------------------- */}

                    {!loading &&
                        safeAppointments.length > 0 && (

                            <div className="table-responsive">

                                <table className="table align-middle">

                                    <thead>

                                        <tr>

                                            <th>
                                                Booking
                                            </th>

                                            <th>
                                                Doctor
                                            </th>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {safeAppointments
                                            .slice(0, 5)
                                            .map(
                                                (
                                                    appointment,
                                                    index
                                                ) => {


                                                    const appointmentId =
                                                        appointment?.id ||
                                                        `appointment-${index}`;


                                                    const status =
                                                        String(
                                                            appointment?.status ||
                                                            "Unknown"
                                                        )
                                                            .trim();


                                                    const normalizedStatus =
                                                        status.toLowerCase();


                                                    let badgeClass =
                                                        "bg-secondary";


                                                    if (
                                                        normalizedStatus ===
                                                        "pending"
                                                    ) {

                                                        badgeClass =
                                                            "bg-warning text-dark";

                                                    }

                                                    else if (
                                                        normalizedStatus ===
                                                        "confirmed"
                                                    ) {

                                                        badgeClass =
                                                            "bg-primary";

                                                    }

                                                    else if (
                                                        normalizedStatus ===
                                                        "completed"
                                                    ) {

                                                        badgeClass =
                                                            "bg-success";

                                                    }

                                                    else if (
                                                        normalizedStatus ===
                                                        "rejected"
                                                    ) {

                                                        badgeClass =
                                                            "bg-danger";

                                                    }

                                                    else if (
                                                        normalizedStatus ===
                                                        "cancelled"
                                                    ) {

                                                        badgeClass =
                                                            "bg-secondary";

                                                    }


                                                    return (

                                                        <tr
                                                            key={
                                                                appointmentId
                                                            }
                                                        >


                                                            {/* Booking */}

                                                            <td>

                                                                {
                                                                    appointment?.booking_number ||
                                                                    `#${appointment?.id || "-"}`
                                                                }

                                                            </td>


                                                            {/* Doctor */}

                                                            <td>

                                                                {
                                                                    appointment?.doctor_name ||

                                                                    appointment?.doctor?.name ||

                                                                    appointment?.doctor?.username ||

                                                                    appointment?.doctor?.full_name ||

                                                                    "Doctor"
                                                                }

                                                            </td>


                                                            {/* Date */}

                                                            <td>

                                                                {
                                                                    appointment?.appointment_date ||

                                                                    appointment?.date ||

                                                                    "-"
                                                                }

                                                            </td>


                                                            {/* Status */}

                                                            <td>

                                                                <span
                                                                    className={
                                                                        `badge ${badgeClass}`
                                                                    }
                                                                >

                                                                    {
                                                                        status
                                                                    }

                                                                </span>

                                                            </td>


                                                            {/* Action */}

                                                            <td>

                                                                {appointment?.id ? (

                                                                    <Link
                                                                        to={
                                                                            `/appointments/details/${appointment.id}`
                                                                        }
                                                                        className="btn btn-sm btn-outline-primary"
                                                                    >

                                                                        Details

                                                                    </Link>

                                                                ) : (

                                                                    <span className="text-muted">
                                                                        -
                                                                    </span>

                                                                )}

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

    );

}