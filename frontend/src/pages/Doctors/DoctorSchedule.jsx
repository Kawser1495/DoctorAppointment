import { useEffect, useMemo, useState } from "react";

import {
    createDoctorSchedule,
    deleteDoctorSchedule,
    getMyDoctorSchedules,
    updateDoctorSchedule,
    updateDoctorTimeSlot,
} from "../../services/doctorService";

import "./DoctorSchedule.css";

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

const formatTime = (value) => {

    if (!value) {
        return "";
    }

    const [hours, minutes] = value.split(":");
    const hour = Number(hours);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
};

export default function DoctorSchedule() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingSlotId, setEditingSlotId] = useState(null);
    const [slotCapacity, setSlotCapacity] = useState("");
    const [slotSavingId, setSlotSavingId] = useState(null);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyDoctorSchedules();
            const scheduleSource = response?.data?.results || response?.data || [];
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

        const duplicateDay = schedules.some((schedule) => (
            schedule.day === form.day && schedule.id !== editingId
        ));

        if (duplicateDay) {
            setError(`A schedule already exists for ${form.day}. Choose another day or edit the existing schedule.`);
            setSuccess("");
            return;
        }

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
                await updateDoctorSchedule(editingId, payload);
                setSuccess("Schedule updated successfully.");
            } else {
                await createDoctorSchedule(payload);
                setSuccess("Schedule created successfully.");
            }

            setForm(EMPTY_FORM);
            setEditingId(null);
            await loadSchedules();
        } catch (err) {
            console.error("Save schedule error:", err);
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (schedule) => {
        setEditingId(schedule.id);
        setForm({
            day: schedule.day,
            start_time: schedule.start_time?.slice(0, 5),
            end_time: schedule.end_time?.slice(0, 5),
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
            await deleteDoctorSchedule(id);
            setSuccess("Schedule deleted.");
            await loadSchedules();
        } catch (err) {
            console.error("Delete schedule error:", err);
            setError(
                err?.response?.data?.detail ||
                "Unable to delete schedule."
            );
        }
    };

    const handleToggle = async (schedule) => {

        try {
            setError("");
            setSuccess("");

            await updateDoctorSchedule(schedule.id, {
                is_active: !schedule.is_active,
            });

            setSuccess(
                schedule.is_active
                    ? "Schedule deactivated."
                    : "Schedule activated."
            );

            await loadSchedules();
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                "Unable to change schedule status."
            );
        }
    };

    const handleSlotToggle = async (slot) => {

        try {
            setSlotSavingId(slot.id);
            setError("");
            setSuccess("");

            await updateDoctorTimeSlot(slot.id, {
                is_active: !slot.is_active,
            });

            setSuccess(
                slot.is_active
                    ? "Time slot disabled."
                    : "Time slot enabled."
            );

            await loadSchedules();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSlotSavingId(null);
        }
    };

    const handleSlotCapacitySave = async (slot) => {

        const capacity = Number(slotCapacity);

        if (!Number.isInteger(capacity) || capacity < slot.booked_count) {
            setError(
                `Capacity must be at least ${slot.booked_count} for this slot.`
            );
            return;
        }

        try {
            setSlotSavingId(slot.id);
            setError("");
            setSuccess("");

            await updateDoctorTimeSlot(slot.id, {
                max_patient: capacity,
            });

            setEditingSlotId(null);
            setSlotCapacity("");
            setSuccess("Slot capacity updated.");
            await loadSchedules();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSlotSavingId(null);
        }
    };

    const startSlotEdit = (slot) => {
        setEditingSlotId(slot.id);
        setSlotCapacity(slot.max_patient);
    };

    const getErrorMessage = (err) => {
        const data = err?.response?.data;

        if (typeof data?.detail === "string") {
            return data.detail;
        }

        if (data && typeof data === "object") {
            return Object.entries(data)
                .flatMap(([field, value]) => {
                    const messages = Array.isArray(value) ? value : [value];
                    return messages.map((message) => `${field}: ${message}`);
                })
                .join(" ");
        }

        return "Unable to save schedule.";
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
        <div className="doctor-schedule-page">
            <div className="doctor-schedule__shell">
                <header className="doctor-schedule-header">
                    <div>
                        <p className="doctor-schedule-eyebrow">Availability control</p>
                        <h1>Doctor Schedule</h1>
                        <p className="doctor-schedule-subtitle">
                            Set when patients can book you and how each visit is paced.
                        </p>
                    </div>
                    <button className="doctor-schedule-refresh" onClick={loadSchedules}>
                        <i className="fas fa-sync-alt" />
                        Refresh
                    </button>
                </header>

                {error && <div className="doctor-schedule-alert error">{error}</div>}
                {success && <div className="doctor-schedule-alert success">{success}</div>}

                <div className="doctor-schedule-stats">
                    <div className="doctor-schedule-stat">
                        <span className="doctor-schedule-stat-icon">◷</span>
                        <div>
                            <p>Active days</p>
                            <strong>{scheduleSummary.active}</strong>
                        </div>
                    </div>
                    <div className="doctor-schedule-stat">
                        <span className="doctor-schedule-stat-icon">▦</span>
                        <div>
                            <p>Bookable slots</p>
                            <strong>{scheduleSummary.totalSlots}</strong>
                        </div>
                    </div>
                    <div className="doctor-schedule-stat highlight">
                        <span className="doctor-schedule-stat-icon">✓</span>
                        <div>
                            <p>Availability</p>
                            <strong>{scheduleSummary.active ? "Open" : "Closed"}</strong>
                        </div>
                    </div>
                </div>

                <div className="doctor-schedule-layout">
                    <section className="doctor-schedule-form-card">
                        <div className="doctor-schedule-card-heading">
                            <div>
                                <p className="doctor-schedule-eyebrow">{editingId ? "Update hours" : "New availability"}</p>
                                <h2>{editingId ? "Edit schedule" : "Add schedule"}</h2>
                            </div>
                            <span className="doctor-schedule-heading-mark">+</span>
                        </div>
                        <form onSubmit={handleSubmit} className="doctor-schedule-form">
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
                    </section>

                    <section className="doctor-schedule-list-card">
                        <div className="doctor-schedule-card-heading">
                            <div>
                                <p className="doctor-schedule-eyebrow">Your weekly rhythm</p>
                                <h2>Schedule overview</h2>
                            </div>
                            <span className="doctor-schedule-count">{schedules.length} day{schedules.length === 1 ? "" : "s"}</span>
                        </div>
                        <div className="doctor-schedule-list">
                                {schedules.length === 0 ? (
                                    <div className="doctor-schedule-empty">
                                        <i className="fas fa-calendar-times fa-2x mb-2" />
                                        <p className="mb-0">No schedule added yet.</p>
                                    </div>
                                ) : (
                                    <div>
                                        {schedules.map((schedule) => (
                                            <div key={schedule.id} className="doctor-schedule-row">
                                                <div className="doctor-schedule-row-main">
                                                    <div>
                                                        <div className="doctor-schedule-day">{schedule.day}</div>
                                                        <div className="doctor-schedule-time">
                                                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                        </div>
                                                        <div className="doctor-schedule-meta">
                                                            {schedule.slot_duration_minutes} min / {schedule.max_patient_per_slot} per slot
                                                        </div>
                                                    </div>
                                                    <div className="doctor-schedule-actions">
                                                        <span className={`doctor-schedule-status ${schedule.is_active ? "active" : "inactive"}`}>
                                                            {schedule.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                        <button className="doctor-schedule-action edit" onClick={() => handleEdit(schedule)}>Edit</button>
                                                        <button className="doctor-schedule-action" onClick={() => handleToggle(schedule)}>{schedule.is_active ? "Deactivate" : "Activate"}</button>
                                                        <button className="doctor-schedule-action danger" onClick={() => handleDelete(schedule.id)}>Delete</button>
                                                    </div>
                                                </div>
                                                <div className="doctor-schedule-slots">
                                                    {(schedule.slots || []).map((slot) => (
                                                        <div key={slot.id} className={`doctor-slot-card ${slot.is_full ? "full" : slot.is_active ? "available" : "closed"}`}>
                                                            <div className="doctor-slot-card-topline">
                                                                <strong>{formatTime(slot.slot_time)}</strong>
                                                                <span className="doctor-slot-status">
                                                                    {!slot.is_active ? "Disabled" : slot.is_full ? "Full" : "Open"}
                                                                </span>
                                                            </div>
                                                            <div className="doctor-slot-capacity">
                                                                <span>Booked <b>{slot.booked_count} / {slot.max_patient}</b></span>
                                                                <span>{slot.is_active ? `${slot.remaining_seats} available` : "Not bookable"}</span>
                                                            </div>
                                                            {editingSlotId === slot.id ? (
                                                                <div className="doctor-slot-edit-row">
                                                                    <input
                                                                        type="number"
                                                                        min={slot.booked_count}
                                                                        max="100"
                                                                        value={slotCapacity}
                                                                        onChange={(event) => setSlotCapacity(event.target.value)}
                                                                        aria-label={`Maximum patients for ${formatTime(slot.slot_time)}`}
                                                                    />
                                                                    <button type="button" onClick={() => handleSlotCapacitySave(slot)} disabled={slotSavingId === slot.id}>Save</button>
                                                                    <button type="button" className="cancel" onClick={() => setEditingSlotId(null)}>Cancel</button>
                                                                </div>
                                                            ) : (
                                                                <div className="doctor-slot-actions">
                                                                    <button type="button" onClick={() => startSlotEdit(slot)}>Edit capacity</button>
                                                                    <button type="button" onClick={() => handleSlotToggle(slot)} disabled={slotSavingId === slot.id}>
                                                                        {slot.is_active ? "Disable" : "Enable"}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
