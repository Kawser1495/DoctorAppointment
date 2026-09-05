import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaEye, FaPowerOff, FaTimes } from "react-icons/fa";
import { approveDoctor, getAdminDoctors, rejectDoctor, setDoctorAvailability } from "../../services/doctorService";
import "./AdminManagement.css";

const nameOf = (doctor) => doctor.doctor_name || `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim() || doctor.username;

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            const response = await getAdminDoctors();
            const data = response?.data;
            setDoctors(Array.isArray(data) ? data : data?.results || []);
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to load doctors.");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const updateAvailability = async (doctor) => {
        await setDoctorAvailability(doctor.id, !doctor.is_available);
        setDoctors((items) => items.map((item) => item.id === doctor.id ? { ...item, is_available: !doctor.is_available } : item));
    };

    const updateApproval = async (doctor, action) => {
        try {
            setError("");
            if (action === "approve") await approveDoctor(doctor.id);
            else await rejectDoctor(doctor.id, "Application rejected by administrator.");
            setDoctors((items) => items.map((item) => item.id === doctor.id ? { ...item, doctor_status: action === "approve" ? "approved" : "rejected" } : item));
            setSelected(null);
        } catch (requestError) { setError(requestError?.response?.data?.detail || "Unable to update doctor status."); }
    };

    return <div className="admin-management-page">
        <header className="management-header"><div><Link to="/admin/dashboard" className="management-back"><FaArrowLeft /> Dashboard</Link><span className="management-kicker">PEOPLE / CLINICIANS</span><h1>Doctors</h1><p>Review credentials, manage availability, and keep the care network healthy.</p></div><div className="management-total"><strong>{doctors.length}</strong><span>doctors</span></div></header>
        {error && <div className="management-alert"><FaTimes /> {error}</div>}
        {loading ? <div className="management-empty">Loading doctors...</div> : <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Doctor</th><th>Department</th><th>Specialization</th><th>Qualification</th><th>Experience</th><th>Fee</th><th>Status</th><th>Availability</th><th>Actions</th></tr></thead><tbody>{doctors.map((doctor) => <tr key={doctor.id}><td><strong>{nameOf(doctor)}</strong><small>{doctor.email || "No email"}</small></td><td>{doctor.department_name || "-"}</td><td>{doctor.specialization || "-"}</td><td>{doctor.qualification || "-"}</td><td>{doctor.experience || 0} yrs</td><td>BDT {Number(doctor.consultation_fee || 0).toLocaleString()}</td><td><span className={`status-chip ${doctor.doctor_status}`}>{doctor.doctor_status || "pending"}</span></td><td><button type="button" className={`availability-toggle ${doctor.is_available ? "on" : "off"}`} onClick={() => updateAvailability(doctor)}><FaPowerOff /> {doctor.is_available ? "Active" : "Inactive"}</button></td><td><button type="button" className="icon-action" title="View doctor" onClick={() => setSelected(doctor)}><FaEye /></button></td></tr>)}</tbody></table></div>}
        {selected && <div className="management-modal" role="dialog" aria-modal="true"><div className="management-modal-card"><button type="button" className="modal-close" onClick={() => setSelected(null)}><FaTimes /></button><span className="management-kicker">DOCTOR PROFILE</span><h2>{nameOf(selected)}</h2><p>{selected.biography || "No biography provided."}</p><div className="detail-grid"><span>Department<strong>{selected.department_name || "-"}</strong></span><span>Email<strong>{selected.email || "-"}</strong></span><span>Phone<strong>{selected.phone || "-"}</strong></span><span>Schedule<strong>{selected.schedule_count || 0} active days</strong></span></div>{selected.doctor_status === "pending" && <div className="modal-actions"><button type="button" className="danger-action" onClick={() => updateApproval(selected, "reject")}><FaTimes /> Reject</button><button type="button" className="success-action" onClick={() => updateApproval(selected, "approve")}><FaCheck /> Approve</button></div>}</div></div>}
    </div>;
}
