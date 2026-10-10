import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaPlus, FaTimes } from "react-icons/fa";
import {
    createAdminSchedule,
    deleteAdminSchedule,
    getAdminDoctors,
    getAdminSchedules,
    setAdminSlotAvailability,
    updateAdminSchedule,
} from "../../services/doctorService";
import "./AdminSchedules.css";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const emptyForm = { doctor: "", day: "Monday", start_time: "09:00", end_time: "13:00", slot_duration_minutes: 30, max_patient_per_slot: 1, is_active: true };

const listData = (response) => {
    const data = response?.data;
    return Array.isArray(data) ? data : data?.results || [];
};

export default function AdminSchedules() {
    const [schedules, setSchedules] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            const [scheduleResponse, doctorResponse] = await Promise.all([getAdminSchedules(), getAdminDoctors()]);
            setSchedules(listData(scheduleResponse));
            setDoctors(listData(doctorResponse));
            setError("");
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to load schedules.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
        setForm({ ...emptyForm, doctor: doctors[0]?.id ? String(doctors[0].id) : "" });
        setError("");
    };

    const openEdit = (schedule) => {
        setEditing(schedule);
        setFormOpen(true);
        setForm({ doctor: schedule.doctor, day: schedule.day, start_time: schedule.start_time?.slice(0, 5) || "09:00", end_time: schedule.end_time?.slice(0, 5) || "13:00", slot_duration_minutes: schedule.slot_duration_minutes, max_patient_per_slot: schedule.max_patient_per_slot, is_active: schedule.is_active });
        setError("");
    };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, slot_duration_minutes: Number(form.slot_duration_minutes), max_patient_per_slot: Number(form.max_patient_per_slot) };
            if (editing?.id) {
                delete payload.doctor;
                await updateAdminSchedule(editing.id, payload);
            } else {
                await createAdminSchedule(payload);
            }
            setEditing(null);
            setFormOpen(false);
            setForm(emptyForm);
            await load();
        } catch (requestError) {
            const data = requestError?.response?.data;
            setError(data?.detail || Object.values(data || {}).flat().join(" ") || "Unable to save schedule.");
        } finally {
            setSaving(false);
        }
    };

    const toggleSlot = async (schedule, slot) => {
        try {
            await setAdminSlotAvailability(slot.id, !slot.is_active);
            setSchedules((items) => items.map((item) => item.id === schedule.id ? { ...item, slots: item.slots.map((current) => current.id === slot.id ? { ...current, is_active: !slot.is_active } : current) } : item));
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to update time slot.");
        }
    };

    const remove = async (schedule) => {
        if (!window.confirm(`Delete ${schedule.doctor_name || "this"} schedule?`)) return;
        try {
            await deleteAdminSchedule(schedule.id);
            setSchedules((items) => items.filter((item) => item.id !== schedule.id));
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to delete schedule.");
        }
    };

    const approvedDoctors = doctors.filter((doctor) => (doctor.doctor_status || doctor.approval_status) === "approved" && doctor.is_available !== false);

    return (
        <div className="admin-schedules-page">
            <style>{`.schedule-header-actions{display:flex;align-items:center;gap:14px}.schedule-add,.schedule-save{display:inline-flex;align-items:center;gap:7px;padding:10px 14px;border:0;border-radius:8px;background:#23736d;color:#fff;font-weight:800;cursor:pointer}.schedule-add:hover,.schedule-save:hover{background:#185c57}.schedule-add:disabled,.schedule-save:disabled{opacity:.6;cursor:wait}.schedule-modal{position:fixed;inset:0;z-index:500;display:grid;place-items:center;padding:20px;background:rgba(16,47,56,.55)}.schedule-modal-card{position:relative;width:min(560px,100%);padding:28px;border-radius:16px;background:#fff;box-shadow:0 24px 70px rgba(16,47,56,.25)}.schedule-modal-card h2{margin:0 0 20px;color:#16313a}.schedule-modal-card label{display:flex;flex-direction:column;gap:6px;margin:12px 0;color:#668187;font-size:12px;font-weight:800}.schedule-modal-card input,.schedule-modal-card select{padding:9px;border:1px solid #cfe1df;border-radius:7px;background:#fff;color:#16313a;font:inherit}.schedule-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.schedule-checkbox{display:flex!important;flex-direction:row!important;align-items:center}.schedule-checkbox input{accent-color:#23736d}.schedule-modal-close{position:absolute;top:16px;right:16px;border:0;background:transparent;color:#789397;cursor:pointer}@media(max-width:700px){.schedule-header-actions{align-items:stretch;flex-direction:column}.schedule-form-grid{grid-template-columns:1fr}}`}</style>
            <header className="schedule-header"><div><Link to="/admin/dashboard" className="schedule-back"><FaArrowLeft /> Dashboard</Link><span className="schedule-kicker">OPERATIONS / AVAILABILITY</span><h1>Schedules &amp; Time Slots</h1><p>Keep clinic hours predictable and appointment capacity under control.</p></div><div className="schedule-header-actions"><button type="button" className="schedule-add" onClick={openCreate}><FaPlus /> Add schedule</button><div className="schedule-total"><strong>{schedules.length}</strong><span>schedules</span></div></div></header>
            {error && <div className="schedule-alert"><FaTimes /> {error}</div>}
            {loading ? <div className="schedule-empty">Loading schedules...</div> : <div className="schedule-list">{schedules.map((schedule) => <article className="schedule-card" key={schedule.id}><div className="schedule-card-head"><div className="schedule-doctor"><div className="schedule-icon"><FaCalendarAlt /></div><div><h2>{schedule.doctor_name || "Doctor"}</h2><p>{schedule.day} · {schedule.start_time} - {schedule.end_time}</p></div></div><span className={`schedule-status ${schedule.is_active ? "active" : "inactive"}`}>{schedule.is_active ? "Active" : "Inactive"}</span><button type="button" className="schedule-edit" onClick={() => openEdit(schedule)}>Edit</button><button type="button" className="schedule-delete" onClick={() => remove(schedule)} aria-label="Delete schedule"><FaTimes /></button></div><div className="schedule-meta"><span>Slot duration<strong>{schedule.slot_duration_minutes} min</strong></span><span>Maximum patients<strong>{schedule.max_patient_per_slot} / slot</strong></span><span>Time slots<strong>{schedule.slots?.length || 0} generated</strong></span></div><div className="slot-grid">{(schedule.slots || []).map((slot) => <button type="button" className={`slot-chip ${slot.is_active ? "active" : "inactive"}`} key={slot.id} onClick={() => toggleSlot(schedule, slot)}><strong>{slot.slot_time}</strong><small>{slot.is_active ? "Active" : "Inactive"}</small></button>)}</div></article>)}</div>}
            {formOpen && <div className="schedule-modal" role="dialog" aria-modal="true"><form className="schedule-modal-card" onSubmit={save}><button type="button" className="schedule-modal-close" onClick={() => { setEditing(null); setFormOpen(false); setForm(emptyForm); }} aria-label="Close"><FaTimes /></button><h2>{editing?.id ? "Edit schedule" : "Add schedule"}</h2>{!editing?.id && <label>Doctor<select value={form.doctor} onChange={(event) => setForm({ ...form, doctor: event.target.value })} required><option value="">Select approved doctor</option>{approvedDoctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.doctor_name || `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim()} · {doctor.department_name || "Unassigned"}</option>)}</select>{approvedDoctors.length === 0 && <small>No approved active doctors are available.</small>}</label>}<label>Day<select value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })}>{days.map((day) => <option key={day}>{day}</option>)}</select></label><div className="schedule-form-grid"><label>Start time<input type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} required /></label><label>End time<input type="time" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} required /></label><label>Slot duration<input type="number" min="5" max="120" value={form.slot_duration_minutes} onChange={(event) => setForm({ ...form, slot_duration_minutes: event.target.value })} required /></label><label>Maximum patients<input type="number" min="1" max="100" value={form.max_patient_per_slot} onChange={(event) => setForm({ ...form, max_patient_per_slot: event.target.value })} required /></label></div><label className="schedule-checkbox"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active schedule</label><button type="submit" className="schedule-save" disabled={saving || (!editing?.id && approvedDoctors.length === 0)}>{saving ? "Saving..." : editing?.id ? "Save changes" : "Create schedule"}</button></form></div>}
        </div>
    );
}
