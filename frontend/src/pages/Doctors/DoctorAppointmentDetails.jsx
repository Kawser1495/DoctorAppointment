import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getDoctorAppointmentDetails,
    confirmDoctorAppointment,
    rejectDoctorAppointment,
    completeDoctorAppointment,
} from "../../services/appointmentService";

import AddMedicalReport from "./AddMedicalReport";


export default function DoctorAppointmentDetails() {

    const { id } =
        useParams();

    const navigate =
        useNavigate();


    // ======================================================
    // States
    // ======================================================

    const [
        appointment,
        setAppointment,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const [
        success,
        setSuccess,
    ] = useState("");


    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);


    // ======================================================
    // Load Appointment Details
    // ======================================================

    const loadAppointmentDetails =
        useCallback(
            async () => {

                if (!id) {

                    return;

                }


                try {

                    setLoading(
                        true
                    );

                    setError(
                        ""
                    );


                    const response =
                        await getDoctorAppointmentDetails(
                            id
                        );


                    const data =

                        response?.data?.data

                        ||

                        response?.data

                        ||

                        null;


                    setAppointment(
                        data
                    );

                }

                catch (err) {

                    console.error(
                        "Doctor appointment details error:",
                        err
                    );


                    setError(

                        err?.response?.data?.detail

                        ||

                        err?.response?.data?.message

                        ||

                        "Unable to load appointment details."

                    );

                }

                finally {

                    setLoading(
                        false
                    );

                }

            },

            [
                id,
            ]

        );


    // ======================================================
    // Initial Load
    // ======================================================

    useEffect(() => {

        loadAppointmentDetails();

    }, [

        loadAppointmentDetails,

    ]);


    // ======================================================
    // Status Badge
    // ======================================================

    const statusBadgeClass =
        useMemo(() => {

            const status =
                String(
                    appointment?.status || ""
                )
                    .trim()
                    .toLowerCase();


            switch (status) {

                case "pending":

                    return "bg-warning text-dark";


                case "confirmed":

                    return "bg-primary";


                case "completed":

                    return "bg-success";


                case "rejected":

                    return "bg-danger";


                case "cancelled":

                    return "bg-secondary";


                default:

                    return "bg-dark";

            }

        }, [

            appointment?.status,

        ]);


    // ======================================================
    // Change Appointment Status
    // ======================================================

    const handleStatusChange =
        async (
            newStatus
        ) => {

            if (
                !appointment?.id
            ) {

                return;

            }


            const confirmMessage = {

                Confirmed:
                    "Are you sure you want to confirm this appointment?",

                Rejected:
                    "Are you sure you want to reject this appointment?",

                Completed:
                    "Are you sure you want to mark this appointment as completed?",

            }[
                newStatus
            ];


            const confirmed =
                window.confirm(

                    confirmMessage

                    ||

                    "Update this appointment?"

                );


            if (!confirmed) {

                return;

            }


            try {

                setActionLoading(
                    true
                );

                setError(
                    ""
                );

                setSuccess(
                    ""
                );


                if (
                    newStatus ===
                    "Confirmed"
                ) {

                    await confirmDoctorAppointment(
                        appointment.id
                    );

                }

                else if (
                    newStatus ===
                    "Rejected"
                ) {

                    await rejectDoctorAppointment(
                        appointment.id
                    );

                }

                else if (
                    newStatus ===
                    "Completed"
                ) {

                    await completeDoctorAppointment(
                        appointment.id
                    );

                }


                setSuccess(
                    `Appointment ${newStatus.toLowerCase()} successfully.`
                );


                // Refresh latest appointment data
                await loadAppointmentDetails();


                setTimeout(() => {

                    setSuccess(
                        ""
                    );

                }, 4000);

            }

            catch (err) {

                console.error(
                    "Doctor status update error:",
                    err
                );


                setError(

                    err?.response?.data?.detail

                    ||

                    err?.response?.data?.message

                    ||

                    "Unable to update appointment status."

                );

            }

            finally {

                setActionLoading(
                    false
                );

            }

        };


    // ======================================================
    // Handle Medical Report Success
    //
    // This runs after AddMedicalReport successfully
    // creates a medical report.
    // ======================================================

    const handleReportSuccess =
        async (
            newReport
        ) => {

            console.log(
                "New medical report created:",
                newReport
            );


            setError(
                ""
            );


            setSuccess(
                "Medical report / prescription added successfully."
            );


            // Refresh latest appointment data
            await loadAppointmentDetails();


            setTimeout(() => {

                setSuccess(
                    ""
                );

            }, 4000);

        };


    // ======================================================
    // Format Date
    // ======================================================

    const formatDate =
        (
            dateString
        ) => {

            if (!dateString) {

                return "-";

            }


            const date =
                new Date(
                    `${dateString}T00:00:00`
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "-";

            }


            return date.toLocaleDateString(
                "en-US",
                {

                    day:
                        "numeric",

                    month:
                        "short",

                    year:
                        "numeric",

                }
            );

        };


    // ======================================================
    // Format Time
    // ======================================================

    const formatTime =
        (
            timeString
        ) => {

            if (!timeString) {

                return "-";

            }


            const [
                hour,
                minute,
            ] =
                timeString.split(
                    ":"
                );


            const date =
                new Date();


            date.setHours(
                Number(hour)
            );


            date.setMinutes(
                Number(minute)
            );


            return date.toLocaleTimeString(
                "en-US",
                {

                    hour:
                        "numeric",

                    minute:
                        "2-digit",

                    hour12:
                        true,

                }
            );

        };


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="container py-5">

                <div className="text-center">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                    <p className="mt-3 text-muted">

                        Loading appointment details...

                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // Appointment Not Found
    // ======================================================

    if (!appointment) {

        return (

            <div className="container py-5">

                <div className="alert alert-warning">

                    Appointment not found.

                </div>


                <button
                    className="btn btn-primary"
                    onClick={() =>
                        navigate(
                            "/doctor/dashboard"
                        )
                    }
                >

                    Back to dashboard

                </button>

            </div>

        );

    }


    // ======================================================
    // Main UI
    // ======================================================

    return (

        <div className="container py-4">


            {/* ==================================================
                Header
            =================================================== */}

            <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">

                <div>

                    <p
                        className="text-uppercase text-primary fw-bold mb-1"
                        style={{
                            letterSpacing:
                                "0.12em",

                            fontSize:
                                "11px",
                        }}
                    >

                        Appointment Details

                    </p>


                    <h2 className="mb-0">

                        {
                            appointment.booking_number

                            ||

                            `#${appointment.id}`
                        }

                    </h2>

                </div>


                <div className="d-flex gap-2 align-items-center flex-wrap">


                    <span
                        className={
                            `badge ${statusBadgeClass}`
                        }
                    >

                        {
                            appointment.status
                            ||
                            "Unknown"
                        }

                    </span>


                    {/* Pending */}

                    {
                        appointment.status ===
                        "Pending" && (

                            <>

                                <button
                                    className="btn btn-success"
                                    disabled={
                                        actionLoading
                                    }
                                    onClick={() =>
                                        handleStatusChange(
                                            "Confirmed"
                                        )
                                    }
                                >

                                    {
                                        actionLoading
                                            ? "Updating..."
                                            : "Confirm"
                                    }

                                </button>


                                <button
                                    className="btn btn-outline-danger"
                                    disabled={
                                        actionLoading
                                    }
                                    onClick={() =>
                                        handleStatusChange(
                                            "Rejected"
                                        )
                                    }
                                >

                                    Reject

                                </button>

                            </>

                        )
                    }


                    {/* Confirmed */}

                    {
                        appointment.status ===
                        "Confirmed" && (

                            <button
                                className="btn btn-primary"
                                disabled={
                                    actionLoading
                                }
                                onClick={() =>
                                    handleStatusChange(
                                        "Completed"
                                    )
                                }
                            >

                                {
                                    actionLoading
                                        ? "Updating..."
                                        : "Complete"
                                }

                            </button>

                        )
                    }


                    <button
                        className="btn btn-outline-secondary"
                        onClick={() =>
                            navigate(
                                "/doctor/dashboard"
                            )
                        }
                    >

                        Back

                    </button>

                </div>

            </div>


            {/* ==================================================
                Messages
            =================================================== */}

            {
                error && (

                    <div className="alert alert-danger">

                        {error}

                    </div>

                )
            }


            {
                success && (

                    <div className="alert alert-success">

                        {success}

                    </div>

                )
            }


            {/* ==================================================
                Patient + Appointment Information
            =================================================== */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body p-4">

                    <div className="row g-4">


                        {/* Patient */}

                        <div className="col-lg-6">

                            <div className="border rounded-4 p-3 h-100 bg-light-subtle">

                                <h5 className="mb-3">

                                    Patient Information

                                </h5>


                                <div className="row g-3">


                                    <div className="col-md-6">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Patient Name

                                        </label>

                                        <strong>

                                            {
                                                appointment
                                                    .patient_profile
                                                    ?.full_name

                                                ||

                                                appointment
                                                    .patient_name

                                                ||

                                                "N/A"
                                            }

                                        </strong>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Age

                                        </label>

                                        <strong>

                                            {
                                                appointment
                                                    .patient_profile
                                                    ?.age
                                                ??
                                                "N/A"
                                            }

                                        </strong>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Gender

                                        </label>

                                        <strong>

                                            {
                                                appointment
                                                    .patient_profile
                                                    ?.gender
                                                ||
                                                "N/A"
                                            }

                                        </strong>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Blood Group

                                        </label>

                                        <strong>

                                            {
                                                appointment
                                                    .patient_profile
                                                    ?.blood_group
                                                ||
                                                "N/A"
                                            }

                                        </strong>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Phone Number

                                        </label>

                                        <strong>

                                            {
                                                appointment
                                                    .patient_profile
                                                    ?.phone
                                                ||
                                                "N/A"
                                            }

                                        </strong>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Email

                                        </label>

                                        <strong>

                                            {
                                                appointment
                                                    .patient_profile
                                                    ?.email
                                                ||
                                                "N/A"
                                            }

                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* Appointment */}

                        <div className="col-lg-6">

                            <div className="border rounded-4 p-3 h-100 bg-light-subtle">

                                <h5 className="mb-3">

                                    Appointment Information

                                </h5>


                                <div className="row g-3">


                                    <div className="col-md-6">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Booking Number

                                        </label>

                                        <strong>

                                            {
                                                appointment.booking_number
                                                ||
                                                "N/A"
                                            }

                                        </strong>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Appointment Date

                                        </label>

                                        <strong>

                                            {
                                                formatDate(
                                                    appointment
                                                        .appointment_date
                                                )
                                            }

                                        </strong>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Appointment Time

                                        </label>

                                        <strong>

                                            {
                                                formatTime(

                                                    appointment
                                                        .appointment_time

                                                    ||

                                                    appointment
                                                        .slot_time

                                                )
                                            }

                                        </strong>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Status

                                        </label>

                                        <strong>

                                            {
                                                appointment.status
                                                ||
                                                "Unknown"
                                            }

                                        </strong>

                                    </div>


                                    <div className="col-12">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Appointment Reason

                                        </label>

                                        <strong>

                                            {
                                                appointment.reason
                                                ||
                                                "N/A"
                                            }

                                        </strong>

                                    </div>


                                    <div className="col-12">

                                        <label className="text-muted small text-uppercase d-block mb-1">

                                            Symptoms

                                        </label>

                                        <strong>

                                            {
                                                appointment.symptoms
                                                ||
                                                "Not provided"
                                            }

                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Family Member
            =================================================== */}

            {
                appointment.family_member_details && (

                    <div className="card shadow-sm border-0 mb-4">

                        <div className="card-body p-4">

                            <h5 className="mb-3">

                                Family Member Information

                            </h5>


                            <div className="row g-3">


                                <div className="col-md-4">

                                    <label className="text-muted small text-uppercase d-block mb-1">

                                        Name

                                    </label>

                                    <strong>

                                        {
                                            appointment
                                                .family_member_details
                                                .name
                                            ||
                                            "N/A"
                                        }

                                    </strong>

                                </div>


                                <div className="col-md-4">

                                    <label className="text-muted small text-uppercase d-block mb-1">

                                        Age

                                    </label>

                                    <strong>

                                        {
                                            appointment
                                                .family_member_details
                                                .age
                                            ??
                                            "N/A"
                                        }

                                    </strong>

                                </div>


                                <div className="col-md-4">

                                    <label className="text-muted small text-uppercase d-block mb-1">

                                        Gender

                                    </label>

                                    <strong>

                                        {
                                            appointment
                                                .family_member_details
                                                .gender
                                            ||
                                            "N/A"
                                        }

                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                )
            }


            {/* ==================================================
                Add Medical Report / Prescription
            =================================================== */}

            {
                [
                    "Confirmed",
                    "Completed",
                ].includes(
                    appointment.status
                ) && (

                    <AddMedicalReport

                        appointmentId={
                            appointment.id
                        }

                        onSuccess={
                            handleReportSuccess
                        }

                    />

                )
            }


        </div>

    );

}