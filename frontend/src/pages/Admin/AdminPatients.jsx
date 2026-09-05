import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarCheck, FaCreditCard, FaUsers, FaTimes } from "react-icons/fa";
import { getAdminPatientDetails, getAdminPatients } from "../../services/adminService";
import "./AdminManagement.css";

export default function AdminPatients() {
    const [patients, setPatients] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getAdminPatients().then((response) => {
            const data = response?.data;
            setPatients(Array.isArray(data) ? data : data?.results || []);
        }).catch((requestError) => setError(requestError?.response?.data?.detail || "Unable to load patients.")).finally(() => setLoading(false));
    }, []);

    const openPatient = async (patient) => {
        try { setSelected((await getAdminPatientDetails(patient.id))?.data); } catch (requestError) { setError(requestError?.response?.data?.detail || "Unable to load patient details."); }
    };

    return <div className="admin-management-page"><header className="management-header"><div><Link to="/admin/dashboard" className="management-back"><FaArrowLeft /> Dashboard</Link><span className="management-kicker">PEOPLE / CARE RECIPIENTS</span><h1>Patients</h1><p>Review profiles, family context, care history, and account status.</p></div><div className="management-total"><strong>{patients.length}</strong><span>patients</span></div></header>{error && <div className="management-alert"><FaTimes /> {error}</div>}{loading ? <div className="management-empty">Loading patients...</div> : <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Patient</th><th>Contact</th><th>Profile</th><th>Family</th><th>Account</th><th>Action</th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id}><td><strong>{patient.full_name || patient.username}</strong><small>@{patient.username}</small></td><td>{patient.email || "-"}<small>{patient.phone || "No phone"}</small></td><td>{patient.gender || "-"}<small>{patient.blood_group || "Blood group unknown"}</small></td><td>{patient.family_members?.length || 0} members</td><td><span className={`status-chip ${patient.is_active ? "approved" : "rejected"}`}>{patient.is_active ? "Active" : "Inactive"}</span></td><td><button type="button" className="view-record" onClick={() => openPatient(patient)}>View details</button></td></tr>)}</tbody></table></div>}{selected && <div className="management-modal" role="dialog" aria-modal="true"><div className="management-modal-card patient-card"><button type="button" className="modal-close" onClick={() => setSelected(null)}><FaTimes /></button><span className="management-kicker">PATIENT PROFILE</span><h2>{selected.full_name}</h2><p>{selected.email} · {selected.phone || "No phone"}</p><div className="patient-metrics"><div><FaUsers /><strong>{selected.family_members?.length || 0}</strong><span>Family members</span></div><div><FaCalendarCheck /><strong>{selected.appointment_history?.length || 0}</strong><span>Appointments</span></div><div><FaCreditCard /><strong>{selected.payment_history?.length || 0}</strong><span>Payments</span></div></div><div className="patient-detail-columns"><section><h3>Profile information</h3><p>Gender: {selected.gender || "-"}</p><p>Date of birth: {selected.date_of_birth || "-"}</p><p>Blood group: {selected.blood_group || "-"}</p><p>Address: {selected.address || "-"}</p></section><section><h3>Family members</h3>{selected.family_members?.length ? selected.family_members.map((member) => <p key={member.id}>{member.name} · {member.relation}</p>) : <p>No family members added.</p>}</section></div></div></div>}</div>;
}
