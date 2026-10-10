import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DoctorLayout from "../../layouts/DoctorLayout";
import { getDoctorAIReports, getDoctorAppointments } from "../../services/appointmentService";
import { getDoctorReports } from "../../services/reportService";
import "./DoctorPatients.css";

const getAppointmentDate = (appointment) => {
    return new Date(
        `${appointment.appointment_date || appointment.date}T${appointment.appointment_time || appointment.time || "00:00:00"}`
    );
};

const formatDate = (value) => {
    if (!value) {
        return "Not available";
    }

    return new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatTime = (value) => {
    if (!value) {
        return "Time not available";
    }

    const [hours, minutes] = value.split(":");
    const hour = Number(hours);
    const suffix = hour >= 12 ? "PM" : "AM";

    return `${hour % 12 || 12}:${minutes} ${suffix}`;
};

const getStatusClass = (status) => {
    return `doctor-patient-status ${String(status || "").toLowerCase().replace(" ", "-")}`;
};

export default function DoctorPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchParams] = useSearchParams();

    const loadPatients = async () => {
        try {
            setLoading(true);
            setError("");

            const [appointmentResponse, reportResponse, aiReportResponse] = await Promise.all([
                getDoctorAppointments(),
                getDoctorReports(),
                getDoctorAIReports(),
            ]);

            const appointmentData = Array.isArray(appointmentResponse?.data)
                ? appointmentResponse.data
                : Array.isArray(appointmentResponse?.data?.results)
                ? appointmentResponse.data.results
                : [];

            const reportData = Array.isArray(reportResponse?.data)
                ? reportResponse.data
                : Array.isArray(reportResponse?.data?.results)
                ? reportResponse.data.results
                : [];

            const aiReportData = Array.isArray(aiReportResponse?.data)
                ? aiReportResponse.data
                : Array.isArray(aiReportResponse?.data?.results)
                ? aiReportResponse.data.results
                : [];

            const patientMap = new Map();

            appointmentData.forEach((appointment) => {
                const profile = appointment.patient_profile || {};
                const patientId = profile.id || appointment.patient;
                const familyProfile = appointment.family_member_details || {};
                const familyMemberId = appointment.family_member || familyProfile.id || appointment.family_member_name;

                if (!patientId) {
                    return;
                }

                const patientKey = familyMemberId
                    ? `${patientId}-family-${familyMemberId}`
                    : String(patientId);
                const subjectProfile = familyMemberId ? familyProfile : profile;
                const existing = patientMap.get(patientKey) || {
                    id: patientKey,
                    patientId,
                    name: subjectProfile.name || subjectProfile.full_name || appointment.family_member_name || appointment.patient_name || "Patient",
                    age: subjectProfile.age,
                    gender: subjectProfile.gender,
                    phone: subjectProfile.phone || subjectProfile.phone_number,
                    email: subjectProfile.email,
                    address: subjectProfile.address,
                    bloodGroup: subjectProfile.blood_group,
                    appointments: [],
                    aiReports: [],
                };

                existing.appointments.push({
                    id: appointment.id,
                    date: appointment.appointment_date,
                    time: appointment.appointment_time || appointment.slot_time,
                    reason: appointment.reason,
                    symptoms: appointment.symptoms,
                    status: appointment.status,
                    bookingNumber: appointment.booking_number,
                    visitFor: appointment.family_member_name,
                });

                existing.appointments.sort(
                    (first, second) => getAppointmentDate(second) - getAppointmentDate(first)
                );

                existing.reports = reportData
                    .filter((report) => String(report.patient) === String(patientId))
                    .map((report) => ({
                        id: report.id,
                        date: report.uploaded_at,
                        diagnosis: report.report_title,
                        symptoms: report.symptoms,
                        diagnosticResult: report.diagnostic_result,
                        medicines: report.medicines || [],
                        prescription: report.prescription,
                        notes: report.remarks,
                        advice: report.advice,
                        followUpDate: report.follow_up_date,
                        reportType: report.report_type,
                        status: report.report_status,
                    }))
                    .sort((first, second) => new Date(second.date) - new Date(first.date));

                existing.lastAppointment = existing.appointments[0];
                existing.status = existing.lastAppointment.status;
                patientMap.set(patientKey, existing);
            });

            aiReportData.forEach((report) => {
                const patientId = report.patient_id;
                if (!patientId) return;
                const patientKey = String(patientId);
                const existing = patientMap.get(patientKey) || {
                    id: patientKey,
                    name: report.patient_name || "Patient",
                    appointments: [],
                    reports: [],
                    aiReports: [],
                    lastAppointment: { date: null },
                    status: "AI report",
                };
                existing.aiReports.push({
                    id: report.id,
                    date: report.updated_at || report.created_at,
                    category: report.ai_category,
                    symptoms: report.symptoms,
                    duration: report.duration,
                    severity: report.severity,
                    urgency: report.ai_urgency,
                    specialist: report.ai_specialist,
                    guidance: report.ai_guidance,
                    assessment: report.doctor_assessment,
                });
                existing.aiReports.sort((first, second) => new Date(second.date) - new Date(first.date));
                patientMap.set(patientKey, existing);
            });

            setPatients(Array.from(patientMap.values()));
        } catch (err) {
            console.error("Load patients error:", err);
            setError(
                err?.response?.data?.detail ||
                "Unable to load patients list."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    useEffect(() => {
        const patientId = searchParams.get("patient");
        if (!patientId || loading) return;
        const patient = patients.find((item) => String(item.id) === String(patientId));
        if (patient) setSelectedPatient(patient);
    }, [loading, patients, searchParams]);

    const filteredPatients = patients
        .filter((patient) =>
            patient.name.toLowerCase().includes(search.toLowerCase()) ||
            String(patient.phone || "").includes(search) ||
            String(patient.email || "").toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === "recent") {
                return getAppointmentDate(b.lastAppointment) - getAppointmentDate(a.lastAppointment);
            }
            return 0;
        });

    if (loading) {
        return (
            <DoctorLayout>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="mt-3">Loading Patients</h5>
                </div>
            </DoctorLayout>
        );
    }

    return (
        <DoctorLayout>
            <div className="doctor-patients">
                {/* Header */}
                <div className="doctor-patients__header">
                    <div>
                        <h2 className="doctor-patients__title">My Patients</h2>
                        <p className="doctor-patients__subtitle">
                            Manage and view details of your patients
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={loadPatients}
                    >
                        <i className="fas fa-sync-alt me-2" />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="doctor-patients__filters card border-0 mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-8">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name, phone or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="recent">Sort by Recent</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patients Table */}
                {filteredPatients.length === 0 ? (
                    <div className="card border-0 text-center py-5">
                        <div className="card-body">
                            <i className="fas fa-users fa-3x text-muted mb-3" />
                            <h5>No patients found</h5>
                            <p className="text-muted mb-0">You haven't have any appointments yet.</p>
                        </div>
                    </div>
                ) : (
                    <div className="card border-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Age</th>
                                        <th>Gender</th>
                                        <th>Phone</th>
                                        <th>Last Appointment</th>
                                        <th>Status</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient.id}>
                                            <td>
                                                <strong>{patient.name}</strong>
                                            </td>
                                            <td>{patient.age ?? "N/A"}</td>
                                            <td>
                                                {patient.gender || "N/A"}
                                            </td>
                                            <td>{patient.phone || "N/A"}</td>
                                            <td className="text-muted">
                                                {formatDate(patient.lastAppointment.date)}
                                            </td>
                                            <td>
                                                <span className={getStatusClass(patient.status)}>
                                                    {patient.status}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="doctor-patient-view-button"
                                                    onClick={() => setSelectedPatient(patient)}
                                                >
                                                    <i className="fas fa-eye me-1" />
                                                    View Patient
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-3 text-muted small">
                    Showing {filteredPatients.length} of {patients.length} patients
                </div>

                {selectedPatient && (
                    <div className="doctor-patient-modal-backdrop" onClick={() => setSelectedPatient(null)}>
                        <section
                            className="doctor-patient-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="patient-detail-title"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <header className="doctor-patient-modal__header">
                                <div>
                                    <p className="doctor-patients__eyebrow">Patient record</p>
                                    <h2 id="patient-detail-title">{selectedPatient.name}</h2>
                                    <p>{selectedPatient.email || "Email not available"}</p>
                                </div>
                                <button
                                    type="button"
                                    className="doctor-patient-modal__close"
                                    aria-label="Close patient details"
                                    onClick={() => setSelectedPatient(null)}
                                >
                                    &times;
                                </button>
                            </header>

                            <div className="doctor-patient-modal__body">
                                <div className="doctor-patient-detail-grid">
                                    <div><span>Age</span><strong>{selectedPatient.age ?? "N/A"}</strong></div>
                                    <div><span>Gender</span><strong>{selectedPatient.gender || "N/A"}</strong></div>
                                    <div><span>Phone</span><strong>{selectedPatient.phone || "N/A"}</strong></div>
                                    <div><span>Blood group</span><strong>{selectedPatient.bloodGroup || "N/A"}</strong></div>
                                    <div className="full"><span>Address</span><strong>{selectedPatient.address || "N/A"}</strong></div>
                                </div>

                                <div className="doctor-patient-history-heading">
                                    <div>
                                        <p className="doctor-patients__eyebrow">Clinical timeline</p>
                                        <h3>Appointment history</h3>
                                    </div>
                                    <span>{selectedPatient.appointments.length} visit{selectedPatient.appointments.length === 1 ? "" : "s"}</span>
                                </div>

                                <div className="doctor-patient-history">
                                    {selectedPatient.appointments.map((appointment) => (
                                        <article key={appointment.id} className="doctor-patient-history__item">
                                            <div className="doctor-patient-history__date">
                                                <strong>{formatDate(appointment.date)}</strong>
                                                <span>{formatTime(appointment.time)}</span>
                                            </div>
                                            <div className="doctor-patient-history__content">
                                                <div className="doctor-patient-history__topline">
                                                    <span className={getStatusClass(appointment.status)}>{appointment.status}</span>
                                                    {appointment.visitFor && <span>For: {appointment.visitFor}</span>}
                                                </div>
                                                <p><b>Reason:</b> {appointment.reason || "Not provided"}</p>
                                                <p><b>Symptoms:</b> {appointment.symptoms || "Not provided"}</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                <div className="doctor-patient-history-heading">
                                    <div>
                                        <p className="doctor-patients__eyebrow">AI consultation</p>
                                        <h3>Symptom reports</h3>
                                    </div>
                                    <span>{(selectedPatient.aiReports || []).length} report{(selectedPatient.aiReports || []).length === 1 ? "" : "s"}</span>
                                </div>

                                {(selectedPatient.aiReports || []).length === 0 ? (
                                    <div className="doctor-patient-records-empty">No AI symptom reports shared by this patient.</div>
                                ) : (
                                    <div className="doctor-patient-history">
                                        {selectedPatient.aiReports.map((report) => (
                                            <article key={report.id} className="doctor-patient-history__item">
                                                <div className="doctor-patient-history__date">
                                                    <strong>{formatDate(report.date)}</strong>
                                                    <span>{report.urgency || "Review"} urgency</span>
                                                </div>
                                                <div className="doctor-patient-history__content">
                                                    <div className="doctor-patient-history__topline"><span>{report.category || "Symptom report"}</span><span>{report.specialist || "Specialist not specified"}</span></div>
                                                    <p><b>Symptoms:</b> {report.symptoms || "Not provided"}</p>
                                                    <p><b>Duration:</b> {report.duration || "Not provided"} · <b>Severity:</b> {report.severity || "Not provided"}</p>
                                                    <p><b>Doctor assessment:</b> {report.assessment || "Assessment pending"}</p>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}

                                <div className="doctor-patient-history-heading doctor-patient-records-heading">
                                    <div>
                                        <p className="doctor-patients__eyebrow">Doctor records</p>
                                        <h3>Previous diagnosis & treatment</h3>
                                    </div>
                                    <span>{(selectedPatient.reports || []).length} record{(selectedPatient.reports || []).length === 1 ? "" : "s"}</span>
                                </div>

                                {(selectedPatient.reports || []).length === 0 ? (
                                    <div className="doctor-patient-records-empty">
                                        No diagnosis, prescription, or notes recorded yet.
                                    </div>
                                ) : (
                                    <div className="doctor-patient-records">
                                        {selectedPatient.reports.map((report) => (
                                            <article key={report.id} className="doctor-patient-record">
                                                <div className="doctor-patient-record__topline">
                                                    <strong>{report.diagnosis || "Medical record"}</strong>
                                                    <span>{formatDate(report.date)}</span>
                                                </div>
                                                <div className="doctor-patient-record__grid">
                                                    <div><span>Diagnostic result</span><p>{report.diagnosticResult || "Not provided"}</p></div>
                                                    <div><span>Symptoms</span><p>{report.symptoms || "Not provided"}</p></div>
                                                    <div><span>Medicines</span><p>{report.medicines.length ? report.medicines.map((medicine) => `${medicine.name} (${medicine.dosage || "dose not specified"})`).join(", ") : report.prescription || "Not provided"}</p></div>
                                                    <div><span>Prescription</span><p>{report.prescription || "Not provided"}</p></div>
                                                    <div><span>Advice</span><p>{report.advice || "Not provided"}</p></div>
                                                    <div><span>Follow-up</span><p>{report.followUpDate || "Not scheduled"}</p></div>
                                                    <div><span>Notes</span><p>{report.notes || "Not provided"}</p></div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
}
