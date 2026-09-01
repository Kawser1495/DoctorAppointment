import { useEffect, useMemo, useState } from "react";

import api from "../../services/api";

const EMPTY_FORM = {
    day: "Monday",
    start_time: "09:00",
    end_time: "13:00",
    slot_duration_minutes: 30,
    max_patient_per_slot: 5,
    is_active: true,
};

const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const durationOptions = [15, 20, 30, 45, 60];

export default function DoctorSchedule() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("doctors/dashboard/");
            const data = response?.data?.data || response?.data || {};

            const scheduleSource = data.schedules || [];
            setSchedules(Array.isArray(scheduleSource) ? scheduleSource : []);

        } catch (err) {
            console.error("Doctor schedule load error:", err);
            setError(err?.response?.data?.detail || err?.response?.data?.message || "Unable to load schedule.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchedules();
    }, []);

    const scheduleSummary = useMemo(() => {
        const active = schedules.filter((item) => item.is_active).length;
        const totalSlots = schedules.reduce((sum, item) => sum + (item.slots?.length || 0), 0);
        return { active, totalSlots };
    }, [schedules]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const payload = {
                ...form,
                slot_duration_minutes: Number(form.slot_duration_minutes),
                max_patient_per_slot: Number(form.max_patient_per_slot),
            };

            if (editingId) {
                await api.patch(`doctors/schedules/${editingId}/`, payload);
                setSuccess("Schedule updated successfully.");
            } else {
                await api.post("doctors/schedules/", payload);
                setSuccess("Schedule created successfully.");
            }

            setForm(EMPTY_FORM);
            setEditingId(null);
            await loadSchedules();
        } catch (err) {
            console.error("Save schedule error:", err);
            setError(err?.response?.data?.detail || err?.response?.data?.message || "Unable to save schedule.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (schedule) => {
        setEditingId(schedule.id);
        setForm({
            day: schedule.day,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            slot_duration_minutes: schedule.slot_duration_minutes || 30,
            max_patient_per_slot: schedule.max_patient_per_slot || 1,
            is_active: schedule.is_active,
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this schedule?")) {
            return;
        }

        try {
            await api.delete(`doctors/schedules/${id}/`);
            setSuccess("Schedule deleted.");
            await loadSchedules();
        } catch (err) {
            console.error("Delete schedule error:", err);
            setError(err?.response?.data?.detail || err?.response?.data?.message || "Unable to delete schedule.");
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-3 mb-0">Loading schedule management...</p>
            </div>
        );
    }

    return (
        <div className="doctor-dashboard" style={{ padding: "24px" }}>
            <div className="doctor-dashboard__shell">
                <header className="doctor-dashboard__header mb-4">
                    <div>
                        <p className="doctor-dashboard__eyebrow">Scheduling</p>
                        <h2><i className="fas fa-calendar-alt me-2" />Doctor Schedule</h2>
                    </div>
                    <button className="btn btn-outline-primary" onClick={loadSchedules}>
                        <i className="fas fa-sync-alt me-2" />Refresh
                    </button>
                </header>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="row g-4 mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <p className="text-muted mb-1">Active schedules</p>
                                <h3 className="mb-0">{scheduleSummary.active}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <p className="text-muted mb-1">Generated slots</p>
                                <h3 className="mb-0">{scheduleSummary.totalSlots}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <p className="text-muted mb-1">Availability</p>
                                <h3 className="mb-0 text-success">Open</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">{editingId ? "Edit schedule" : "Add schedule"}</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Day</label>
                                        <select className="form-select" name="day" value={form.day} onChange={handleInputChange}>
                                            {dayOptions.map((day) => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Start time</label>
                                            <input type="time" className="form-control" name="start_time" value={form.start_time} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">End time</label>
                                            <input type="time" className="form-control" name="end_time" value={form.end_time} onChange={handleInputChange} required />
                                        </div>
                                    </div>

                                    <div className="row g-3 mt-1">
                                        <div className="col-md-6">
                                            <label className="form-label">Slot duration</label>
                                            <select className="form-select" name="slot_duration_minutes" value={form.slot_duration_minutes} onChange={handleInputChange}>
                                                {durationOptions.map((minutes) => (
                                                    <option key={minutes} value={minutes}>{minutes} minutes</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Max patient / slot</label>
                                            <input type="number" min="1" className="form-control" name="max_patient_per_slot" value={form.max_patient_per_slot} onChange={handleInputChange} required />
                                        </div>
                                    </div>

                                    <div className="form-check form-switch mt-3">
                                        <input className="form-check-input" type="checkbox" name="is_active" checked={form.is_active} onChange={handleInputChange} id="schedule-active" />
                                        <label className="form-check-label" htmlFor="schedule-active">Activate schedule</label>
                                    </div>

                                    <div className="d-flex gap-2 mt-4">
                                        <button className="btn btn-primary" type="submit" disabled={submitting}>
                                            {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fas fa-save me-2" />}
                                            {editingId ? "Update schedule" : "Create schedule"}
                                        </button>
                                        {editingId && (
                                            <button className="btn btn-outline-secondary" type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}>
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Schedule overview</h5>
                            </div>
                            <div className="card-body">
                                {schedules.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        <i className="fas fa-calendar-times fa-2x mb-2" />
                                        <p className="mb-0">No schedule added yet.</p>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {schedules.map((schedule) => (
                                            <div key={schedule.id} className="list-group-item px-0 py-3">
                                                <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                                                    <div>
                                                        <div className="fw-bold">{schedule.day}</div>
                                                        <div className="text-muted small">
                                                            {schedule.start_time} - {schedule.end_time}
                                                        </div>
                                                        <div className="text-muted small">
                                                            {schedule.slot_duration_minutes} min / {schedule.max_patient_per_slot} per slot
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-2 align-items-center">
                                                        <span className={`badge ${schedule.is_active ? "bg-success" : "bg-secondary"}`}>
                                                            {schedule.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(schedule)}>Edit</button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(schedule.id)}>Delete</button>
                                                    </div>
                                                </div>
                                                 <div className="mt-3 d-flex flex-wrap gap-2">
                                                    {(schedule.slots || []).map((slot) => (
                                                        <span key={slot.id} className={`badge ${slot.is_full ? "bg-danger" : slot.is_active ? "bg-primary" : "bg-secondary"}`}>
                                                            {slot.slot_time} · {slot.booked_count}/{slot.max_patient}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
