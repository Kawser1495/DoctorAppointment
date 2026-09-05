import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarCheck, FaEye, FaTimes } from "react-icons/fa";
import { getAdminAppointments, updateAdminAppointmentStatus } from "../../services/appointmentService";
import "./AdminAppointments.css";

const statusOptions = ["Pending", "Confirmed", "Completed", "Cancelled", "Rejected", "No Show"];

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getAdminAppointments().then((response) => {
            const data = response?.data;
            setAppointments(Array.isArray(data) ? data : data?.results || []);
        }).catch((requestError) => setError(requestError?.response?.data?.detail || "Unable to load appointments.")).finally(() => setLoading(false));
    }, []);

    const changeStatus = async (id, nextStatus) => {
        try {
            await updateAdminAppointmentStatus(id, nextStatus);
            setAppointments((items) => items.map((item) => item.id === id ? { ...item, status: nextStatus } : item));
            setSelected((item) => item ? { ...item, status: nextStatus } : null);
        } catch (requestError) { setError(requestError?.response?.data?.detail || "Unable to update appointment status."); }
    };

    return <div className="admin-management-page"><header className="management-header"><div><Link to="/admin/dashboard" className="management-back"><FaArrowLeft /> Dashboard</Link><span className="management-kicker">OPERATIONS / BOOKINGS</span><h1>Appointments</h1><p>Track every booking and keep appointment status accurate for patients and doctors.</p></div><div className="management-total"><strong>{appointments.length}</strong><span>appointments</span></div></header>{error && <div className="management-alert"><FaTimes /> {error}</div>}{loading ? <div className="management-empty">Loading appointments...</div> : <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Booking</th><th>Patient</th><th>Family member</th><th>Doctor</th><th>Department</th><th>Date</th><th>Time slot</th><th>Status</th><th>Payment</th><th>View</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}><td><strong>{appointment.booking_number}</strong></td><td>{appointment.patient_name || appointment.patient_profile?.full_name || "-"}</td><td>{appointment.family_member_name || "Self"}</td><td>{appointment.doctor_name || "-"}</td><td>{appointment.department_name || "-"}</td><td>{appointment.appointment_date || "-"}</td><td>{appointment.slot_time || appointment.appointment_time || "-"}</td><td><select className={`status-select ${String(appointment.status || "").toLowerCase().replace(" ", "-")}`} value={appointment.status} onChange={(event) => changeStatus(appointment.id, event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></td><td><span className="status-chip approved">{appointment.payment_status || "Unpaid"}</span></td><td><button type="button" className="icon-action" title="View appointment" onClick={() => setSelected(appointment)}><FaEye /></button></td></tr>)}</tbody></table></div>}{selected && <div className="management-modal" role="dialog" aria-modal="true"><div className="management-modal-card"><button type="button" className="modal-close" onClick={() => setSelected(null)}><FaTimes /></button><span className="management-kicker">BOOKING DETAILS</span><h2>{selected.booking_number}</h2><div className="detail-grid"><span>Patient<strong>{selected.patient_name || "-"}</strong></span><span>Family member<strong>{selected.family_member_name || "Self"}</strong></span><span>Doctor<strong>{selected.doctor_name || "-"}</strong></span><span>Department<strong>{selected.department_name || "-"}</strong></span><span>Date<strong>{selected.appointment_date || "-"}</strong></span><span>Time slot<strong>{selected.slot_time || "-"}</strong></span></div><p><strong>Reason:</strong> {selected.reason || "No reason provided."}</p><div className="modal-actions"><FaCalendarCheck /><select className="status-select" value={selected.status} onChange={(event) => changeStatus(selected.id, event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></div></div></div>}</div>;
}
