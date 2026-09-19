import { useEffect, useMemo, useState } from "react";
import DoctorLayout from "../../layouts/DoctorLayout";
import { getDoctorReports } from "../../services/reportService";
import "./DoctorPrescriptions.css";

const listFrom = (response) => (
    Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.results)
        ? response.data.results
        : []
);

const isDiagnosticReport = (report) => (
    report?.report_type === "Diagnostic"
    || Boolean(report?.diagnostic_booking_number)
    || Boolean(report?.diagnostic_test_name)
    || Boolean(report?.diagnostic_result)
);

const isAdminDiagnosticResult = (report) => (
    isDiagnosticReport(report)
    && Boolean(report?.diagnostic_result || report?.report_file_url || report?.report_file)
    && (
        Boolean(report?.admin_result_published)
        || Boolean(report?.diagnostic_booking_number || report?.test_booking)
        || !(Array.isArray(report?.diagnostic_tests) && report.diagnostic_tests.length)
    )
);

const getReportFileUrl = (report) => {
    const file = report?.report_file_url || report?.report_file;
    if (!file) return null;
    if (file.startsWith("http")) return file;
    return `http://127.0.0.1:8000${file}`;
};

const dateText = (value) => value
    ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "Not available";

function FullReportModal({ report, onClose }) {
    const diagnostic = isDiagnosticReport(report);
    const medicines = Array.isArray(report.medicines) ? report.medicines : [];
    const tests = Array.isArray(report.diagnostic_tests) ? report.diagnostic_tests : [];

    return <div className="doctor-report-view-overlay doctor-report-full-overlay" onClick={onClose}>
        <div className="doctor-report-view-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="doctor-report-view-close" onClick={onClose} aria-label="Close">×</button>
            <header className="doctor-report-document-header"><div><p className="doctor-report-clinic-name">MediCare Connect Clinic</p><small>Clinical documentation</small></div><div className="doctor-report-doctor-name"><strong>Doctor's Medical Record</strong><span>{report.doctor_name || "Attending Doctor"}</span></div></header>
            <p className="doctor-prescriptions__eyebrow">{diagnostic ? "Diagnostic Test Prescription" : "Medical Prescription"}</p>
            <h2>{report.report_title || "Medical Report"}</h2>
            <div className="doctor-report-meta"><span><b>Patient</b>{report.patient_name || "Patient"}</span><span><b>Date</b>{dateText(report.uploaded_at)}</span><span><b>Booking</b>{report.appointment_booking || "Not available"}</span><span><b>Report type</b>{diagnostic ? "Diagnostic test" : "Prescription"}</span></div>
            {report.symptoms && <><h3>Symptoms</h3><p className="doctor-report-view-copy">{report.symptoms}</p></>}
            {report.clinical_history && <><h3>Clinical history</h3><p className="doctor-report-view-copy">{report.clinical_history}</p></>}
            {diagnostic ? <><h3>Diagnostic tests</h3>{tests.length ? <div className="doctor-report-tests">{tests.map((test, index) => <div key={`${test.name}-${index}`}><strong>{test.name}</strong><span>{test.urgency || "Routine"}</span><p>{test.instructions || "No special instructions."}</p></div>)}</div> : <p className="doctor-report-view-copy">{report.diagnostic_test_name || "No test details attached."}</p>}<h3>Diagnostic details</h3><p className="doctor-report-view-copy">{report.diagnostic_result || "No diagnostic result has been added."}</p></> : <><h3>Full prescription</h3>{medicines.length ? <div className="doctor-medicine-table"><div className="doctor-medicine-table-head"><span>Medicine</span><span>Dosage & frequency</span><span>Timing</span><span>Duration</span></div>{medicines.map((medicine, index) => <div className="doctor-medicine-table-row" key={`${medicine.name}-${index}`}><strong>{medicine.name}</strong><span>{medicine.dosage || "As directed"}<br />{medicine.frequency || "As prescribed"}</span><span>{medicine.timing || "Any time"}</span><span>{medicine.duration || "As advised"}{medicine.instructions && <small>{medicine.instructions}</small>}</span></div>)}</div> : <p className="doctor-report-view-copy">{report.prescription || "No prescription details attached."}</p>}</>}
            {report.advice && <><h3>Advice</h3><p className="doctor-report-view-copy">{report.advice}</p></>}
            {report.follow_up_date && <p className="doctor-report-follow-up"><b>Follow-up:</b> {dateText(report.follow_up_date)}</p>}
            {report.remarks && <><h3>Doctor notes</h3><p className="doctor-report-view-copy">{report.remarks}</p></>}
            {getReportFileUrl(report) && <a className="doctor-report-file-button" href={getReportFileUrl(report)} target="_blank" rel="noreferrer"><i className="fas fa-paperclip" /> Open uploaded result file</a>}
            <footer className="doctor-report-document-footer"><span>Powered by MediCare Connect</span><span>Doctor's Signature<br /><strong>{report.doctor_name || "Attending Doctor"}</strong></span></footer>
        </div>
    </div>;
}

export default function DoctorMedicalReports() {
    const [reports, setReports] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);
    const [activeView, setActiveView] = useState("medical");

    useEffect(() => {
        getDoctorReports()
            .then((response) => setReports(listFrom(response)))
            .catch(() => setError("Unable to load medical reports."))
            .finally(() => setLoading(false));
    }, []);

    const visibleReports = useMemo(() => reports.filter((report) => {
        if (activeView === "diagnostic") return isDiagnosticReport(report) && !isAdminDiagnosticResult(report);
        if (activeView === "diagnostic-result") return isAdminDiagnosticResult(report);
        return !isDiagnosticReport(report);
    }), [activeView, reports]);

    const filteredReports = visibleReports.filter((report) => {
        const query = search.trim().toLowerCase();
        return !query || [report.patient_name, report.report_title, report.diagnostic_test_name, report.diagnostic_result]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);
    });

    return (
        <DoctorLayout>
            <div className="doctor-prescriptions">
                <header className="doctor-prescriptions__header">
                    <div>
                        <p className="doctor-prescriptions__eyebrow">Clinical documentation</p>
                        <h1 className="doctor-prescriptions__title">Medical Reports</h1>
                        <p className="doctor-prescriptions__subtitle">Your medical reports and diagnostic results shared for your patients.</p>
                    </div>
                </header>
                {error && <div className="doctor-prescriptions__alert error">{error}</div>}
                <section className="doctor-prescriptions__list-card">
                    <div className="doctor-medical-tabs" role="tablist" aria-label="Medical report categories">
                        <button type="button" className={activeView === "medical" ? "active" : ""} onClick={() => setActiveView("medical")}>Medical Reports</button>
                        <button type="button" className={activeView === "diagnostic" ? "active" : ""} onClick={() => setActiveView("diagnostic")}>Diagnostic Tests</button>
                        <button type="button" className={activeView === "diagnostic-result" ? "active" : ""} onClick={() => setActiveView("diagnostic-result")}>Diagnostic Test Result</button>
                    </div>
                    <div className="doctor-prescriptions__list-header">
                        <div><p className="doctor-prescriptions__eyebrow">{activeView === "diagnostic-result" ? "Admin shared results" : "Doctor appointment records"}</p><h2>{activeView === "medical" ? "Medical Reports" : activeView === "diagnostic" ? "Diagnostic Tests" : "Diagnostic Test Results"}</h2></div>
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patient or report" />
                    </div>
                    {loading ? <div className="doctor-prescriptions__loading">Loading medical reports...</div> : filteredReports.length === 0 ? (
                        <div className="doctor-prescriptions__empty"><i className="fas fa-file-medical" /><strong>No medical reports yet</strong><span>Doctor reports and admin diagnostic results for your patients will appear here.</span></div>
                    ) : (
                        <div className="doctor-prescriptions__records">
                            {filteredReports.map((report) => {
                                const diagnostic = isDiagnosticReport(report);
                                return <article className="doctor-medical-report-card" key={report.id}>
                                    <div className="record-icon"><i className={`fas fa-${diagnostic ? "flask" : "file-medical"}`} /></div>
                                    <div className="record-main">
                                        <div className="record-topline"><h3>{report.report_title || "Medical Report"}</h3><span>{activeView === "diagnostic-result" ? "Diagnostic Test Result" : diagnostic ? "Diagnostic Test Prescription" : "Medical Prescription"}</span></div>
                                        <p className="record-patient"><i className="fas fa-user" /> {report.patient_name || "Patient"}</p>
                                        <p className="record-date">{dateText(report.uploaded_at)}{report.diagnostic_result ? ` · ${report.diagnostic_result}` : report.remarks ? ` · ${report.remarks}` : ""}</p>
                                    </div>
                                        <div className="record-actions"><button type="button" onClick={() => setSelectedReport({ ...report, fullView: true })}><i className="fas fa-eye" /> View report</button>{activeView === "diagnostic-result" && getReportFileUrl(report) && <a href={getReportFileUrl(report)} target="_blank" rel="noreferrer"><i className="fas fa-paperclip" /> Open file</a>}</div>
                                </article>;
                            })}
                        </div>
                    )}
                </section>
                    {selectedReport?.fullView && <FullReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
                    {selectedReport && !selectedReport.fullView && <div className="doctor-report-view-overlay" onClick={() => setSelectedReport(null)}><div className="doctor-report-view-modal" onClick={(event) => event.stopPropagation()}><button type="button" className="doctor-report-view-close" onClick={() => setSelectedReport(null)} aria-label="Close">×</button><p className="doctor-prescriptions__eyebrow">{isDiagnosticReport(selectedReport) ? "Diagnostic Test Prescription" : "Medical Prescription"}</p><h2>{selectedReport.report_title || "Medical Report"}</h2><p><strong>Patient:</strong> {selectedReport.patient_name || "Patient"}</p>{selectedReport.prescription && <><h3>Prescription</h3><p className="doctor-report-view-copy">{selectedReport.prescription}</p></>}{selectedReport.diagnostic_result && <><h3>Diagnostic details</h3><p className="doctor-report-view-copy">{selectedReport.diagnostic_result}</p></>}{selectedReport.remarks && <><h3>Doctor notes</h3><p className="doctor-report-view-copy">{selectedReport.remarks}</p></>}</div></div>}
                {selectedReport && <div className="doctor-report-view-overlay" onClick={() => setSelectedReport(null)}><div className="doctor-report-view-modal" onClick={(event) => event.stopPropagation()}><button type="button" className="doctor-report-view-close" onClick={() => setSelectedReport(null)} aria-label="Close">×</button><p className="doctor-prescriptions__eyebrow">{isDiagnosticReport(selectedReport) ? "Diagnostic Test Prescription" : "Medical Prescription"}</p><h2>{selectedReport.report_title || "Medical Report"}</h2><p><strong>Patient:</strong> {selectedReport.patient_name || "Patient"}</p>{selectedReport.prescription && <><h3>Prescription</h3><p className="doctor-report-view-copy">{selectedReport.prescription}</p></>}{selectedReport.diagnostic_result && <><h3>Diagnostic details</h3><p className="doctor-report-view-copy">{selectedReport.diagnostic_result}</p></>}{selectedReport.remarks && <><h3>Doctor notes</h3><p className="doctor-report-view-copy">{selectedReport.remarks}</p></>}</div></div>}
            </div>
        </DoctorLayout>
    );
}
