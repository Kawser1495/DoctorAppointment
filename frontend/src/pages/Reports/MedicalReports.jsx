import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getMedicalReports,
} from "../../services/reportService";
import { BACKEND_URL } from "../../config";

import "./MedicalReports.css";


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


                    setReports(

                        Array.isArray(
                            reportList
                        )

                            ?

                            reportList

                            :

                            []

                    );

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


    // ======================================================
    // Initial Load
    // ======================================================

    useEffect(() => {

        loadReports();

    }, [

        loadReports,

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

    ]);


    // ======================================================
    // Search Reports
    // ======================================================

    const filteredReports =
        useMemo(() => {

            const searchText =
                searchTerm
                    .toLowerCase()
                    .trim();


            if (
                !searchText
            ) {

                return reports;

            }


            return reports.filter(
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


            const backendUrl = BACKEND_URL;


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


            {/* ==============================================
                Report Details Modal
            =============================================== */}

            {
                selectedReport && (

                    <div
                        className="report-modal-overlay"
                        onClick={() =>

                            setSelectedReport(
                                null
                            )

                        }
                    >

                        <div
                            className="report-modal"
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

                                </div>


                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={() =>

                                        setSelectedReport(
                                            null
                                        )

                                    }
                                >

                                    ×

                                </button>

                            </div>


                            {/* Information */}

                            <div className="report-modal-info">


                                {/* Doctor */}

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

                                                ||

                                                "N/A"
                                            }

                                        </strong>

                                    </div>

                                </div>


                                {/* Uploaded */}

                                <div className="modal-info-item">

                                    <span>

                                        📅

                                    </span>


                                    <div>

                                        <small>

                                            Uploaded

                                        </small>


                                        <strong>

                                            {
                                                formatDate(
                                                    selectedReport.uploaded_at
                                                )
                                            }

                                        </strong>

                                    </div>

                                </div>


                                {/* Booking */}

                                <div className="modal-info-item">

                                    <span>

                                        🔖

                                    </span>


                                    <div>

                                        <small>

                                            {
                                                selectedReport.appointment_booking

                                                    ?

                                                    "Appointment"

                                                    :

                                                    "Diagnostic Booking"
                                            }

                                        </small>


                                        <strong>

                                            #

                                            {
                                                selectedReport.appointment_booking

                                                ||

                                                selectedReport.diagnostic_booking_number

                                                ||

                                                "N/A"
                                            }

                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* Diagnostic Test */}

                            {
                                selectedReport.diagnostic_test_name && (

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
                                selectedReport.prescription && (

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
                                selectedReport.remarks && (

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


                            {/* File */}

                            {
                                (
                                    selectedReport.report_file_url

                                    ||

                                    selectedReport.report_file
                                )

                                &&

                                (

                                    <button
                                        type="button"
                                        className="modal-open-file"
                                        onClick={() =>

                                            handleOpenReport(

                                                selectedReport.report_file_url

                                                ||

                                                selectedReport.report_file

                                            )

                                        }
                                    >

                                        📎 Open Medical Report File

                                    </button>

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