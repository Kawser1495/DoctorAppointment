import {
    useRef,
    useState,
} from "react";


import {
    createMedicalReport,
} from "../../services/reportService";


export default function AddMedicalReport({

    appointmentId,

    onSuccess,

}) {


    const [

        reportTitle,

        setReportTitle,

    ] = useState(
        "Medical Report"
    );


    const [

        prescription,

        setPrescription,

    ] = useState(
        ""
    );


    const [

        remarks,

        setRemarks,

    ] = useState(
        ""
    );


    const [

        reportFile,

        setReportFile,

    ] = useState(
        null
    );


    const [

        loading,

        setLoading,

    ] = useState(
        false
    );


    const [

        error,

        setError,

    ] = useState(
        ""
    );


    const fileInputRef =
        useRef(
            null
        );


    // ======================================================
    // Error Message
    // ======================================================

    const getErrorMessage =
        (
            errorData
        ) => {

            if (!errorData) {

                return (
                    "Unable to create medical report."
                );

            }


            if (

                typeof errorData
                ===
                "string"

            ) {

                return (
                    errorData
                );

            }


            if (

                errorData.detail

            ) {

                return (
                    errorData.detail
                );

            }


            if (

                typeof errorData
                ===
                "object"

            ) {

                return Object.entries(

                    errorData

                )

                    .map(

                        (

                            [
                                field,
                                messages,
                            ]

                        ) => {

                            const message =

                                Array.isArray(
                                    messages
                                )

                                    ?

                                    messages.join(
                                        ", "
                                    )

                                    :

                                    String(
                                        messages
                                    );


                            return (

                                `${field}: ${message}`

                            );

                        }

                    )

                    .join(
                        " | "
                    );

            }


            return (
                "Unable to create medical report."
            );

        };


    // ======================================================
    // Submit
    // ======================================================

    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();


            if (

                !appointmentId

            ) {

                setError(

                    "Appointment ID is missing."

                );

                return;

            }


            if (

                !reportTitle.trim()

            ) {

                setError(

                    "Report title is required."

                );

                return;

            }


            try {

                setLoading(
                    true
                );


                setError(
                    ""
                );


                const formData =
                    new FormData();


                // --------------------------------------------------
                // Report Type
                // --------------------------------------------------

                formData.append(

                    "report_type",

                    "Medical"

                );


                // --------------------------------------------------
                // Report Title
                // --------------------------------------------------

                formData.append(

                    "report_title",

                    reportTitle.trim()

                );


                // --------------------------------------------------
                // Appointment
                // --------------------------------------------------

                formData.append(

                    "appointment",

                    String(
                        appointmentId
                    )

                );


                // --------------------------------------------------
                // Prescription
                // --------------------------------------------------

                if (

                    prescription.trim()

                ) {

                    formData.append(

                        "prescription",

                        prescription.trim()

                    );

                }


                // --------------------------------------------------
                // Remarks
                // --------------------------------------------------

                if (

                    remarks.trim()

                ) {

                    formData.append(

                        "remarks",

                        remarks.trim()

                    );

                }


                // --------------------------------------------------
                // File
                // --------------------------------------------------

                if (

                    reportFile

                ) {

                    formData.append(

                        "report_file",

                        reportFile

                    );

                }


                // --------------------------------------------------
                // Debug
                // --------------------------------------------------

                console.log(

                    "Creating report for appointment:",

                    appointmentId

                );


                const response =

                    await createMedicalReport(

                        formData

                    );


                console.log(

                    "Create Report Response:",

                    response?.data

                );


                const newReport =

                    response?.data?.data

                    ||

                    response?.data;


                alert(

                    "Medical report / prescription added successfully."

                );


                // --------------------------------------------------
                // Parent Callback
                // --------------------------------------------------

                if (

                    onSuccess

                ) {

                    await onSuccess(

                        newReport

                    );

                }


                // --------------------------------------------------
                // Reset
                // --------------------------------------------------

                setReportTitle(

                    "Medical Report"

                );


                setPrescription(
                    ""
                );


                setRemarks(
                    ""
                );


                setReportFile(
                    null
                );


                if (

                    fileInputRef.current

                ) {

                    fileInputRef.current.value =
                        "";

                }


            }

            catch (

                err

            ) {

                console.error(

                    "Create medical report error:",

                    err?.response?.data

                    ||

                    err

                );


                setError(

                    getErrorMessage(

                        err?.response?.data

                    )

                );

            }

            finally {

                setLoading(
                    false
                );

            }

        };


    return (

        <div className="card border-0 shadow-sm mt-4">

            <div className="card-body p-4">


                <h4 className="mb-1">

                    🩺 Add Medical Report

                </h4>


                <p className="text-muted mb-4">

                    Create a prescription or medical report
                    for this appointment.

                </p>


                {

                    error && (

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    )

                }


                <form
                    onSubmit={
                        handleSubmit
                    }
                >


                    {/* Title */}

                    <div className="mb-3">

                        <label className="form-label fw-semibold">

                            Report Title

                        </label>


                        <input

                            type="text"

                            className="form-control"

                            value={
                                reportTitle
                            }

                            onChange={
                                (
                                    event
                                ) =>

                                    setReportTitle(
                                        event.target.value
                                    )

                            }

                            required

                        />

                    </div>


                    {/* Prescription */}

                    <div className="mb-3">

                        <label className="form-label fw-semibold">

                            Prescription

                        </label>


                        <textarea

                            className="form-control"

                            rows="5"

                            placeholder="Write prescription..."

                            value={
                                prescription
                            }

                            onChange={
                                (
                                    event
                                ) =>

                                    setPrescription(
                                        event.target.value
                                    )

                            }

                        />

                    </div>


                    {/* Remarks */}

                    <div className="mb-3">

                        <label className="form-label fw-semibold">

                            Doctor Remarks

                        </label>


                        <textarea

                            className="form-control"

                            rows="4"

                            placeholder="Additional medical remarks..."

                            value={
                                remarks
                            }

                            onChange={
                                (
                                    event
                                ) =>

                                    setRemarks(
                                        event.target.value
                                    )

                            }

                        />

                    </div>


                    {/* File */}

                    <div className="mb-4">

                        <label className="form-label fw-semibold">

                            Upload Report File

                        </label>


                        <input

                            ref={
                                fileInputRef
                            }

                            type="file"

                            className="form-control"

                            accept=".pdf,.jpg,.jpeg,.png"

                            onChange={
                                (
                                    event
                                ) =>

                                    setReportFile(

                                        event.target.files?.[0]

                                        ||

                                        null

                                    )

                            }

                        />


                        {

                            reportFile && (

                                <div className="mt-2 text-success small">

                                    Selected:

                                    {" "}

                                    {
                                        reportFile.name
                                    }

                                </div>

                            )

                        }

                    </div>


                    <button

                        type="submit"

                        className="btn btn-primary px-4"

                        disabled={
                            loading
                        }

                    >

                        {

                            loading

                                ?

                                "Saving..."

                                :

                                "Save Medical Report"

                        }

                    </button>

                </form>

            </div>

        </div>

    );

}