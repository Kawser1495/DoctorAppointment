import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarCheck, FaEye, FaSearch, FaTimes, FaTrash, FaUser, FaCalendarAlt } from "react-icons/fa";
import { deleteAdminAppointment, getAdminAppointments, updateAdminAppointmentStatus } from "../../services/appointmentService";
import { getAdminDoctors } from "../../services/doctorService";
import "./AdminAppointments.css";

const activeStatuses = ["Pending", "Confirmed"];
const statusOptions = ["Pending", "Confirmed", "Completed", "Cancelled", "Rejected"];
const getList = (response) => {
    const data = response?.data;
    return Array.isArray(data) ? data : data?.results || [];
};

const appointmentMatchesSearch = (appointment, query) => {
    if (!query) return true;
    const patientProfile = appointment.patient_profile || {};
    const familyMember = appointment.family_member_details || {};
    const searchableValues = [
        appointment.booking_number,
        appointment.patient_name,
        patientProfile.full_name,
        patientProfile.username,
        patientProfile.email,
        patientProfile.phone,
        appointment.family_member_name,
        familyMember.name,
        familyMember.relation,
        appointment.doctor_name,
        appointment.department_name,
        appointment.specialization,
    ];
    return searchableValues.some((value) => String(value || "").toLowerCase().includes(query));
};

const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};

const formatDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getLastSevenDays = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    return { from: formatDateInput(start), to: formatDateInput(today) };
};

const getUpcomingAppointments = (items) => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return items.filter((appointment) => {
        const appointmentDate = parseLocalDate(appointment.appointment_date);
        if (!appointmentDate) return false;
        return appointmentDate >= startDate && appointmentDate <= monthEnd;
    });
};

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [allAppointmentRecords, setAllAppointmentRecords] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("all");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(location.search);
    const dailyDate = urlParams.get("date") || "";
    const upcomingOnly = urlParams.get("upcoming") === "true";
    const rangeFrom = urlParams.get("from") || "";
    const rangeTo = urlParams.get("to") || "";
    const lastSevenOnly = urlParams.get("last7") === "true";

    useEffect(() => {
        const lastSeven = getLastSevenDays();
        const params = dailyDate
            ? { date: dailyDate }
            : lastSevenOnly
                ? { date_from: rangeFrom || lastSeven.from, date_to: rangeTo || lastSeven.to }
                : rangeFrom || rangeTo ? { date_from: rangeFrom, date_to: rangeTo } : {};
        const loadAppointments = () => Promise.all([getAdminAppointments(params), getAdminAppointments({ ...params, history: "true" }), getAdminDoctors()]).then(([appointmentResponse, historyResponse, doctorResponse]) => {
            setAppointments(getList(appointmentResponse));
            setAllAppointmentRecords(getList(historyResponse));
            setDoctors(getList(doctorResponse));
        }).catch((requestError) => setError(requestError?.response?.data?.detail || "Unable to load appointment management data.")).finally(() => setLoading(false));
        const refreshAfterPatientDelete = () => loadAppointments();
        window.addEventListener("admin-appointments-updated", refreshAfterPatientDelete);
        window.addEventListener("storage", refreshAfterPatientDelete);
        loadAppointments();
        return () => {
            window.removeEventListener("admin-appointments-updated", refreshAfterPatientDelete);
            window.removeEventListener("storage", refreshAfterPatientDelete);
        };
    }, [dailyDate, lastSevenOnly, rangeFrom, rangeTo]);

    const visibleAppointments = useMemo(() => {
        if (dailyDate) {
            return appointments.filter((appointment) => appointment.appointment_date === dailyDate);
        }
        if (upcomingOnly) {
            return getUpcomingAppointments(appointments);
        }
        return appointments;
    }, [appointments, dailyDate, upcomingOnly]);

    const filteredAppointments = useMemo(() => {
        const query = search.trim().toLowerCase();
        return visibleAppointments.filter((appointment) => {
            const matchesDoctor = selectedDoctor === "all" || String(appointment.doctor) === selectedDoctor || String(appointment.doctor_id) === selectedDoctor;
            return matchesDoctor && appointmentMatchesSearch(appointment, query);
        });
    }, [visibleAppointments, search, selectedDoctor]);

    const doctorGroups = useMemo(() => {
        const counts = new Map();
        const doctorAppointments = dailyDate || upcomingOnly || lastSevenOnly || rangeFrom || rangeTo
            ? visibleAppointments
            : allAppointmentRecords.filter((appointment) => String(appointment.payment_status || "").toLowerCase() !== "refunded");
        doctorAppointments.forEach((appointment) => {
            const id = String(appointment.doctor || appointment.doctor_id);
            counts.set(id, (counts.get(id) || 0) + 1);
        });
        const groups = doctors.map((doctor) => ({
            id: String(doctor.id),
            name: doctor.doctor_name || `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim() || doctor.username || "Unknown doctor",
            department: doctor.department_name || "Unassigned",
            count: counts.get(String(doctor.id)) || 0,
        }));
        const query = search.trim().toLowerCase();
        if (!query) return groups;
        return groups.filter((doctor) => {
            const doctorMatches = [doctor.name, doctor.department].some((value) => String(value || "").toLowerCase().includes(query));
            return doctorMatches || doctorAppointments.some((appointment) => String(appointment.doctor || appointment.doctor_id) === doctor.id && appointmentMatchesSearch(appointment, query));
        });
    }, [visibleAppointments, allAppointmentRecords, doctors, search, dailyDate, upcomingOnly, lastSevenOnly, rangeFrom, rangeTo]);

    const changeStatus = async (id, nextStatus) => {
        try {
            setError("");
            await updateAdminAppointmentStatus(id, nextStatus);
            setAllAppointmentRecords((items) => items.map((item) => item.id === id ? { ...item, status: nextStatus } : item));
            if (activeStatuses.includes(nextStatus)) {
                setAppointments((items) => items.map((item) => item.id === id ? { ...item, status: nextStatus } : item));
                setSelected((item) => item ? { ...item, status: nextStatus } : null);
            } else {
                setAppointments((items) => items.filter((item) => item.id !== id));
                setSelected(null);
            }
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to update appointment status.");
        }
    };

    const deleteAppointment = async (appointment) => {
        if (deletingId) return;
        if (!window.confirm(`Are you sure you want to delete appointment ${appointment.booking_number}?`)) return;
        try {
            setDeletingId(appointment.id);
            await deleteAdminAppointment(appointment.id);
            setAppointments((items) => items.filter((item) => item.id !== appointment.id));
            setAllAppointmentRecords((items) => items.filter((item) => item.id !== appointment.id));
            setSelected(null);
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to delete appointment.");
        } finally {
            setDeletingId(null);
        }
    };

    return <div className="admin-management-page">
        <header className="management-header"><div><Link to="/admin/dashboard" className="management-back"><FaArrowLeft /> Dashboard</Link><span className="management-kicker">{upcomingOnly ? "OPERATIONS / UPCOMING BOOKINGS" : dailyDate ? "OPERATIONS / TODAY'S BOOKINGS" : "OPERATIONS / RUNNING BOOKINGS"}</span><h1>{dailyDate ? "Today's Appointment Schedule" : upcomingOnly ? "Upcoming Appointment Management" : "Appointment Management"}</h1><p>{dailyDate ? `Schedule for ${dailyDate}: booking number, patient, doctor, date, and time slot.` : upcomingOnly ? `Upcoming appointments from tomorrow through the end of this month.` : "Manage active bookings by doctor and keep patient care moving."}</p></div><div className="management-total"><strong>{filteredAppointments.length}</strong><span>{dailyDate ? "today's appointments" : upcomingOnly ? "upcoming appointments" : "running appointments"}</span></div></header>
        {error && <div className="management-alert"><FaTimes /> {error}</div>}
        <section className="appointment-management-toolbar"><label className="appointment-search"><FaSearch /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search booking, patient, family member, or doctor..." /></label><div className="appointment-date-tools"><label><FaCalendarAlt /><span>Day</span><input type="date" value={dailyDate} onChange={(event) => { const params = new URLSearchParams(location.search); params.delete("last7"); params.delete("from"); params.delete("to"); if (event.target.value) params.set("date", event.target.value); else params.delete("date"); navigate(`${location.pathname}${params.toString() ? `?${params}` : ""}`); }} /></label><button type="button" className={lastSevenOnly ? "active" : ""} onClick={() => { const range = getLastSevenDays(); const params = new URLSearchParams(location.search); params.delete("date"); params.set("last7", "true"); params.set("from", range.from); params.set("to", range.to); navigate(`${location.pathname}?${params}`); }}>Last 7 days</button>{(dailyDate || lastSevenOnly || rangeFrom || rangeTo) && <button type="button" className="clear-date" onClick={() => { const params = new URLSearchParams(location.search); ["date", "last7", "from", "to"].forEach((key) => params.delete(key)); navigate(`${location.pathname}${params.toString() ? `?${params}` : ""}`); }}>Clear date</button>}</div></section>
        <section className="appointment-doctor-section"><div className="section-heading"><div><span className="management-kicker">CARE NETWORK</span><h2>{dailyDate ? "Doctor-wise today's appointments" : upcomingOnly ? "Doctor-wise upcoming appointments" : "Doctor-wise total appointments"}</h2></div><span>{doctorGroups.length} doctors</span></div><div className="appointment-doctor-grid"><button type="button" className={`appointment-doctor-card ${selectedDoctor === "all" ? "selected" : ""}`} onClick={() => setSelectedDoctor("all")}><FaUser /><span><strong>All doctors</strong><small>{filteredAppointments.length} running appointments</small></span></button>{doctorGroups.map((doctor) => <button type="button" className={`appointment-doctor-card ${selectedDoctor === doctor.id ? "selected" : ""}`} key={doctor.id} onClick={() => setSelectedDoctor(doctor.id)}><FaUser /><span><strong>{doctor.name}</strong><small>{doctor.department} · {doctor.count} total appointments</small></span></button>)}</div></section>
        {loading ? <div className="management-empty">{upcomingOnly ? "Loading upcoming appointments..." : "Loading running appointments..."}</div> : filteredAppointments.length === 0 ? <div className="management-empty"><FaCalendarCheck /><h2>{upcomingOnly ? "No upcoming appointments" : "No running appointments"}</h2><p>{upcomingOnly ? "Future bookings for this month will appear here once they are scheduled." : "Cancelled and rejected bookings are removed from this management view."}</p></div> : <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Booking</th><th>Patient</th><th>Family member</th><th>Doctor</th><th>Department</th><th>Date</th><th>Time slot</th><th>Status</th><th>Payment</th><th>View</th></tr></thead><tbody>{filteredAppointments.map((appointment) => <tr key={appointment.id}><td><strong>{appointment.booking_number}</strong></td><td>{appointment.patient_name || appointment.patient_profile?.full_name || "-"}</td><td>{appointment.family_member_name || "Self"}</td><td>{appointment.doctor_name || "-"}</td><td>{appointment.department_name || "-"}</td><td>{appointment.appointment_date || "-"}</td><td>{appointment.slot_time || appointment.appointment_time || "-"}</td><td><select className={`status-select ${String(appointment.status || "").toLowerCase().replace(/\s+/g, "-")}`} value={appointment.status} onChange={(event) => changeStatus(appointment.id, event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></td><td><span className="status-chip approved">{appointment.payment_status || "Unpaid"}</span></td><td><button type="button" className="icon-action" title="View appointment and patient profile" onClick={() => setSelected(appointment)}><FaEye /></button></td></tr>)}</tbody></table></div>}
        <section className="appointment-records-section"><div className="section-heading"><div><span className="management-kicker">FULL HISTORY</span><h2>All appointment records</h2></div><div className="appointment-record-total"><strong>{allAppointmentRecords.length}</strong><span>total records</span></div></div>{allAppointmentRecords.length === 0 ? <div className="management-empty">No appointment records found.</div> : <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Booking</th><th>Patient</th><th>Family member</th><th>Doctor</th><th>Date</th><th>Time slot</th><th>Status</th><th>Payment</th><th>Action</th></tr></thead><tbody>{allAppointmentRecords.map((appointment) => <tr key={`history-${appointment.id}`}><td><strong>{appointment.booking_number}</strong></td><td>{appointment.patient_name || appointment.patient_profile?.full_name || "-"}</td><td>{appointment.family_member_name || "Self"}</td><td>{appointment.doctor_name || "-"}</td><td>{appointment.appointment_date || "-"}</td><td>{appointment.slot_time || appointment.appointment_time || "-"}</td><td><span className={`status-chip ${String(appointment.status || "").toLowerCase().replace(/\s+/g, "-")}`}>{appointment.status}</span></td><td><span className="status-chip approved">{appointment.payment_status || "Unpaid"}</span></td><td><button type="button" className="appointment-delete-button" title="Delete appointment" disabled={deletingId === appointment.id} onClick={() => deleteAppointment(appointment)}><FaTrash /></button></td></tr>)}</tbody></table></div>}</section>
        {selected && <div className="management-modal" role="dialog" aria-modal="true" aria-label="Appointment details"><div className="management-modal-card appointment-detail-card"><button type="button" className="modal-close" onClick={() => setSelected(null)} aria-label="Close appointment details"><FaTimes /></button><span className="management-kicker">BOOKING DETAILS</span><h2>{selected.booking_number}</h2><div className="appointment-detail-grid"><span>Doctor<strong>{selected.doctor_name || "-"}</strong></span><span>Department<strong>{selected.department_name || "-"}</strong></span><span>Date<strong>{selected.appointment_date || "-"}</strong></span><span>Time<strong>{selected.slot_time || selected.appointment_time || "-"}</strong></span><span>Payment<strong>{selected.payment_status || "Unpaid"}</strong></span><span>Status<strong>{selected.status}</strong></span></div><div className="appointment-patient-profile"><h3>Patient profile</h3><p><strong>{selected.patient_profile?.full_name || selected.patient_name || "-"}</strong></p><p>{selected.patient_profile?.email || "No email"} · {selected.patient_profile?.phone || "No phone"}</p><p>{selected.patient_profile?.gender || "Gender not provided"} · Blood group: {selected.patient_profile?.blood_group || "Unknown"}</p><p>{selected.patient_profile?.address || "Address not provided"}</p>{selected.family_member_details && <p>Booked for family member: <strong>{selected.family_member_details.name}</strong></p>}</div><div className="modal-actions"><label>Update status<select className="status-select" value={selected.status} onChange={(event) => changeStatus(selected.id, event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></label></div></div></div>}
    </div>;
}
