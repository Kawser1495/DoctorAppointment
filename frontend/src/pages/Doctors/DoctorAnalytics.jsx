import { useEffect, useState } from "react";

import DoctorLayout from "../../layouts/DoctorLayout";
import { getDoctorAnalytics } from "../../services/doctorService";
import "./DoctorAnalytics.css";

const statusColors = {
    Pending: "#f59e0b",
    Confirmed: "#0ea5a4",
    Completed: "#22a866",
    Cancelled: "#ef6461",
    Rejected: "#a855f7",
};

const formatMonth = (value) => value
    ? new Date(value).toLocaleDateString(undefined, { month: "short" })
    : "-";

export default function DoctorAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError("");
            setAnalytics((await getDoctorAnalytics()).data);
        } catch (loadError) {
            setError(loadError?.response?.data?.detail || "Unable to load analytics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAnalytics(); }, []);

    const summary = analytics?.summary || {};
    const weekly = analytics?.weekly_appointments || [];
    const statusDistribution = analytics?.status_distribution || [];
    const maxWeekly = Math.max(...weekly.map((item) => item.total), 1);
    const totalStatuses = statusDistribution.reduce((sum, item) => sum + item.total, 0) || 1;
    const completionRate = summary.total_appointments
        ? Math.round((summary.completed_appointments / summary.total_appointments) * 100)
        : 0;

    const statCards = [
        ["Total Patients", summary.total_patients || 0, "fas fa-users", "primary"],
        ["Total Appointments", summary.total_appointments || 0, "fas fa-calendar-check", "info"],
        ["Completed", summary.completed_appointments || 0, "fas fa-check-circle", "success"],
        ["Cancelled", summary.cancelled_appointments || 0, "fas fa-calendar-xmark", "danger"],
        ["Pending Requests", summary.pending_requests || 0, "fas fa-clock", "warning"],
    ];

    if (loading) return <DoctorLayout><div className="doctor-analytics__loading">Loading analytics...</div></DoctorLayout>;

    return (
        <DoctorLayout>
            <div className="doctor-analytics">
                <header className="doctor-analytics__header"><div><p className="doctor-analytics__eyebrow">Practice intelligence</p><h1>Doctor Analytics</h1><p>Understand your patient flow, appointment demand and completion rate.</p></div><button type="button" onClick={loadAnalytics}><i className="fas fa-sync-alt" /> Refresh</button></header>
                {error && <div className="doctor-analytics__alert">{error}</div>}
                <div className="doctor-analytics__stats">{statCards.map(([label, value, icon, tone]) => <div className={`doctor-analytics__stat ${tone}`} key={label}><div><span>{label}</span><strong>{value}</strong></div><i className={icon} /></div>)}</div>
                <div className="doctor-analytics__grid">
                    <section className="doctor-analytics__panel weekly"><div className="doctor-analytics__panel-heading"><div><p>Last 7 days</p><h2>Weekly appointments</h2></div><span>{summary.total_appointments || 0} total</span></div><div className="doctor-analytics__bars">{weekly.map((item) => <div className="doctor-analytics__bar-item" key={item.date}><strong>{item.total}</strong><div className="doctor-analytics__bar-track"><div style={{ height: `${Math.max((item.total / maxWeekly) * 100, item.total ? 8 : 2)}%` }} /></div><span>{item.label}</span></div>)}</div></section>
                    <section className="doctor-analytics__panel status"><div className="doctor-analytics__panel-heading"><div><p>All appointments</p><h2>Status distribution</h2></div><span>{completionRate}% complete</span></div><div className="doctor-analytics__status-list">{statusDistribution.length ? statusDistribution.map((item) => <div className="doctor-analytics__status-row" key={item.status}><i style={{ background: statusColors[item.status] || "#94a3b8" }} /><span>{item.status}</span><b>{item.total}</b><em>{Math.round((item.total / totalStatuses) * 100)}%</em></div>) : <p className="doctor-analytics__muted">No appointment data yet.</p>}</div></section>
                    <section className="doctor-analytics__panel monthly"><div className="doctor-analytics__panel-heading"><div><p>Current month</p><h2>Monthly appointments</h2></div></div><div className="doctor-analytics__mini-chart">{(analytics?.monthly_appointments || []).map((item) => <div key={item.month}><strong>{item.total}</strong><span style={{ height: `${Math.max(item.total * 10, 8)}px` }} /><small>{formatMonth(item.month)}</small></div>)}</div></section>
                    <section className="doctor-analytics__panel growth"><div className="doctor-analytics__panel-heading"><div><p>Current month</p><h2>Patient growth</h2></div></div><div className="doctor-analytics__growth-value"><strong>{(analytics?.patient_growth || []).reduce((sum, item) => sum + item.total, 0)}</strong><span>unique patient visits recorded</span></div></section>
                </div>
            </div>
        </DoctorLayout>
    );
}