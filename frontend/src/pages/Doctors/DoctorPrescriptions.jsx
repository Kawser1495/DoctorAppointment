import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import DoctorLayout from "../../layouts/DoctorLayout";
import { getDoctorAppointments } from "../../services/appointmentService";
import {
    createMedicalReport,
    deleteMedicalReport,
    getDoctorReports,
    updateMedicalReport,
} from "../../services/reportService";
import "./DoctorPrescriptions.css";

const EMPTY_MEDICINE = {
    name: "",
    dosage: "",
    frequency: "1 + 0 + 1",
    timing: "After Food",
    duration: "",
    instructions: "",
};

const FREQUENCY_OPTIONS = [
    "1 + 0 + 1",
    "1 + 1 + 1",
    "1 + 0 + 0",
    "0 + 0 + 1",
];

const EMPTY_FORM = {
    appointment: "",
    reportType: "Medical",
    diagnosis: "",
    symptoms: "",
    diagnosticResult: "",
    advice: "",
    followUpDate: "",
    medicines: [{ ...EMPTY_MEDICINE }],
    notes: "",
};

const listFrom = (response) => (
    Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.results)
        ? response.data.results
        : []
);

const errorText = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data?.detail === "string") return data.detail;
    if (data && typeof data === "object") return Object.values(data).flat().join(" ");
    return fallback;
};

const dateText = (value) => value
    ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "Not available";

const timeText = (value) => {
    if (!value) return "";
    const [hours, minutes] = String(value).split(":");
    const hour = Number(hours);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

const prescriptionText = (medicines) => medicines
    .filter((medicine) => medicine.name.trim())
    .map((medicine, index) => `${index + 1}. ${medicine.name.trim()} | ${medicine.dosage.trim()} | ${medicine.frequency.trim()} | ${medicine.timing.trim()} | ${medicine.duration.trim()}${medicine.instructions.trim() ? ` | ${medicine.instructions.trim()}` : ""}`)
    .join("\n");

const isDiagnosticReport = (report) => (
    report?.report_type === "Diagnostic"
    || Boolean(report?.diagnostic_booking_number)
    || Boolean(report?.diagnostic_test_name)
    || Boolean(report?.diagnostic_result)
);

const hasPrescription = (report) => (
    (Array.isArray(report?.medicines) && report.medicines.length > 0)
    || Boolean(report?.prescription)
);

const isAdminDiagnosticResult = (report) => (
    isDiagnosticReport(report)
    && Boolean(report?.diagnostic_result)
    && (
        Boolean(report?.admin_result_published)
        || Boolean(report?.diagnostic_booking_number || report?.test_booking)
        || !(Array.isArray(report?.diagnostic_tests) && report.diagnostic_tests.length)
    )
);

function PrescriptionViewModal({ report, onClose }) {
    const medicines = Array.isArray(report.medicines) ? report.medicines : [];
    return <div className="doctor-report-view-overlay" onClick={onClose}>
        <div className="doctor-report-view-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="doctor-report-view-close" onClick={onClose} aria-label="Close">×</button>
            <p className="doctor-prescriptions__eyebrow">MEDICAL PRESCRIPTION</p>
            <h2>{report.report_title || "Prescription"}</h2>
            <div className="doctor-report-meta"><span><b>Patient</b>{report.patient_name || "Patient"}</span><span><b>Date</b>{dateText(report.uploaded_at)}</span><span><b>Booking</b>{report.appointment_booking || "Not available"}</span></div>
            <h3>Full prescription</h3>
            {medicines.length ? <div className="doctor-medicine-table"><div className="doctor-medicine-table-head"><span>Medicine</span><span>Dosage & frequency</span><span>Timing</span><span>Duration</span></div>{medicines.map((medicine, index) => <div className="doctor-medicine-table-row" key={`${medicine.name}-${index}`}><strong>{medicine.name}</strong><span>{medicine.dosage || "As directed"}<br />{medicine.frequency || "As prescribed"}</span><span>{medicine.timing || "Any time"}</span><span>{medicine.duration || "As advised"}</span></div>)}</div> : <p className="doctor-report-view-copy">{report.prescription || "No prescription details attached."}</p>}
            {report.symptoms && <><h3>Symptoms</h3><p className="doctor-report-view-copy">{report.symptoms}</p></>}
            {report.advice && <><h3>Advice</h3><p className="doctor-report-view-copy">{report.advice}</p></>}
            {report.follow_up_date && <p className="doctor-report-follow-up"><b>Follow-up:</b> {dateText(report.follow_up_date)}</p>}
            {report.remarks && <><h3>Doctor notes</h3><p className="doctor-report-view-copy">{report.remarks}</p></>}
        </div>
    </div>;
}

export default function DoctorPrescriptions() {
    const location = useLocation();
    const [appointments, setAppointments] = useState([]);
    const [reports, setReports] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingReport, setEditingReport] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [reportFile, setReportFile] = useState(null);
    const [activeView, setActiveView] = useState("prescriptions");
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        if (!selectedReport) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = previousOverflow; };
    }, [selectedReport]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [appointmentResponse, reportResponse] = await Promise.all([
                getDoctorAppointments(),
                getDoctorReports(),
            ]);
            setAppointments(listFrom(appointmentResponse));
            setReports(listFrom(reportResponse));
        } catch (loadError) {
            setError(errorText(loadError, "Unable to load prescription workspace."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const eligibleAppointments = useMemo(() => appointments
        .filter((appointment) => ["Confirmed", "Completed"].includes(appointment.status))
        .sort((first, second) => new Date(second.appointment_date) - new Date(first.appointment_date)), [appointments]);

    const visibleReports = reports.filter((report) => activeView === "diagnostic-results"
        ? isAdminDiagnosticResult(report)
        : !isAdminDiagnosticResult(report) && (hasPrescription(report) || isDiagnosticReport(report)));

    const filteredReports = visibleReports.filter((report) => (
        String(report.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
        String(report.report_title || "").toLowerCase().includes(search.toLowerCase())
    ));

    const resetForm = () => {
        setForm({ ...EMPTY_FORM, medicines: [{ ...EMPTY_MEDICINE }] });
        setEditingReport(null);
        setShowForm(false);
    };

    const editReport = (report) => {
        if (isAdminDiagnosticResult(report)) return;
        setEditingReport(report);
        setForm({
            appointment: report.appointment || "",
            reportType: report.report_type || "Medical",
            diagnosis: report.report_title || "",
            symptoms: report.symptoms || "",
            diagnosticResult: report.diagnostic_result || "",
            advice: report.advice || "",
            followUpDate: report.follow_up_date || "",
            medicines: report.medicines?.length ? report.medicines : [{ ...EMPTY_MEDICINE }],
            notes: report.remarks || "",
        });
        setReportFile(null);
        setShowForm(true);
        setError("");
    };

    useEffect(() => {
        const reportId = location.state?.editReportId;
        const report = reports.find((item) => String(item.id) === String(reportId));
        if (report) editReport(report);
    }, [location.state?.editReportId, reports]);

    const changeMedicine = (index, field, value) => {
        setForm((previous) => ({
            ...previous,
            medicines: previous.medicines.map((medicine, medicineIndex) => (
                medicineIndex === index ? { ...medicine, [field]: value } : medicine
            )),
        }));
    };

    const submitForm = async (event) => {
        event.preventDefault();
        const medicines = form.medicines.filter((medicine) => medicine.name.trim());

        if (!form.appointment || !form.diagnosis.trim()) {
            setError("Select an appointment and enter a diagnosis.");
            return;
        }
        if (form.reportType === "Medical" && medicines.length === 0) {
            setError("Add at least one medicine for a medical prescription.");
            return;
        }
        if (form.reportType === "Medical" && medicines.some((medicine) => !medicine.frequency.trim())) {
            setError("Enter a custom frequency for every medicine row.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            const payload = new FormData();
            payload.append("report_type", form.reportType);
            payload.append("report_title", form.diagnosis.trim());
            payload.append("appointment", String(form.appointment));
            payload.append("symptoms", form.symptoms.trim());
            payload.append("medicines", JSON.stringify(medicines));
            payload.append("prescription", prescriptionText(medicines));
            payload.append("diagnostic_result", form.diagnosticResult.trim());
            payload.append("advice", form.advice.trim());
            if (form.followUpDate) {
                payload.append("follow_up_date", form.followUpDate);
            }
            payload.append("remarks", form.notes.trim());
            if (reportFile) payload.append("report_file", reportFile);

            if (editingReport) {
                await updateMedicalReport(editingReport.id, payload);
                setSuccess("Prescription updated successfully.");
            } else {
                await createMedicalReport(payload);
                setSuccess("Prescription created successfully.");
            }
            resetForm();
            setReportFile(null);
            await loadData();
        } catch (saveError) {
            setError(errorText(saveError, "Unable to save prescription."));
        } finally {
            setSaving(false);
        }
    };

    const removeReport = async (report) => {
        if (!window.confirm("Delete this prescription record?")) return;
        try {
            await deleteMedicalReport(report.id);
            setSuccess("Prescription deleted.");
            await loadData();
        } catch (deleteError) {
            setError(errorText(deleteError, "Unable to delete prescription."));
        }
    };

    const printReport = (report) => {
        setSelectedReport(report);
    };

    if (loading) return <DoctorLayout><div className="doctor-prescriptions__loading">Loading prescription workspace...</div></DoctorLayout>;

    return (
        <DoctorLayout>
            <div className="doctor-prescriptions">
                <header className="doctor-prescriptions__header"><div><p className="doctor-prescriptions__eyebrow">Clinical documentation</p><h1 className="doctor-prescriptions__title">Prescription Management</h1><p className="doctor-prescriptions__subtitle">Create clear, structured prescriptions linked to your appointments.</p></div><button className="doctor-prescriptions__primary" type="button" onClick={() => { if (showForm) resetForm(); else { setForm({ ...EMPTY_FORM, medicines: [{ ...EMPTY_MEDICINE }] }); setShowForm(true); } }}><i className={`fas fa-${showForm ? "times" : "plus"}`} /> {showForm ? "Close editor" : "New prescription"}</button></header>
                {error && <div className="doctor-prescriptions__alert error">{error}</div>}
                {success && <div className="doctor-prescriptions__alert success">{success}</div>}

                {showForm && <section className="doctor-prescriptions__editor"><div className="doctor-prescriptions__section-heading"><div><p className="doctor-prescriptions__eyebrow">{editingReport ? "Update record" : "New record"}</p><h2>{editingReport ? "Edit prescription" : "Create prescription"}</h2></div><span>{form.reportType === "Diagnostic" ? "Diagnostic test prescription" : "Medical prescription"}</span></div><form onSubmit={submitForm}><div className="doctor-prescriptions__form-grid"><label>Appointment<select value={form.appointment} onChange={(event) => setForm({ ...form, appointment: event.target.value })} required><option value="">Select confirmed or completed appointment</option>{eligibleAppointments.map((appointment) => <option key={appointment.id} value={appointment.id}>{appointment.patient_name} · {dateText(appointment.appointment_date)} · {timeText(appointment.slot_time)}</option>)}</select></label><label>Record type<select value={form.reportType} onChange={(event) => setForm({ ...form, reportType: event.target.value })}><option value="Medical">Medical prescription</option><option value="Diagnostic">Diagnostic test prescription</option></select></label><label className="full">Diagnosis / report title<input value={form.diagnosis} onChange={(event) => setForm({ ...form, diagnosis: event.target.value })} placeholder="e.g. Acute fever or CBC test" required /></label><label className="full">Diagnostic test details<textarea rows="3" value={form.diagnosticResult} onChange={(event) => setForm({ ...form, diagnosticResult: event.target.value })} placeholder="Test name, preparation, or clinical instructions" /></label></div>
                    <div className="doctor-prescriptions__clinical-grid"><label>Symptoms<textarea rows="3" value={form.symptoms} onChange={(event) => setForm({ ...form, symptoms: event.target.value })} placeholder="Fever, cough, body ache..." /></label><label>Advice<textarea rows="3" value={form.advice} onChange={(event) => setForm({ ...form, advice: event.target.value })} placeholder="Take rest and drink enough water..." /></label><label>Follow-up date<input type="date" min={new Date().toISOString().slice(0, 10)} value={form.followUpDate} onChange={(event) => setForm({ ...form, followUpDate: event.target.value })} /></label></div>
                    <div className="doctor-prescriptions__medicine-heading"><div><p className="doctor-prescriptions__eyebrow">Medication plan</p><h3>Medicines</h3></div><button type="button" className="doctor-prescriptions__secondary" onClick={() => setForm({ ...form, medicines: [...form.medicines, { ...EMPTY_MEDICINE }] })}><i className="fas fa-plus" /> Add medicine</button></div>
                    <div className="doctor-prescriptions__medicine-list">{form.medicines.map((medicine, index) => <div className="doctor-prescriptions__medicine" key={index}><div className="medicine-number">{index + 1}</div><div className="medicine-fields"><input placeholder="Medicine name" value={medicine.name} onChange={(event) => changeMedicine(index, "name", event.target.value)} /><input placeholder="Dosage e.g. 500mg" value={medicine.dosage} onChange={(event) => changeMedicine(index, "dosage", event.target.value)} /><select value={FREQUENCY_OPTIONS.includes(medicine.frequency) ? medicine.frequency : "Customize"} onChange={(event) => changeMedicine(index, "frequency", event.target.value === "Customize" ? "" : event.target.value)}>{FREQUENCY_OPTIONS.map((frequency) => <option key={frequency}>{frequency}</option>)}<option value="Customize">Customize</option></select>{!FREQUENCY_OPTIONS.includes(medicine.frequency) && <input placeholder="Custom frequency, e.g. 1 + 1 + 0" value={medicine.frequency} onChange={(event) => changeMedicine(index, "frequency", event.target.value)} />}<select value={medicine.timing} onChange={(event) => changeMedicine(index, "timing", event.target.value)}><option>After Food</option><option>Before Food</option><option>With Food</option><option>At Bedtime</option><option>As directed</option></select><input placeholder="Duration e.g. 5 Days" value={medicine.duration} onChange={(event) => changeMedicine(index, "duration", event.target.value)} /><input placeholder="Instructions" value={medicine.instructions} onChange={(event) => changeMedicine(index, "instructions", event.target.value)} /></div>{form.medicines.length > 1 && <button type="button" className="doctor-prescriptions__remove" onClick={() => setForm({ ...form, medicines: form.medicines.filter((_, medicineIndex) => medicineIndex !== index) })}><i className="fas fa-trash" /></button>}</div>)}</div>
                    <label className="doctor-prescriptions__notes">Doctor notes<textarea rows="4" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Drink plenty of water..." /></label><label className="doctor-prescriptions__notes">Attach file (optional)<input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setReportFile(event.target.files?.[0] || null)} /></label><div className="doctor-prescriptions__form-actions"><button type="button" className="doctor-prescriptions__secondary" onClick={resetForm}>Cancel</button><button type="submit" className="doctor-prescriptions__primary" disabled={saving}>{saving ? "Saving..." : editingReport ? "Update prescription" : "Create prescription"}</button></div>
                </form></section>}

                <section className="doctor-prescriptions__list-card">
                    <div className="doctor-prescriptions__section-tabs" role="tablist" aria-label="Doctor records">
                        <button type="button" className={activeView === "prescriptions" ? "active" : ""} onClick={() => setActiveView("prescriptions")}>Prescriptions</button>
                        <button type="button" className={activeView === "diagnostic-results" ? "active" : ""} onClick={() => setActiveView("diagnostic-results")}>Diagnostic Test Results</button>
                    </div>
                    <div className="doctor-prescriptions__list-header"><div><p className="doctor-prescriptions__eyebrow">{activeView === "diagnostic-results" ? "Admin shared results" : "Your records"}</p><h2>{activeView === "diagnostic-results" ? "Diagnostic Test Results" : "Prescriptions"}</h2></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patient or diagnosis" /></div>
                    {filteredReports.length === 0 ? <div className="doctor-prescriptions__empty"><i className={`fas fa-${activeView === "diagnostic-results" ? "flask" : "file-prescription"}`} /><strong>{activeView === "diagnostic-results" ? "No diagnostic results yet" : "No prescription records yet"}</strong><span>{activeView === "diagnostic-results" ? "Admin-published diagnostic results will appear here." : "Create a record from a confirmed or completed appointment."}</span></div> : <div className="doctor-prescriptions__records">{filteredReports.map((report) => <article className="doctor-prescriptions__record" key={report.id}><div className="record-icon"><i className={`fas fa-${isDiagnosticReport(report) ? "flask" : "file-medical"}`} /></div><div className="record-main"><div className="record-topline"><h3>{report.report_title}</h3><span>{activeView === "diagnostic-results" ? "Diagnostic Result" : isDiagnosticReport(report) ? "Diagnostic Test Prescription" : "Medical Prescription"}</span></div><p className="record-patient"><i className="fas fa-user" /> {report.patient_name || "Patient"}</p><p className="record-date">{dateText(report.uploaded_at)}{activeView === "diagnostic-results" ? ` · ${report.diagnostic_result || "Result attached"}` : isDiagnosticReport(report) ? ` · ${report.diagnostic_result || "Test details attached"}` : ` · ${report.medicines?.length || 0} medicine${report.medicines?.length === 1 ? "" : "s"}${report.follow_up_date ? ` · Follow-up ${dateText(report.follow_up_date)}` : ""}`}</p></div><div className="record-actions"><button type="button" onClick={() => printReport(report)} title="Print or save as PDF"><i className="fas fa-print" /> Print / PDF</button>{activeView === "prescriptions" && <><button type="button" onClick={() => editReport(report)}><i className="fas fa-pen" /> Edit</button><button type="button" className="danger" onClick={() => removeReport(report)}><i className="fas fa-trash" /></button></>}</div></article>)}</div>}
                </section>
                {selectedReport && <PrescriptionViewModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
            </div>
        </DoctorLayout>
    );
}