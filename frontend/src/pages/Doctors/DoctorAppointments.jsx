import {
    useEffect,
    useState,
} from "react";

import {
    getDoctorAppointments,
    confirmDoctorAppointment,
    rejectDoctorAppointment,
    completeDoctorAppointment,
} from "../../services/appointmentService";


export default function DoctorAppointments() {

    // ==================================================
    // State
    // ==================================================

    const [appointments, setAppointments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState(null);


    // ==================================================
    // Load Doctor Appointments
    // ==================================================

    const loadAppointments = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await getDoctorAppointments();


            console.log(
                "Doctor Appointments:",
                response.data
            );


            const data =
                response.data?.data ||
                response.data ||
                [];


            setAppointments(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (err) {

            console.error(
                "Doctor Appointments Error:",
                err.response?.data || err
            );


            setError(

                err?.response?.data?.message ||

                err?.response?.data?.detail ||

                "Unable to load appointments."

            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // Load Appointments
    // ==================================================

    useEffect(() => {

        loadAppointments();

    }, []);


    // ==================================================
    // Update Appointment Status
    // ==================================================

    const handleStatusChange = async (
        id,
        status
    ) => {

        try {

            setActionLoading(id);

            setError("");


            // ==============================================
            // Confirm Appointment
            // ==============================================

            if (status === "Confirmed") {

                await confirmDoctorAppointment(
                    id
                );

            }


            // ==============================================
            // Reject Appointment
            // ==============================================

            else if (status === "Rejected") {

                await rejectDoctorAppointment(
                    id
                );

            }


            // ==============================================
            // Complete Appointment
            // ==============================================

            else if (status === "Completed") {

                await completeDoctorAppointment(
                    id
                );

            }


            // ==============================================
            // Invalid Status
            // ==============================================

            else {

                setError(
                    "Invalid appointment status."
                );

                return;

            }


            // ==============================================
            // Success
            // ==============================================

            alert(
                `Appointment ${status.toLowerCase()} successfully.`
            );


            // Reload appointment list

            await loadAppointments();

        }

        catch (err) {

            console.error(
                "Appointment Status Update Error:",
                err.response?.data || err
            );


            const data =
                err.response?.data;


            setError(

                data?.message ||

                data?.detail ||

                "Unable to update appointment status."

            );

        }

        finally {

            setActionLoading(null);

        }

    };


    // ==================================================
    // Loading
    // ==================================================

    if (loading) {

        return (

            <div className="container py-5">

                <div className="text-center">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                    <p className="text-muted mt-3">

                        Loading appointments...

                    </p>

                </div>

            </div>

        );

    }


    // ==================================================
    // UI
    // ==================================================

    return (

        <div className="container-fluid py-4">


            {/* =============================================
                Header
            ============================================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">

                        Doctor Appointments

                    </h2>

                    <p className="text-muted mb-0">

                        Manage your patient appointments

                    </p>

                </div>


                <button
                    className="btn btn-outline-primary"
                    onClick={loadAppointments}
                    disabled={loading}
                >

                    Refresh

                </button>

            </div>


            {/* =============================================
                Error
            ============================================= */}

            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            {/* =============================================
                No Appointments
            ============================================= */}

            {appointments.length === 0 && (

                <div className="card border-0 shadow-sm">

                    <div className="card-body text-center py-5">

                        <h5 className="fw-bold">

                            No appointments found

                        </h5>

                        <p className="text-muted mb-0">

                            You don't have any appointments
                            at the moment.

                        </p>

                    </div>

                </div>

            )}


            {/* =============================================
                Appointment Table
            ============================================= */}

            {appointments.length > 0 && (

                <div className="card border-0 shadow-sm">

                    <div className="card-body">

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">


                                {/* Header */}

                                <thead>

                                    <tr>

                                        <th>

                                            Booking

                                        </th>

                                        <th>

                                            Patient

                                        </th>

                                        <th>

                                            Date

                                        </th>

                                        <th>

                                            Time

                                        </th>

                                        <th>

                                            Status

                                        </th>

                                        <th>

                                            Action

                                        </th>

                                    </tr>

                                </thead>


                                {/* Body */}

                                <tbody>

                                    {appointments.map(
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


                                                {/* Patient */}

                                                <td>

                                                    {
                                                        appointment.patient_name ||
                                                        "Patient"
                                                    }

                                                </td>


                                                {/* Date */}

                                                <td>

                                                    {
                                                        appointment.appointment_date ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* Time */}

                                                <td>

                                                    {
                                                        appointment.slot_time ||
                                                        appointment.time ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* Status */}

                                                <td>

                                                    <span

                                                        className={

                                                            `badge ${

                                                                appointment.status === "Pending"

                                                                    ? "bg-warning text-dark"

                                                                    : appointment.status === "Confirmed"

                                                                    ? "bg-primary"

                                                                    : appointment.status === "Completed"

                                                                    ? "bg-success"

                                                                    : appointment.status === "Rejected"

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


                                                {/* Actions */}

                                                <td>


                                                    {/* Pending */}

                                                    {appointment.status === "Pending" && (

                                                        <div className="d-flex gap-2">


                                                            {/* Confirm */}

                                                            <button

                                                                className="btn btn-sm btn-success"

                                                                disabled={
                                                                    actionLoading === appointment.id
                                                                }

                                                                onClick={() =>

                                                                    handleStatusChange(

                                                                        appointment.id,

                                                                        "Confirmed"

                                                                    )

                                                                }

                                                            >

                                                                {

                                                                    actionLoading === appointment.id

                                                                        ? "..."

                                                                        : "Confirm"

                                                                }

                                                            </button>


                                                            {/* Reject */}

                                                            <button

                                                                className="btn btn-sm btn-danger"

                                                                disabled={
                                                                    actionLoading === appointment.id
                                                                }

                                                                onClick={() =>

                                                                    handleStatusChange(

                                                                        appointment.id,

                                                                        "Rejected"

                                                                    )

                                                                }

                                                            >

                                                                {

                                                                    actionLoading === appointment.id

                                                                        ? "..."

                                                                        : "Reject"

                                                                }

                                                            </button>

                                                        </div>

                                                    )}


                                                    {/* Confirmed */}

                                                    {appointment.status === "Confirmed" && (

                                                        <button

                                                            className="btn btn-sm btn-success"

                                                            disabled={
                                                                actionLoading === appointment.id
                                                            }

                                                            onClick={() =>

                                                                handleStatusChange(

                                                                    appointment.id,

                                                                    "Completed"

                                                                )

                                                            }

                                                        >

                                                            {

                                                                actionLoading === appointment.id

                                                                    ? "..."

                                                                    : "Complete"

                                                            }

                                                        </button>

                                                    )}


                                                    {/* Completed */}

                                                    {appointment.status === "Completed" && (

                                                        <span className="text-success fw-semibold">

                                                            Completed

                                                        </span>

                                                    )}


                                                    {/* Rejected */}

                                                    {appointment.status === "Rejected" && (

                                                        <span className="text-danger fw-semibold">

                                                            Rejected

                                                        </span>

                                                    )}


                                                </td>

                                            </tr>

                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}