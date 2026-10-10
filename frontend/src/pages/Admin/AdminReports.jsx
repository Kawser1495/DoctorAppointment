import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaFileMedical, FaTimes } from "react-icons/fa";
import { getAdminReports, updateAdminReport, updateAdminReportStatus } from "../../services/reportService";
import "./AdminReports.css";

const statuses = ["Draft", "Published", "Archived"];

const isDiagnosticReport = (report) => (
    report?.report_type === "Diagnostic"
    || Boolean(report?.diagnostic_booking_number)
    || Boolean(report?.diagnostic_test_name)
);

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [editing, setEditing] = useState(null);
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const response = await getAdminReports();
            const data = response?.data;
            setReports(Array.isArray(data) ? data : data?.results || []);
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to load medical reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const save = async (event) => {
        event.preventDefault();
        try {
            const payload = new FormData();
            payload.append("report_title", editing.report_title || "");
            payload.append("report_status", editing.report_status || "Draft");
            payload.append("prescription", editing.prescription || "");
            payload.append("diagnostic_result", editing.diagnostic_result || "");
            payload.append("diagnostic_tests", JSON.stringify(editing.diagnostic_tests || []));
            payload.append("symptoms", editing.symptoms || "");
            payload.append("advice", editing.advice || "");
            payload.append("remarks", editing.remarks || "");
            if (editing.follow_up_date) {
                payload.append("follow_up_date", editing.follow_up_date);
            }
            payload.append("medicines", JSON.stringify(editing.medicines || []));
            if (file) payload.append("report_file", file);
            const response = await updateAdminReport(editing.id, payload);
            const updated = response?.data || response;
            setReports((items) => items.map((item) => item.id === updated.id ? updated : item));
            setEditing(null);
            setFile(null);
        } catch (requestError) {
            const responseError = requestError?.response?.data;
            const fieldErrors = responseError && typeof responseError === "object"
                ? Object.entries(responseError)
                    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
                    .join(" | ")
                : "";
            setError(fieldErrors || responseError?.detail || "Unable to save report.");
        }
    };

    const updateStatus = async (report, reportStatus) => {
        await updateAdminReportStatus(report.id, reportStatus);
        setReports((items) => items.map((item) => item.id === report.id ? { ...item, report_status: reportStatus } : item));
    };

    return <div className="admin-reports-page">
        <header className="admin-reports-header"><div><Link to="/admin/dashboard" className="reports-back"><FaArrowLeft /> Dashboard</Link><span className="reports-kicker">CLINICAL RECORDS / OVERSIGHT</span><h1>Medical Reports</h1><p>View and edit every patient report, diagnostic result, and prescription.</p></div></header>
        {error && <div className="reports-alert"><FaTimes /> {error}</div>}
        {loading ? <div className="reports-empty">Loading medical reports...</div> : <div className="reports-table-wrap"><table className="reports-table"><thead><tr><th>Report</th><th>Patient</th><th>Doctor</th><th>Type</th><th>Status</th><th>File</th><th>Actions</th></tr></thead><tbody>{reports.map((report) => <tr key={report.id}><td><strong><FaFileMedical /> {report.report_title}</strong></td><td>{report.patient_name || "-"}</td><td>{report.doctor_name || "Diagnostic report"}</td><td>{isDiagnosticReport(report) ? "Diagnostic" : report.report_type}</td><td><select value={report.report_status || "Published"} onChange={(event) => updateStatus(report, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td><td>{report.report_file_url ? <a href={report.report_file_url} target="_blank" rel="noreferrer">Open</a> : "No file"}</td><td><button type="button" className="report-edit-button" onClick={() => { setEditing({ ...report, medicines: report.medicines || [], diagnostic_tests: report.diagnostic_tests || [] }); setFile(null); }}><FaEdit /> View / Edit</button></td></tr>)}</tbody></table></div>}
        {editing && <div className="report-modal-backdrop"><form className="report-editor-modal" onSubmit={save}><div className="report-editor-header"><div><span className="reports-kicker">PATIENT REPORT</span><h2>View and edit report</h2><p>{editing.patient_name || "Patient"}</p></div><button type="button" className="report-modal-close" onClick={() => setEditing(null)} aria-label="Close"><FaTimes /></button></div><div className="report-editor-grid"><label>Report title<input value={editing.report_title || ""} onChange={(event) => setEditing({ ...editing, report_title: event.target.value })} /></label><label>Status<select value={editing.report_status || "Published"} onChange={(event) => setEditing({ ...editing, report_status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="report-editor-wide">Prescription<textarea rows="5" value={editing.prescription || ""} onChange={(event) => setEditing({ ...editing, prescription: event.target.value })} /></label><label className="report-editor-wide">Diagnostic result<textarea rows="4" value={editing.diagnostic_result || ""} onChange={(event) => setEditing({ ...editing, diagnostic_result: event.target.value })} /></label><label className="report-editor-wide">Remarks<textarea rows="3" value={editing.remarks || ""} onChange={(event) => setEditing({ ...editing, remarks: event.target.value })} /></label><label className="report-editor-wide">Attach file (optional)<input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label></div><div className="report-editor-actions"><button type="button" onClick={() => setEditing(null)}>Cancel</button><button type="submit">Save report</button></div></form></div>}
    </div>;
}