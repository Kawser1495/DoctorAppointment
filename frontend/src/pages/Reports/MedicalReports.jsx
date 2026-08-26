import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getMedicalReports,
} from "../../services/reportService";

import "./MedicalReports.css";


function MedicalReports() {


    // ======================================================
    // States
    // ======================================================

    const [reports, setReports] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [selectedReport, setSelectedReport] =
        useState(null);


    // ======================================================
    // Load Reports
    // ======================================================

    useEffect(() => {

        const loadReports = async () => {

            try {

                setLoading(true);

                setError("");

                const response =
                    await getMedicalReports();


                setReports(

                    Array.isArray(response)
                        ? response
                        : response.results || []

                );

            }

            catch (err) {

                console.error(
                    "Medical Reports Error:",
                    err
                );

                setError(
                    "Unable to load your medical reports. Please try again."
                );

            }

            finally {

                setLoading(false);

            }

        };


        loadReports();

    }, []);


    // ======================================================
    // Search Reports
    // ======================================================

    const filteredReports = useMemo(() => {

        const searchText =
            searchTerm.toLowerCase().trim();


        if (!searchText) {

            return reports;

        }


        return reports.filter(
            (report) => {

                return (

                    report.report_title
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    report.doctor_name
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    report.appointment_booking
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    report.prescription
                        ?.toLowerCase()
                        .includes(searchText)

                );

            }
        );

    }, [

        reports,
        searchTerm,

    ]);


    // ======================================================
    // Format Date
    // ======================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {

            return "N/A";

        }


        return new Date(
            dateValue
        ).toLocaleDateString(
            "en-BD",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );

    };


    // ======================================================
    // Open Report File
    // ======================================================

    const handleOpenReport = (
        reportFile
    ) => {

        if (!reportFile) {

            alert(
                "No report file is available for this medical report."
            );

            return;

        }


        const fileUrl =
            reportFile.startsWith("http")
                ? reportFile
                : `http://127.0.0.1:8000${reportFile}`;


        window.open(
            fileUrl,
            "_blank"
        );

    };


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="medical-reports-page">

                <div className="reports-loading">

                    <div className="reports-spinner"></div>

                    <h3>
                        Loading Medical Reports...
                    </h3>

                    <p>
                        Please wait while we securely retrieve your reports.
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

            <div className="medical-reports-page">

                <div className="reports-error">

                    <div className="reports-error-icon">

                        ⚠

                    </div>

                    <h3>
                        Unable to Load Reports
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                    >

                        Try Again

                    </button>

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


                {/* Heading */}

                <div className="reports-section-heading">

                    <div>

                        <span>
                            MY HEALTH DOCUMENTS
                        </span>

                        <h2>
                            Your Medical History
                        </h2>

                        <p>

                            View your reports, prescriptions
                            and important medical information.

                        </p>

                    </div>

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
                            value={searchTerm}
                            onChange={(event) =>

                                setSearchTerm(
                                    event.target.value
                                )

                            }
                        />

                    </div>


                    <div className="reports-count">

                        <strong>
                            {filteredReports.length}
                        </strong>

                        <span>
                            Report
                            {filteredReports.length !== 1
                                ? "s"
                                : ""
                            }
                        </span>

                    </div>

                </div>


                {/* ==========================================
                    Empty State
                =========================================== */}

                {filteredReports.length === 0 ? (

                    <div className="reports-empty">

                        <div className="reports-empty-icon">

                            📂

                        </div>


                        <h3>

                            {searchTerm
                                ? "No Matching Reports"
                                : "No Medical Reports Yet"
                            }

                        </h3>


                        <p>

                            {searchTerm
                                ? "Try searching with another keyword."
                                : "Your medical reports will appear here after they are uploaded by your healthcare provider."
                            }

                        </p>


                        {searchTerm && (

                            <button
                                type="button"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                            >

                                Clear Search

                            </button>

                        )}

                    </div>

                ) : (


                    /* ==========================================
                        Report Grid
                    =========================================== */

                    <div className="reports-grid">


                        {filteredReports.map(
                            (report) => (

                                <article
                                    className="medical-report-card"
                                    key={report.id}
                                >


                                    {/* Card Header */}

                                    <div className="report-card-header">


                                        <div className="report-file-icon">

                                            📄

                                        </div>


                                        <div className="report-upload-date">

                                            <span>
                                                Uploaded
                                            </span>

                                            <strong>

                                                {formatDate(
                                                    report.uploaded_at
                                                )}

                                            </strong>

                                        </div>

                                    </div>


                                    {/* Title */}

                                    <h3>

                                        {report.report_title}

                                    </h3>


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

                                                {report.doctor_name}

                                            </strong>

                                        </div>

                                    </div>


                                    {/* Booking */}

                                    {report.appointment_booking && (

                                        <div className="report-booking-info">

                                            <span>
                                                Appointment
                                            </span>

                                            <strong>

                                                #
                                                {report.appointment_booking}

                                            </strong>

                                        </div>

                                    )}


                                    {/* Prescription Preview */}

                                    {report.prescription && (

                                        <div className="report-preview">

                                            <small>
                                                PRESCRIPTION
                                            </small>

                                            <p>

                                                {report.prescription}

                                            </p>

                                        </div>

                                    )}


                                    {/* Actions */}

                                    <div className="report-card-actions">


                                        <button
                                            type="button"
                                            className="view-report-button"
                                            onClick={() =>
                                                setSelectedReport(
                                                    report
                                                )
                                            }
                                        >

                                            <span>

                                                View Details

                                            </span>

                                            <span>

                                                →

                                            </span>

                                        </button>


                                        {report.report_file && (

                                            <button
                                                type="button"
                                                className="open-file-button"
                                                onClick={() =>
                                                    handleOpenReport(
                                                        report.report_file
                                                    )
                                                }
                                            >

                                                Open File

                                            </button>

                                        )}

                                    </div>

                                </article>

                            )

                        )}

                    </div>

                )}

            </div>


            {/* ==============================================
                Report Details Modal
            =============================================== */}

            {selectedReport && (

                <div
                    className="report-modal-overlay"
                    onClick={() =>
                        setSelectedReport(null)
                    }
                >

                    <div
                        className="report-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* Modal Header */}

                        <div className="report-modal-header">

                            <div>

                                <span>
                                    MEDICAL REPORT
                                </span>

                                <h2>

                                    {
                                        selectedReport.report_title
                                    }

                                </h2>

                            </div>


                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={() =>
                                    setSelectedReport(null)
                                }
                            >

                                ×

                            </button>

                        </div>


                        {/* Modal Information */}

                        <div className="report-modal-info">


                            <div className="modal-info-item">

                                <span>
                                    👨‍⚕️
                                </span>

                                <div>

                                    <small>
                                        Doctor
                                    </small>

                                    <strong>

                                        {
                                            selectedReport.doctor_name
                                        }

                                    </strong>

                                </div>

                            </div>


                            <div className="modal-info-item">

                                <span>
                                    📅
                                </span>

                                <div>

                                    <small>
                                        Uploaded
                                    </small>

                                    <strong>

                                        {formatDate(
                                            selectedReport.uploaded_at
                                        )}

                                    </strong>

                                </div>

                            </div>


                            <div className="modal-info-item">

                                <span>
                                    🔖
                                </span>

                                <div>

                                    <small>
                                        Appointment
                                    </small>

                                    <strong>

                                        #
                                        {
                                            selectedReport.appointment_booking ||
                                            "N/A"
                                        }

                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* Prescription */}

                        {selectedReport.prescription && (

                            <div className="modal-report-section">

                                <h4>

                                    💊 Prescription

                                </h4>

                                <p>

                                    {
                                        selectedReport.prescription
                                    }

                                </p>

                            </div>

                        )}


                        {/* Remarks */}

                        {selectedReport.remarks && (

                            <div className="modal-report-section">

                                <h4>

                                    📝 Doctor Remarks

                                </h4>

                                <p>

                                    {
                                        selectedReport.remarks
                                    }

                                </p>

                            </div>

                        )}


                        {/* File */}

                        {selectedReport.report_file && (

                            <button
                                type="button"
                                className="modal-open-file"
                                onClick={() =>
                                    handleOpenReport(
                                        selectedReport.report_file
                                    )
                                }
                            >

                                📎 Open Medical Report File

                            </button>

                        )}

                    </div>

                </div>

            )}


        </div>

    );

}


export default MedicalReports;