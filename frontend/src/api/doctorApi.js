import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import useAuth from "../../context/useAuth";

import {
    getMyAppointments,
} from "../../services/appointmentService";


export default function PatientDashboard() {

    const { logout } = useAuth();


    // ==========================================================
    // State
    // ==========================================================

    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==========================================================
    // Load Patient Appointments
    // ==========================================================

    useEffect(() => {

        const loadAppointments = async () => {

            try {

                setLoading(true);
                setError("");


                // ------------------------------------------------
                // API Request
                // ------------------------------------------------

                const response =
                    await getMyAppointments();


                console.log(
                    "PATIENT APPOINTMENTS RESPONSE:",
                    response?.data
                );


                // ------------------------------------------------
                // Safely Extract Appointment Array
                //
                // Supports:
                // 1. [...]
                // 2. { results: [...] }
                // 3. { data: [...] }
                // ------------------------------------------------

                const data =
                    response?.data;


                let appointmentList = [];


                if (Array.isArray(data)) {

                    appointmentList = data;

                }

                else if (
                    Array.isArray(data?.results)
                ) {

                    appointmentList =
                        data.results;

                }

                else if (
                    Array.isArray(data?.data)
                ) {

                    appointmentList =
                        data.data;

                }


                console.log(
                    "PATIENT APPOINTMENT LIST:",
                    appointmentList
                );


                // ------------------------------------------------
                // Always store an array
                // ------------------------------------------------

                setAppointments(
                    appointmentList
                );


            } catch (err) {

                console.error(
                    "Load patient appointments error:",
                    err
                );


                // ------------------------------------------------
                // Prevent filter() crash
                // ------------------------------------------------

                setAppointments([]);


                // ------------------------------------------------
                // Error Message
                // ------------------------------------------------

                setError(
                    err?.response?.data?.detail ||
                    err?.response?.data?.message ||
                    "Unable to load your appointments."
                );


            } finally {

                setLoading(false);

            }

        };


        loadAppointments();

    }, []);


    // ==========================================================
    // Appointment Statistics
    // ==========================================================

    const pending =
        appointments.filter(
            (item) =>
                String(
                    item?.status || ""
                )
                    .trim()
                    .toLowerCase()
                    === "pending"
        ).length;


    const confirmed =
        appointments.filter(
            (item) =>
                String(
                    item?.status || ""
                )
                    .trim()
                    .toLowerCase()
                    === "confirmed"
        ).length;


    const completed =
        appointments.filter(
            (item) =>
                String(
                    item?.status || ""
                )
                    .trim()
                    .toLowerCase()
                    === "completed"
        ).length;


    // ==========================================================
    // Render
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

                            <p className="text-muted mb-2">
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

                            <p className="text-muted mb-2">
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

                            <p className="text-muted mb-2">
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


                        {/* Find Doctor */}

                        <Link
                            to="/doctors"
                            className="btn btn-primary"
                        >
                            Find a Doctor
                        </Link>


                        {/* Book Appointment */}

                        <Link
                            to="/appointments/book"
                            className="btn btn-success"
                        >
                            Book Appointment
                        </Link>


                        {/* My Appointments */}

                        <Link
                            to="/appointments"
                            className="btn btn-outline-primary"
                        >
                            My Appointments
                        </Link>


                        {/* Medical Reports */}

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
                My Recent Appointments
            ================================================== */}

            <div className="card border-0 shadow-sm">

                <div className="card-body">


                    {/* Header */}

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


                    {/* ==================================================
                        Loading
                    ================================================== */}

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


                    {/* ==================================================
                        Error
                    ================================================== */}

                    {!loading && error && (

                        <div
                            className="alert alert-danger"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    {/* ==================================================
                        No Appointments
                    ================================================== */}

                    {!loading &&
                        !error &&
                        appointments.length === 0 && (

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


                    {/* ==================================================
                        Appointment Table
                    ================================================== */}

                    {!loading &&
                        !error &&
                        appointments.length > 0 && (

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

                                        {appointments
                                            .slice(0, 5)
                                            .map(
                                                (appointment) => (

                                                    <tr
                                                        key={
                                                            appointment.id
                                                        }
                                                    >


                                                        {/* Booking */}

                                                        <td>

                                                            <strong>

                                                                {
                                                                    appointment.booking_number ||
                                                                    `#${appointment.id}`
                                                                }

                                                            </strong>

                                                        </td>


                                                        {/* Doctor */}

                                                        <td>

                                                            {
                                                                appointment.doctor_name ||
                                                                appointment.doctor?.name ||
                                                                appointment.doctor?.full_name ||
                                                                "Doctor"
                                                            }

                                                        </td>


                                                        {/* Date */}

                                                        <td>

                                                            {
                                                                appointment.appointment_date ||
                                                                appointment.date ||
                                                                "-"
                                                            }

                                                        </td>


                                                        {/* Status */}

                                                        <td>

                                                            <span
                                                                className={
                                                                    `badge ${
                                                                        String(
                                                                            appointment.status || ""
                                                                        )
                                                                            .trim()
                                                                            .toLowerCase()
                                                                            === "pending"

                                                                            ? "bg-warning text-dark"

                                                                            : String(
                                                                                appointment.status || ""
                                                                            )
                                                                                .trim()
                                                                                .toLowerCase()
                                                                                === "confirmed"

                                                                            ? "bg-primary"

                                                                            : String(
                                                                                appointment.status || ""
                                                                            )
                                                                                .trim()
                                                                                .toLowerCase()
                                                                                === "completed"

                                                                            ? "bg-success"

                                                                            : String(
                                                                                appointment.status || ""
                                                                            )
                                                                                .trim()
                                                                                .toLowerCase()
                                                                                === "rejected"

                                                                            ? "bg-danger"

                                                                            : "bg-secondary"
                                                                    }`
                                                                }
                                                            >

                                                                {
                                                                    appointment.status ||
                                                                    "Unknown"
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* Action */}

                                                        <td>

                                                            <Link
                                                                to={`/appointments/details/${appointment.id}`}
                                                                className="btn btn-sm btn-outline-primary"
                                                            >
                                                                Details
                                                            </Link>

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

    );

}