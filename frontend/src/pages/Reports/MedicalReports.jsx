import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    clearFeedbackMessages,
    getFeedbackMessages,
    getMedicalReports,
    sendFeedbackMessage,
} from "../../services/reportService";

import "./MedicalReports.css";
import "./PatientClinicalDocument.css";
import "./PatientClinicalDocumentOverrides.css";
import "./PatientClinicalDocumentPrintFix.css";
import "./MedicalReportsFeedback.css";

const reportMedicines = (report) => (
    Array.isArray(report?.medicines) ? report.medicines : []
);

const reportTests = (report) => (
    Array.isArray(report?.diagnostic_tests) ? report.diagnostic_tests : []
);

const isDiagnosticReport = (report) => {
    return report?.report_type === "Diagnostic"
        || Boolean(report?.diagnostic_booking_number)
        || Boolean(report?.diagnostic_test_name)
    || (Array.isArray(report?.diagnostic_tests) && report.diagnostic_tests.length > 0);
};

const isAdminDiagnosticResult = (report) => (
    isDiagnosticReport(report)
    && Boolean(report?.admin_result_published || report?.admin_managed)
);

const formatReportDate = (value) => {
    if (!value) return "N/A";
    return new Date(`${value}T00:00:00`).toLocaleDateString();
};


function MedicalReports() {


    // ======================================================
    // States
    // ======================================================

    const [
        reports,
        setReports,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        searchTerm,
        setSearchTerm,
    ] = useState("");


    const [
        selectedReport,
        setSelectedReport,
    ] = useState(null);

    const [reportView, setReportView] = useState("medical");
    const [feedbackMessages, setFeedbackMessages] = useState([]);
    const [feedbackAppointmentId, setFeedbackAppointmentId] = useState("");
    const [feedbackDraft, setFeedbackDraft] = useState("");
    const [feedbackSending, setFeedbackSending] = useState(false);

    useEffect(() => {
        if (!selectedReport) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [selectedReport]);

    // ======================================================
    // Normalize API Response
    // ======================================================

    const extractReports =
        (
            response
        ) => {

            const data =
                response?.data;


            // Direct Array
            if (
                Array.isArray(
                    data
                )
            ) {

                return data;

            }


            // { data: [...] }
            if (
                Array.isArray(
                    data?.data
                )
            ) {

                return data.data;

            }


            // { results: [...] }
            if (
                Array.isArray(
                    data?.results
                )
            ) {

                return data.results;

            }


            // { data: { results: [...] } }
            if (
                Array.isArray(
                    data?.data?.results
                )
            ) {

                return data.data.results;

            }


            // { data: { data: [...] } }
            if (
                Array.isArray(
                    data?.data?.data
                )
            ) {

                return data.data.data;

            }


            return [];

        };


    // ======================================================
    // Load Reports
    // ======================================================

    const loadReports =
        useCallback(
            async (
                isManualRefresh = false
            ) => {

                try {

                    if (
                        isManualRefresh
                    ) {

                        setRefreshing(
                            true
                        );

                    }

                    else {

                        setLoading(
                            true
                        );

                    }


                    setError(
                        ""
                    );


                    const response =
                        await getMedicalReports();


                    console.log(
                        "Medical Reports API Response:",
                        response?.data
                    );


                    const reportList =
                        extractReports(
                            response
                        );


                    console.log(
                        "Extracted Medical Reports:",
                        reportList
                    );


                    const normalizedReports = Array.isArray(reportList) ? reportList : [];
                    setReports(normalizedReports);
                    setFeedbackAppointmentId((current) => current || String(normalizedReports.find((report) => report.appointment)?.appointment || ""));
                }

                catch (
                    err
                ) {

                    console.error(
                        "Medical Reports Error:",
                        err
                    );


                    setError(

                        err?.response?.data?.detail

                        ||

                        err?.response?.data?.message

                        ||

                        "Unable to load your medical reports. Please try again."

                    );


                    setReports(
                        []
                    );

                }

                finally {

                    setLoading(
                        false
                    );


                    setRefreshing(
                        false
                    );

                }

            },

            []
        );

    const loadFeedback = useCallback(async () => {
        try {
            const response = await getFeedbackMessages();
            const messages = Array.isArray(response?.data) ? response.data : response?.data?.results || [];
            setFeedbackMessages(messages);
            setFeedbackAppointmentId((current) => current || String(messages.find((message) => message.appointment)?.appointment || ""));
        } catch (feedbackError) {
            console.error("Feedback messages error:", feedbackError);
        }
    }, []);

    // ======================================================
    // Initial Load
    // ======================================================

    useEffect(() => {

        loadReports();
        loadFeedback();

    }, [

        loadReports,
        loadFeedback,

    ]);


    // ======================================================
    // Refresh When User Returns To Tab
    // ======================================================

    useEffect(() => {

        const handleVisibilityChange =
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    loadReports(
                        true
                    );
                    loadFeedback();

                }

            };


        document.addEventListener(

            "visibilitychange",

            handleVisibilityChange

        );


        return () => {

            document.removeEventListener(

                "visibilitychange",

                handleVisibilityChange

            );

        };

    }, [

        loadReports,
        loadFeedback,

    ]);

    const sendPatientFeedback = async (event) => {
        event.preventDefault();
        const appointmentId = feedbackAppointmentId || selectedReport?.appointment;
        if (!appointmentId || !feedbackDraft.trim()) return;
        try {
            setFeedbackSending(true);
            const response = await sendFeedbackMessage(appointmentId, feedbackDraft.trim());
            setFeedbackMessages((current) => [...current, response.data]);
            setFeedbackDraft("");
        } catch (feedbackError) {
            setError(feedbackError?.response?.data?.detail || "Unable to send your reply.");
        } finally {
            setFeedbackSending(false);
        }
    };

    const handleClearFeedback = async () => {
        const patientMessageCount = feedbackMessages.filter((message) => message.sender === "Patient").length;
        if (!patientMessageCount || !window.confirm(`Clear your ${patientMessageCount} sent message${patientMessageCount === 1 ? "" : "s"}? Doctor replies will remain.`)) return;
        try {
            await clearFeedbackMessages();
            setFeedbackMessages((current) => current.filter((message) => message.sender !== "Patient"));
        } catch (feedbackError) {
            setError(feedbackError?.response?.data?.detail || "Unable to clear your messages.");
        }
    };

    // ======================================================
    // Search Reports
    // ======================================================

    const filteredReports =
        useMemo(() => {

            const searchText =
                searchTerm
                    .toLowerCase()
                    .trim();

            const typeFiltered = reports.filter((report) => {
                if (reportView === "diagnostic") return isDiagnosticReport(report) && !isAdminDiagnosticResult(report);
                if (reportView === "diagnostic-result") return isAdminDiagnosticResult(report);
                return !isDiagnosticReport(report);
            });


            if (
                !searchText
            ) {

                return typeFiltered;

            }


            return typeFiltered.filter(
                (
                    report
                ) => {

                    const searchableText =
                        [

                            report?.report_title,

                            report?.doctor_name,

                            report?.patient_name,

                            report?.for_name,

                            report?.appointment_booking,

                            report?.diagnostic_booking_number,

                            report?.diagnostic_test_name,

                            report?.prescription,

                            report?.remarks,

                            report?.report_type,

                        ]

                            .filter(
                                Boolean
                            )

                            .join(
                                " "
                            )

                            .toLowerCase();


                    return searchableText.includes(
                        searchText
                    );

                }
            );

        }, [

            reports,

            searchTerm,

            reportView,

        ]);

    // ======================================================
    // Format Date
    // ======================================================

    const formatDate =
        (
            dateValue
        ) => {

            if (
                !dateValue
            ) {

                return "N/A";

            }


            const date =
                new Date(
                    dateValue
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "N/A";

            }


            return date.toLocaleDateString(
                "en-BD",
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
    // Get Report File URL
    //
    // Priority:
    //
    // 1. report_file_url
    // 2. report_file
    // ======================================================

    const getReportFileUrl =
        (
            reportFile
        ) => {

            if (
                !reportFile
            ) {

                return null;

            }


            // Already absolute URL
            if (
                reportFile.startsWith(
                    "http"
                )
            ) {

                return reportFile;

            }


            const backendUrl =
                import.meta.env
                    ?.VITE_BACKEND_URL

                ||

                "http://127.0.0.1:8000";


            return `${backendUrl}${reportFile}`;

        };


    // ======================================================
    // Open Report File
    // ======================================================

    const handleOpenReport =
        (
            reportFile
        ) => {

            const fileUrl =
                getReportFileUrl(
                    reportFile
                );


            if (
                !fileUrl
            ) {

                alert(
                    "No report file is available for this medical report."
                );

                return;

            }


            window.open(

                fileUrl,

                "_blank",

                "noopener,noreferrer"

            );

        };

    const handleViewReport = (event, report) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedReport(report);
        setFeedbackAppointmentId(String(report.appointment || ""));
    };


    // ======================================================
    // Loading
    // ======================================================

    if (
        loading
    ) {

        return (

            <div className="medical-reports-page">

                <div className="reports-loading">

                    <div
                        className="reports-spinner"
                    />

                    <h3>

                        Loading Medical Reports...

                    </h3>

                    <p>

                        Please wait while we securely
                        retrieve your reports.

                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // Main UI
    // ======================================================

    return (

        <div className="medical-reports-page">


            {/* ==============================================
                Hero
            =============================================== */}

            <section className="reports-hero">

                <div className="reports-hero-content">

                    <div className="reports-badge">

                        📋 HEALTH RECORDS

                    </div>


                    <h1>

                        Medical Reports

                    </h1>


                    <p>

                        Access your medical reports,
                        prescriptions and doctor remarks
                        securely in one place.

                    </p>


                    <div className="reports-stats">


                        <div className="report-stat">

                            <strong>

                                {reports.length}

                            </strong>

                            <span>

                                Total Reports

                            </span>

                        </div>


                        <div className="report-stat">

                            <strong>

                                Secure

                            </strong>

                            <span>

                                Private Records

                            </span>

                        </div>


                        <div className="report-stat">

                            <strong>

                                24/7

                            </strong>

                            <span>

                                Easy Access

                            </span>

                        </div>

                    </div>

                </div>


                <div className="reports-hero-visual">

                    <div className="report-big-icon">

                        📄

                    </div>


                    <div className="report-floating-card card-one">

                        🩺 Doctor Report

                    </div>


                    <div className="report-floating-card card-two">

                        ✓ Secure Record

                    </div>

                </div>

            </section>


            {/* ==============================================
                Content
            =============================================== */}

            <div className="reports-content">


                {/* Error */}

                {error && (

                    <div className="alert alert-danger d-flex justify-content-between align-items-center gap-3">

                        <span>

                            {error}

                        </span>


                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                                loadReports(
                                    true
                                )
                            }
                        >

                            Try Again

                        </button>

                    </div>

                )}


                {/* Heading */}

                <div className="reports-section-heading">

                    <div>

                        <span>

                            MY HEALTH DOCUMENTS

                        </span>


                        <h2>

                            Your Medical History

                        </h2>

                        <div className="reports-category-row">
                            <div className="reports-view-tabs" role="tablist" aria-label="Report categories">
                                <button type="button" className={reportView === "medical" ? "active" : ""} onClick={() => setReportView("medical")}>Medical Reports</button>
                                <button type="button" className={reportView === "diagnostic" ? "active" : ""} onClick={() => setReportView("diagnostic")}>Diagnostic Tests</button>
                                <button type="button" className={reportView === "diagnostic-result" ? "active" : ""} onClick={() => setReportView("diagnostic-result")}>Diagnostic Test Result</button>
                            </div>
                        </div>


                        <p>

                            View your reports,
                            prescriptions and important
                            medical information.

                        </p>

                    </div>


                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        disabled={
                            refreshing
                        }
                        onClick={() =>
                            loadReports(
                                true
                            )
                        }
                    >

                        {
                            refreshing

                                ?

                                "Refreshing..."

                                :

                                "↻ Refresh"
                        }

                    </button>

                </div>


                {/* Search */}

                <div className="reports-toolbar">

                    <div className="reports-search-box">

                        <span>

                            🔍

                        </span>


                        <input
                            type="text"
                            placeholder="Search by report, doctor or booking number..."
                            value={
                                searchTerm
                            }
                            onChange={(
                                event
                            ) =>

                                setSearchTerm(
                                    event.target.value
                                )

                            }
                        />

                    </div>


                    <div className="reports-count">

                        <strong>

                            {
                                filteredReports.length
                            }

                        </strong>


                        <span>

                            Report
                            {
                                filteredReports.length !==
                                1

                                    ?

                                    "s"

                                    :

                                    ""
                            }

                        </span>

                    </div>

                </div>


                {/* Empty */}

                {
                    filteredReports.length ===
                    0

                        ?

                        (

                            <div className="reports-empty">

                                <div className="reports-empty-icon">

                                    📂

                                </div>


                                <h3>

                                    {
                                        searchTerm

                                            ?

                                            "No Matching Reports"

                                            :

                                            "No Medical Reports Yet"
                                    }

                                </h3>


                                <p>

                                    {
                                        searchTerm

                                            ?

                                            "Try searching with another keyword."

                                            :

                                            "Your medical reports and prescriptions will appear here after they are created by your doctor."
                                    }

                                </p>


                                <button
                                    type="button"
                                    onClick={() =>
                                        loadReports(
                                            true
                                        )
                                    }
                                >

                                    Refresh Reports

                                </button>

                            </div>

                        )

                        :

                        (

                            <div className="reports-grid">

                                {
                                    filteredReports.map(
                                        (
                                            report
                                        ) => (

                                            <article
                                                className="medical-report-card"
                                                key={
                                                    report.id
                                                }
                                            >


                                                {/* Header */}

                                                <div className="report-card-header">

                                                    <div className="report-file-icon">

                                                        📄

                                                    </div>


                                                    <div className="report-upload-date">

                                                        <span>

                                                            Uploaded

                                                        </span>


                                                        <strong>

                                                            {
                                                                formatDate(
                                                                    report.uploaded_at
                                                                )
                                                            }

                                                        </strong>

                                                    </div>

                                                </div>


                                                {/* Title */}

                                                <h3>

                                                    {
                                                        report.report_title

                                                        ||

                                                        "Medical Report"
                                                    }

                                                </h3>

                                                <span className="report-source-badge">
                                                    {report.diagnostic_booking_number
                                                        ? "Diagnostic Test Report"
                                                        : "Doctor Appointment Report"}
                                                </span>


                                                {/* Doctor */}

                                                <div className="report-doctor">

                                                    <div className="doctor-avatar">

                                                        🩺

                                                    </div>


                                                    <div>

                                                        <small>

                                                            Prepared By

                                                        </small>


                                                        <strong>

                                                            {
                                                                report.doctor_name

                                                                ||

                                                                "Doctor"
                                                            }

                                                        </strong>

                                                    </div>

                                                </div>


                                                {/* Medical Appointment Booking */}

                                                {
                                                    report.appointment_booking && (

                                                        <div className="report-booking-info">

                                                            <span>

                                                                Appointment

                                                            </span>


                                                            <strong>

                                                                #

                                                                {
                                                                    report.appointment_booking
                                                                }

                                                            </strong>

                                                        </div>

                                                    )
                                                }


                                                {/* Diagnostic Booking */}

                                                {
                                                    report.diagnostic_booking_number && (

                                                        <div className="report-booking-info">

                                                            <span>

                                                                Diagnostic

                                                            </span>


                                                            <strong>

                                                                #

                                                                {
                                                                    report.diagnostic_booking_number
                                                                }

                                                            </strong>

                                                        </div>

                                                    )
                                                }


                                                {/* Prescription */}

                                                <div className="report-preview-slot">
                                                    {
                                                        report.prescription && (

                                                        <div className="report-preview">

                                                            <small>

                                                                PRESCRIPTION

                                                            </small>


                                                            <p>

                                                                {
                                                                    report.prescription
                                                                }

                                                            </p>

                                                        </div>

                                                        )
                                                    }


                                                    {/* Remarks Preview */}

                                                    {
                                                        !report.prescription

                                                        &&

                                                        report.remarks

                                                        && (

                                                        <div className="report-preview">

                                                            <small>

                                                                DOCTOR REMARKS

                                                            </small>


                                                            <p>

                                                                {
                                                                    report.remarks
                                                                }

                                                            </p>

                                                        </div>

                                                        )
                                                    }

                                                    {!report.prescription && !report.remarks && (
                                                        <div className="report-preview report-preview-placeholder">
                                                            <small>REPORT CONTENT</small>
                                                            <p>No prescription or remarks attached.</p>
                                                        </div>
                                                    )}

                                                    {isDiagnosticReport(report) && report.diagnostic_result && (
                                                        <div className="report-preview diagnostic-result-preview">
                                                            <small>DIAGNOSTIC TEST RESULT</small>
                                                            <p>{report.diagnostic_result}</p>
                                                        </div>
                                                    )}
                                                </div>


                                                {/* Actions */}

                                                <div className="report-card-actions">

                                                    <button
                                                        type="button"
                                                        className="view-report-button"
                                                        onClick={(event) => handleViewReport(event, report)}
                                                        aria-label={`View ${report.report_title || "medical report"}`}
                                                    >

                                                        <span>

                                                            View Details

                                                        </span>


                                                        <span>

                                                            →

                                                        </span>

                                                    </button>


                                                    {
                                                        (
                                                            report.report_file_url

                                                            ||

                                                            report.report_file
                                                        )

                                                        &&

                                                        (

                                                            <button
                                                                type="button"
                                                                className="open-file-button"
                                                                onClick={() =>

                                                                    handleOpenReport(

                                                                        report.report_file_url

                                                                        ||

                                                                        report.report_file

                                                                    )

                                                                }
                                                            >

                                                                Open File

                                                            </button>

                                                        )
                                                    }

                                                </div>

                                            </article>

                                        )

                                    )
                                }

                            </div>

                        )

                }

            </div>


            <section className="reports-feedback-panel reports-feedback-panel-page">
                <div className="reports-feedback-heading">
                    <div>
                        <span className="reports-section-label">Patient care conversation</span>
                        <h2>Questions for your doctor</h2>
                        <p>Choose a report appointment to read replies or send a follow-up message.</p>
                    </div>
                    <span className="reports-feedback-count">{feedbackMessages.length} messages</span>
                </div>
                <form className="reports-feedback-composer" onSubmit={sendPatientFeedback}>
                    <div className="reports-feedback-selector">
                        <label htmlFor="report-feedback-appointment">Appointment / report</label>
                        <select id="report-feedback-appointment" value={feedbackAppointmentId} onChange={(event) => { setFeedbackAppointmentId(event.target.value); setFeedbackDraft(""); }} required>
                            <option value="">Select an appointment</option>
                            {[
                                ...reports.filter((report) => report.appointment).map((report) => ({ id: String(report.appointment), label: `${report.report_title || "Medical report"} · ${report.appointment_booking || "Appointment"}` })),
                                ...feedbackMessages.filter((message) => message.appointment).map((message) => ({ id: String(message.appointment), label: message.appointment_booking || `Appointment #${message.appointment}` })),
                            ].filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                        </select>
                    </div>
                    <textarea value={feedbackDraft} onChange={(event) => setFeedbackDraft(event.target.value)} rows="3" placeholder="Share follow-up guidance, test preparation, or a question..." required />
                    <button type="submit" disabled={feedbackSending || !feedbackAppointmentId}>{feedbackSending ? "Sending..." : "Send feedback"}<i className="fas fa-paper-plane" /></button>
                </form>
                <div className="reports-feedback-history-heading">
                    <strong>Conversation history</strong>
                    <button type="button" onClick={handleClearFeedback} disabled={!feedbackMessages.some((message) => message.sender === "Patient")}><i className="fas fa-trash-alt" /> Clear my messages</button>
                </div>
                <div className="reports-feedback-thread">
                    {!feedbackAppointmentId ? <p className="reports-feedback-empty">Select an appointment to view its conversation.</p> : feedbackMessages.filter((message) => String(message.appointment) === String(feedbackAppointmentId)).length === 0 ? <p className="reports-feedback-empty">No messages for this appointment yet.</p> : feedbackMessages.filter((message) => String(message.appointment) === String(feedbackAppointmentId)).map((message) => <article className={`reports-feedback-message ${message.sender === "Patient" ? "patient" : "doctor"}`} key={message.id}><strong>{message.sender === "Patient" ? "You" : message.doctor_name || "Doctor"}</strong><small>{new Date(message.created_at).toLocaleString()}</small><p>{message.message}</p></article>)}
                </div>
            </section>

            {/* ==============================================
                Report Details Modal
            =============================================== */}

            {
                selectedReport && (

                    <div
                        className="report-modal-overlay"
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99999,
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            padding: "96px 20px 32px",
                            overflow: "auto",
                            background: "#eef4f5",
                            backdropFilter: "none",
                        }}
                        onClick={() =>

                            setSelectedReport(
                                null
                            )

                        }
                    >

                        <div
                            className="report-modal"
                            style={{
                                position: "relative",
                                zIndex: 1,
                                width: "min(880px, 100%)",
                                height: "calc(100vh - 128px)",
                                maxHeight: "calc(100vh - 128px)",
                                overflowY: "scroll",
                                margin: 0,
                                background: "#fff",
                            }}
                            onClick={(
                                event
                            ) =>

                                event.stopPropagation()

                            }
                        >


                            {/* Header */}

                            <div className="report-modal-header">

                                <div>

                                    <span>

                                        {
                                            selectedReport.report_type
                                                ?.toUpperCase()

                                            ||

                                            "MEDICAL REPORT"
                                        }

                                    </span>


                                    <h2>

                                        {
                                            selectedReport.report_title

                                            ||

                                            "Medical Report"
                                        }

                                    </h2>

                                    {(selectedReport.report_file_url || selectedReport.report_file) && <button
                                        type="button"
                                        className="report-header-file-button"
                                        onClick={() => handleOpenReport(selectedReport.report_file_url || selectedReport.report_file)}
                                    >
                                        <span aria-hidden="true">📎</span>
                                        <span>Open uploaded file</span>
                                    </button>}

                                </div>


                                <div className="report-modal-actions">
                                    <button
                                        type="button"
                                        className="modal-print-button"
                                        onClick={() => window.print()}
                                    >
                                        <i className="fas fa-print" /> Print / Download PDF
                                    </button>

                                    <button
                                        type="button"
                                        className="modal-close-button"
                                        onClick={() => setSelectedReport(null)}
                                    >
                                        <i className="fas fa-arrow-left" /> Back
                                    </button>
                                </div>

                            </div>


                            <article className="patient-clinical-document">
                                <header className="patient-clinical-header">
                                    <div>
                                        <h3>{selectedReport.doctor_profile?.name || selectedReport.doctor_name || "Attending Doctor"}</h3>
                                        <p>{selectedReport.doctor_profile?.qualification || "Medical Consultant"} | {selectedReport.doctor_profile?.designation || "Consultant Physician"}</p>
                                        <small>{selectedReport.doctor_profile?.department || "General Medicine"} | Reg. No: {selectedReport.doctor_profile?.registration_no || "N/A"}</small>
                                    </div>
                                    <div className="patient-clinical-contact">
                                        <p className="patient-clinical-kicker">{selectedReport.doctor_profile?.clinic_name || "MediCare Connect"}</p>
                                        <strong className="patient-clinical-report-type">{isDiagnosticReport(selectedReport) ? "DIAGNOSTIC RESULT" : "MEDICAL PRESCRIPTION"}</strong>
                                        <span>{selectedReport.doctor_profile?.phone || "N/A"}</span>
                                        <span>{selectedReport.doctor_profile?.email || "N/A"}</span>
                                        <span>Chamber: MediCare Connect Clinic</span>
                                    </div>
                                </header>

                                <div className="patient-clinical-patient-grid">
                                    <div><span>Patient</span><strong>{selectedReport.patient_name || "N/A"}</strong></div>
                                    <div><span>Age / Gender</span><strong>{selectedReport.patient_profile?.age || "N/A"} / {selectedReport.patient_profile?.gender || "N/A"}</strong></div>
                                    <div><span>Date</span><strong>{formatReportDate(selectedReport.uploaded_at?.slice(0, 10))}</strong></div>
                                    <div><span>OPD / Booking No.</span><strong>{selectedReport.appointment_booking || selectedReport.diagnostic_booking_number || "N/A"}</strong></div>
                                    <div><span>Blood Group</span><strong>{selectedReport.patient_profile?.blood_group || "N/A"}</strong></div>
                                </div>

                                {isDiagnosticReport(selectedReport) ? (
                                    <section className="patient-clinical-body patient-diagnostic-document">
                                        <div className="patient-document-title"><span>LABORATORY & RADIOLOGY</span><h4>Investigations Requested</h4></div>
                                        {reportTests(selectedReport).length > 0 ? (
                                            <div className="patient-test-table">
                                                <div className="patient-test-table-head"><span>Test / Investigation</span><span>Priority</span><span>Instructions</span></div>
                                                {reportTests(selectedReport).map((test, index) => <div className="patient-test-table-row" key={`${test.name}-${index}`}><strong>{index + 1}. {test.name}</strong><span className={`patient-test-priority ${String(test.urgency || "Routine").toLowerCase()}`}>{test.urgency || "Routine"}</span><span>{test.instructions || "As advised by laboratory."}</span></div>)}
                                            </div>
                                        ) : selectedReport.diagnostic_test_name ? <p className="patient-document-note">{selectedReport.diagnostic_test_name}</p> : <p className="patient-document-note">No structured tests were attached to this report.</p>}
                                        <div className="patient-document-note-block"><strong>Clinical Notes / Result</strong><p>{selectedReport.diagnostic_result || "No result or clinical note has been added yet."}</p></div>
                                    </section>
                                ) : (
                                    <section className="patient-clinical-body patient-prescription-document patient-prescription-history">
                                        <aside className="patient-prescription-sidebar">
                                            <h4>Clinical Notes</h4><strong>Chief Complaints</strong><p>{selectedReport.symptoms || "Not provided"}</p>
                                            <strong>History / Diagnosis</strong><p>{selectedReport.clinical_history || "Not provided"}</p>
                                            <strong>Vital Signs</strong><p>{Object.entries(selectedReport.vitals || {}).filter(([, value]) => value).map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`).join(" | ") || "Not recorded"}</p>
                                        </aside>
                                        <main className="patient-prescription-main"><div className="patient-rx-symbol">Rx</div><h4>Medication Plan</h4>{reportMedicines(selectedReport).length > 0 ? <div className="patient-medicine-table"><div className="patient-medicine-head"><span>Medicine</span><span>Dosage & Frequency</span><span>Timing</span><span>Duration</span></div>{reportMedicines(selectedReport).map((medicine, index) => <div className="patient-medicine-row" key={`${medicine.name}-${index}`}><strong>{index + 1}. {medicine.name}</strong><span>{medicine.dosage || "As directed"}<br />{medicine.frequency || "As prescribed"}</span><span>{medicine.timing || "Any time"}</span><span>{medicine.duration || "As advised"}</span>{medicine.instructions && <small>{medicine.instructions}</small>}</div>)}</div> : <p className="patient-document-note">No structured medicines were attached.</p>}<h4>Advice & Follow-up</h4><p className="patient-document-note">{selectedReport.advice || selectedReport.remarks || "Follow the doctor's instructions carefully."}</p>{selectedReport.follow_up_date && <p className="patient-follow-up"><strong>Follow-up date:</strong> {formatReportDate(selectedReport.follow_up_date)}</p>}</main>
                                    </section>
                                )}
                                <footer className="patient-clinical-footer"><span>Valid for 30 days<br />Powered by MediCare</span><div>Doctor's Signature<br /><strong>{selectedReport.doctor_name || "Attending Doctor"}</strong></div></footer>
                            </article>

                            {/* Diagnostic Test */}

                            {
                                selectedReport.diagnostic_test_name && !reportTests(selectedReport).length && (

                                    <div className="modal-report-section">

                                        <h4>

                                            🧪 Diagnostic Test

                                        </h4>


                                        <p>

                                            {
                                                selectedReport.diagnostic_test_name
                                            }

                                        </p>

                                    </div>

                                )
                            }


                            {/* Prescription */}

                            {
                                selectedReport.prescription && !reportMedicines(selectedReport).length && (

                                    <div className="modal-report-section">

                                        <h4>

                                            💊 Prescription

                                        </h4>


                                        <p
                                            style={{
                                                whiteSpace:
                                                    "pre-wrap",
                                            }}
                                        >

                                            {
                                                selectedReport.prescription
                                            }

                                        </p>

                                    </div>

                                )
                            }


                            {/* Remarks */}

                            {
                                    selectedReport.remarks && !reportMedicines(selectedReport).length && !isDiagnosticReport(selectedReport) && (

                                    <div className="modal-report-section">

                                        <h4>

                                            📝 Doctor Remarks

                                        </h4>


                                        <p
                                            style={{
                                                whiteSpace:
                                                    "pre-wrap",
                                            }}
                                        >

                                            {
                                                selectedReport.remarks
                                            }

                                        </p>

                                    </div>

                                )
                            }


                        </div>

                    </div>

                )
            }

        </div>

    );

}


export default MedicalReports;