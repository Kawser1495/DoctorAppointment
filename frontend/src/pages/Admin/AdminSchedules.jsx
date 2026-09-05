import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaPowerOff, FaTimes } from "react-icons/fa";
import { deleteAdminSchedule, getAdminSchedules, setAdminSlotAvailability, updateAdminSchedule } from "../../services/doctorService";
import "./AdminSchedules.css";

export default function AdminSchedules() {
    const [schedules, setSchedules] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ start_time: "", end_time: "", slot_duration_minutes: 30, max_patient_per_slot: 1, is_active: true });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        try { const response = await getAdminSchedules(); const data = response?.data; setSchedules(Array.isArray(data) ? data : data?.results || []); }
        catch (requestError) { setError(requestError?.response?.data?.detail || "Unable to load schedules."); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const save = async (event) => {
        event.preventDefault();
        try { await updateAdminSchedule(editing.id, form); setEditing(null); await load(); }
        catch (requestError) { setError(requestError?.response?.data?.detail || "Unable to update schedule."); }
    };
    const toggleSlot = async (schedule, slot) => {
        await setAdminSlotAvailability(slot.id, !slot.is_active);
        setSchedules((items) => items.map((item) => item.id === schedule.id ? { ...item, slots: item.slots.map((current) => current.id === slot.id ? { ...current, is_active: !slot.is_active } : current) } : item));
    };
    const remove = async (schedule) => {
        if (!window.confirm(`Delete ${schedule.doctor_name || "this"} schedule?`)) return;
        try { await deleteAdminSchedule(schedule.id); setSchedules((items) => items.filter((item) => item.id !== schedule.id)); }
        catch (requestError) { setError(requestError?.response?.data?.detail || "Unable to delete schedule."); }
    };

    return <div className="admin-schedules-page"><header className="schedule-header"><div><Link to="/admin/dashboard" className="schedule-back"><FaArrowLeft /> Dashboard</Link><span className="schedule-kicker">OPERATIONS / AVAILABILITY</span><h1>Schedules & Time Slots</h1><p>Keep clinic hours predictable and appointment capacity under control.</p></div><div className="schedule-total"><strong>{schedules.length}</strong><span>schedules</span></div></header>{error && <div className="schedule-alert"><FaTimes /> {error}</div>}{loading ? <div className="schedule-empty">Loading schedules...</div> : <div className="schedule-list">{schedules.map((schedule) => <article className="schedule-card" key={schedule.id}><div className="schedule-card-head"><div className="schedule-doctor"><div className="schedule-icon"><FaCalendarAlt /></div><div><h2>{schedule.doctor_name || schedule.doctor?.name || "Doctor"}</h2><p>{schedule.day} · {schedule.start_time} - {schedule.end_time}</p></div></div><span className={`schedule-status ${schedule.is_active ? "active" : "inactive"}`}>{schedule.is_active ? "Active" : "Inactive"}</span><button type="button" className="schedule-edit" onClick={() => { setEditing(schedule); setForm({ start_time: schedule.start_time, end_time: schedule.end_time, slot_duration_minutes: schedule.slot_duration_minutes, max_patient_per_slot: schedule.max_patient_per_slot, is_active: schedule.is_active }); }}>Edit</button><button type="button" className="schedule-delete" onClick={() => remove(schedule)}><FaTimes /></button></div><div className="schedule-meta"><span>Slot duration<strong>{schedule.slot_duration_minutes} min</strong></span><span>Maximum patients<strong>{schedule.max_patient_per_slot} / slot</strong></span><span>Time slots<strong>{schedule.slots?.length || 0} generated</strong></span></div><div className="slot-grid">{(schedule.slots || []).map((slot) => <button type="button" className={`slot-chip ${slot.is_active ? "active" : "inactive"}`} key={slot.id} onClick={() => toggleSlot(schedule, slot)}><span>{slot.slot_time}</span><small><FaPowerOff /> {slot.is_active ? "Active" : "Off"}</small></button>)}</div></article>)}</div>}{editing && <div className="schedule-modal" role="dialog" aria-modal="true"><form className="schedule-modal-card" onSubmit={save}><button type="button" className="schedule-close" onClick={() => setEditing(null)}><FaTimes /></button><span className="schedule-kicker">EDIT SCHEDULE</span><h2>{editing.doctor_name} · {editing.day}</h2><label>Start time<input type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} /></label><label>End time<input type="time" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} /></label><label>Slot duration (minutes)<input type="number" min="1" value={form.slot_duration_minutes} onChange={(event) => setForm({ ...form, slot_duration_minutes: event.target.value })} /></label><label>Maximum patients per slot<input type="number" min="1" value={form.max_patient_per_slot} onChange={(event) => setForm({ ...form, max_patient_per_slot: event.target.value })} /></label><label className="schedule-check"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Schedule active</label><button className="schedule-save" type="submit">Save changes</button></form></div>}</div>;
}
