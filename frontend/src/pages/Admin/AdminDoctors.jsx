import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaEye, FaPowerOff, FaSearch, FaTimes, FaTrash } from "react-icons/fa";
import { approveDoctor, deleteAdminDoctor, getAdminDoctorDetails, getAdminDoctors, rejectDoctor, setDoctorAvailability } from "../../services/doctorService";
import "./AdminManagement.css";

const nameOf = (doctor) => doctor.doctor_name || `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim() || doctor.username;
const listOf = (response) => {
    const data = response?.data;
    return Array.isArray(data) ? data : data?.results || [];
};

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            setDoctors(listOf(await getAdminDoctors()));
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to load doctors.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const visibleDoctors = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return doctors;
        return doctors.filter((doctor) => [nameOf(doctor), doctor.username, doctor.email, doctor.department_name, doctor.specialization, doctor.qualification].some((value) => String(value || "").toLowerCase().includes(query)));
    }, [doctors, search]);

    const openDoctor = async (doctor) => {
        try {
            setError("");
            const response = await getAdminDoctorDetails(doctor.id);
            setSelected(response?.data);
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to load doctor profile.");
        }
    };

    const updateAvailability = async (doctor) => {
        try {
            await setDoctorAvailability(doctor.id, !doctor.is_available);
            setDoctors((items) => items.map((item) => item.id === doctor.id ? { ...item, is_available: !doctor.is_available } : item));
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to update availability.");
        }
    };

    const updateApproval = async (doctor, action) => {
        try {
            if (action === "approve") await approveDoctor(doctor.id);
            else await rejectDoctor(doctor.id, "Application rejected by administrator.");
            setDoctors((items) => items.map((item) => item.id === doctor.id ? { ...item, doctor_status: action === "approve" ? "approved" : "rejected" } : item));
            setSelected((item) => item ? { ...item, doctor_status: action === "approve" ? "approved" : "rejected" } : item);
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to update doctor status.");
        }
    };

    const deleteDoctor = async () => {
        if (!selected || deleting) return;
        if (!window.confirm(`Are you sure you want to delete this doctor?\n\n${nameOf(selected)}\n\nThis permanently deletes the doctor account, schedules, slots, appointments, ratings, and related doctor records.`)) return;
        try {
            setDeleting(true);
            await deleteAdminDoctor(selected.id);
            setDoctors((items) => items.filter((item) => item.id !== selected.id));
            setSelected(null);
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to delete doctor.");
        } finally {
            setDeleting(false);
        }
    };

    return <div className="admin-management-page">
        <header className="management-header"><div><Link to="/admin/dashboard" className="management-back"><FaArrowLeft /> Dashboard</Link><span className="management-kicker">PEOPLE / CLINICIANS</span><h1>Doctor Management</h1><p>Search clinicians, review profiles, manage availability, and maintain the care network.</p></div><div className="management-total"><strong>{doctors.length}</strong><span>total doctors</span></div></header>
        {error && <div className="management-alert"><FaTimes /> {error}</div>}
        <section className="doctor-management-toolbar"><label className="doctor-search"><FaSearch /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search doctor name, email, department, or specialization..." /></label><span>{visibleDoctors.length} matching doctors</span></section>
        {loading ? <div className="management-empty">Loading doctors...</div> : visibleDoctors.length === 0 ? <div className="management-empty"><FaSearch /><h2>No doctors found</h2><p>Try another doctor name or specialization.</p></div> : <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Doctor</th><th>Department</th><th>Specialization</th><th>Qualification</th><th>Experience</th><th>Fee</th><th>Status</th><th>Availability</th><th>Actions</th></tr></thead><tbody>{visibleDoctors.map((doctor) => <tr key={doctor.id}><td><strong>{nameOf(doctor)}</strong><small>{doctor.email || "No email"}</small></td><td>{doctor.department_name || "-"}</td><td>{doctor.specialization || "-"}</td><td>{doctor.qualification || "-"}</td><td>{doctor.experience || 0} yrs</td><td>BDT {Number(doctor.consultation_fee || 0).toLocaleString()}</td><td><span className={`status-chip ${doctor.doctor_status}`}>{doctor.doctor_status || "pending"}</span></td><td><button type="button" className={`availability-toggle ${doctor.is_available ? "on" : "off"}`} onClick={() => updateAvailability(doctor)}><FaPowerOff /> {doctor.is_available ? "Active" : "Inactive"}</button></td><td><button type="button" className="icon-action" title="View doctor profile" onClick={() => openDoctor(doctor)}><FaEye /></button></td></tr>)}</tbody></table></div>}
        {selected && <div className="management-modal" role="dialog" aria-modal="true" aria-label="Doctor profile"><div className="management-modal-card doctor-profile-card"><button type="button" className="modal-close" onClick={() => setSelected(null)} aria-label="Close doctor profile"><FaTimes /></button><span className="management-kicker">DOCTOR PROFILE</span><h2>{nameOf(selected)}</h2><p>{selected.biography || "No biography provided."}</p><div className="detail-grid"><span>Department<strong>{selected.department_name || "-"}</strong></span><span>Specialization<strong>{selected.specialization || "-"}</strong></span><span>Email<strong>{selected.email || "-"}</strong></span><span>Phone<strong>{selected.phone || "-"}</strong></span><span>Qualification<strong>{selected.qualification || "-"}</strong></span><span>Experience<strong>{selected.experience || 0} years</strong></span><span>License<strong>{selected.license_number || "-"}</strong></span><span>Rating<strong>{Number(selected.average_rating || 0).toFixed(1)} ({selected.rating_count || 0})</strong></span><span>Schedules<strong>{selected.schedule_count || 0} active days</strong></span><span>Approval<strong>{selected.doctor_status || "pending"}</strong></span></div>{selected.doctor_status === "pending" && <div className="modal-actions"><button type="button" className="danger-action" onClick={() => updateApproval(selected, "reject")}><FaTimes /> Reject</button><button type="button" className="success-action" onClick={() => updateApproval(selected, "approve")}><FaCheck /> Approve</button></div>}<div className="doctor-delete-footer"><button type="button" className="delete-patient-button" onClick={deleteDoctor} disabled={deleting}><FaTrash /> {deleting ? "Deleting..." : "Delete doctor permanently"}</button></div></div></div>}
    </div>;
}
