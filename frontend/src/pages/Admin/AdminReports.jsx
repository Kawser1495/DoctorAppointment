import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaFileMedical, FaTimes } from "react-icons/fa";
import { getAdminReports, updateAdminReportStatus } from "../../services/reportService";
import "./AdminReports.css";

const reportStatuses = ["Draft", "Published", "Archived"];

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getAdminReports().then((response) => {
            const data = response?.data;
            setReports(Array.isArray(data) ? data : data?.results || []);
        }).catch((requestError) => setError(requestError?.response?.data?.detail || "Unable to load medical reports.")).finally(() => setLoading(false));
    }, []);

    const changeStatus = async (report, reportStatus) => {
        try {
            await updateAdminReportStatus(report.id, reportStatus);
            setReports((items) => items.map((item) => item.id === report.id ? { ...item, report_status: reportStatus } : item));
        } catch (requestError) { setError(requestError?.response?.data?.detail || "Unable to update report status."); }
    };

    return <div className="admin-reports-page"><header className="admin-reports-header"><div><Link to="/admin/dashboard" className="reports-back"><FaArrowLeft /> Dashboard</Link><span className="reports-kicker">CLINICAL RECORDS / OVERSIGHT</span><h1>Medical Reports</h1><p>Monitor submitted reports and keep patient records visible only at the right stage.</p></div><div className="reports-count"><strong>{reports.length}</strong><span>reports</span></div></header>{error && <div className="reports-alert"><FaTimes /> {error}</div>}{loading ? <div className="reports-empty">Loading medical reports...</div> : <div className="reports-table-wrap"><table className="reports-table"><thead><tr><th>Report</th><th>Patient</th><th>Doctor</th><th>Appointment</th><th>Type</th><th>Uploaded</th><th>Status</th><th>File</th></tr></thead><tbody>{reports.map((report) => <tr key={report.id}><td><strong><FaFileMedical /> {report.report_title}</strong><small>{report.diagnostic_test_name || report.report_type}</small></td><td>{report.patient_name || "-"}<small>{report.for_name && report.for_name !== report.patient_name ? `For ${report.for_name}` : ""}</small></td><td>{report.doctor_name || "Diagnostic report"}</td><td>{report.appointment_booking || report.diagnostic_booking_number || "-"}</td><td>{report.report_type}</td><td>{report.uploaded_at ? new Date(report.uploaded_at).toLocaleDateString() : "-"}</td><td><select className={`report-status ${String(report.report_status || "Published").toLowerCase()}`} value={report.report_status || "Published"} onChange={(event) => changeStatus(report, event.target.value)}>{reportStatuses.map((status) => <option key={status}>{status}</option>)}</select></td><td>{report.report_file_url ? <a href={report.report_file_url} target="_blank" rel="noreferrer">Open</a> : "No file"}</td></tr>)}</tbody></table></div>}</div>;
}
