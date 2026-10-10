import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarCheck, FaChartLine, FaMoneyBillWave, FaStethoscope, FaUsers, FaVials } from "react-icons/fa";
import { getAdminAnalytics } from "../../services/dashboardApi";
import "./AdminAnalytics.css";

const appointmentOrder = ["Pending", "Confirmed", "Completed", "Rejected", "Cancelled"];
const pretty = (value) => String(value || "Other").replaceAll("_", " ");

function BarList({ items, accent = "teal" }) {
    const max = Math.max(...items.map((item) => Number(item.total || 0)), 1);
    return <div className="analytics-bars">{items.length ? items.map((item) => <div className="analytics-bar-row" key={item.status || item.department || item.gender || item.normalized_gender || item.payment_mode}><div><span>{pretty(item.status || item.department || item.gender || item.normalized_gender || item.payment_mode)}</span><strong>{item.total ?? 0}</strong></div><div className="bar-track"><span className={`bar-fill ${accent}`} style={{ width: `${(Number(item.total || 0) / max) * 100}%` }} /></div></div>) : <p className="analytics-muted">No data yet.</p>}</div>;
}

export default function AdminAnalytics() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getAdminAnalytics().then(setData).catch((requestError) => setError(requestError?.response?.data?.detail || "Unable to load analytics."));
    }, []);

    if (error) return <div className="analytics-page"><div className="analytics-error">{error}</div></div>;
    if (!data) return <div className="analytics-page"><div className="analytics-loading">Loading analytics...</div></div>;

    const appointment = data.appointment_analytics || {};
    const doctor = data.doctor_statistics || {};
    const patient = data.patient_statistics || {};
    const revenue = data.revenue_analytics || {};
    const diagnostic = data.diagnostic_statistics || {};
    const appointmentByStatus = appointmentOrder.map((status) => ({ status, total: appointment.by_status?.find((item) => item.status === status)?.total || 0 }));
    const approvedDoctors = doctor.by_status?.find((item) => item.approval_status === "approved")?.total || 0;
    return <div className="analytics-page"><header className="analytics-header"><div><Link to="/admin/dashboard" className="analytics-back"><FaArrowLeft /> Dashboard</Link><span className="analytics-kicker">INSIGHTS / DECISION SUPPORT</span><h1>Reports &amp; Analytics</h1><p>Live totals for appointments, doctors, patients, payments, and diagnostic tests.</p></div><div className="analytics-badge"><FaChartLine /> Live admin view</div></header><section className="analytics-kpis"><div><FaCalendarCheck /><span>Total appointments<strong>{appointment.total || 0}</strong></span></div><div><FaStethoscope /><span>Approved doctors<strong>{approvedDoctors}</strong></span></div><div><FaUsers /><span>Active patients<strong>{patient.active_accounts || 0}</strong></span></div><div><FaMoneyBillWave /><span>Collected revenue<strong>BDT {Number(revenue.collected || 0).toLocaleString()}</strong></span></div><div><FaVials /><span>Available tests<strong>{diagnostic.available_tests || 0}</strong></span></div></section><div className="analytics-grid"><section className="analytics-card"><div className="analytics-card-heading"><div><span>OPERATIONS</span><h2>Appointment analytics</h2></div><FaCalendarCheck /></div><BarList items={appointmentByStatus} accent="blue" /></section><section className="analytics-card"><div className="analytics-card-heading"><div><span>CLINICAL NETWORK</span><h2>Doctor statistics</h2></div><FaStethoscope /></div><BarList items={(doctor.by_status || []).map((item) => ({ ...item, status: item.approval_status }))} accent="green" /></section><section className="analytics-card"><div className="analytics-card-heading"><div><span>REACH</span><h2>Patient statistics</h2></div><FaUsers /></div><div className="patient-stat-big"><strong>{patient.total || 0}</strong><span>registered patients</span></div><BarList items={patient.by_gender || []} accent="gold" /></section><section className="analytics-card"><div className="analytics-card-heading"><div><span>FINANCE</span><h2>Revenue analytics</h2></div><FaMoneyBillWave /></div><div className="analytics-finance-list"><div><span>Collected</span><strong>BDT {Number(revenue.collected || 0).toLocaleString()}</strong></div><div><span>Pending</span><strong>BDT {Number(revenue.pending || 0).toLocaleString()}</strong></div><div><span>Refunded</span><strong>BDT {Number(revenue.refunded || 0).toLocaleString()}</strong></div></div><BarList items={revenue.by_mode || []} accent="teal" /></section></div><section className="analytics-card analytics-wide"><div className="analytics-card-heading"><div><span>DIAGNOSTICS</span><h2>Diagnostic booking status</h2></div><FaVials /></div><BarList items={diagnostic.by_status || []} accent="gold" /></section><section className="analytics-card analytics-wide"><div className="analytics-card-heading"><div><span>CLINICAL NETWORK</span><h2>Top doctors by appointments</h2></div><Link to="/admin/doctors" className="analytics-inline-link">Manage doctors</Link></div>{doctor.top_doctors?.length ? <div className="analytics-top-doctors">{doctor.top_doctors.map((item) => <div key={item.name}><strong>{item.name}</strong><span>{item.department || "Unassigned"}</span><b>{item.appointments} appointments</b></div>)}</div> : <p className="analytics-muted">No doctor appointment data yet.</p>}</section></div>;
} 
