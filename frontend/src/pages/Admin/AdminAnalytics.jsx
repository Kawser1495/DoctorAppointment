import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaChartLine, FaCalendarCheck, FaMoneyBillWave, FaStethoscope, FaUsers, FaVials } from "react-icons/fa";
import { getAdminAnalytics } from "../../services/dashboardApi";
import "./AdminAnalytics.css";

const pretty = (value) => String(value || "Unknown").replaceAll("_", " ");
const maxOf = (items) => Math.max(...items.map((item) => Number(item.total || 0)), 1);

function BarList({ items, accent = "teal" }) {
    const max = maxOf(items);
    return <div className="analytics-bars">{items.length ? items.map((item) => <div className="analytics-bar-row" key={item.status || item.gender || item.payment_mode}><div><span>{pretty(item.status || item.gender || item.payment_mode)}</span><strong>{item.total ?? 0}</strong></div><div className="bar-track"><span className={`bar-fill ${accent}`} style={{ width: `${(Number(item.total || 0) / max) * 100}%` }} /></div></div>) : <p className="analytics-muted">No data yet.</p>}</div>;
}

export default function AdminAnalytics() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    useEffect(() => { getAdminAnalytics().then(setData).catch((requestError) => setError(requestError?.response?.data?.detail || "Unable to load analytics.")); }, []);
    if (error) return <div className="analytics-page"><div className="analytics-error">{error}</div></div>;
    if (!data) return <div className="analytics-page"><div className="analytics-loading">Loading analytics...</div></div>;
    const appointment = data.appointment_analytics;
    const doctor = data.doctor_statistics;
    const patient = data.patient_statistics;
    const revenue = data.revenue_analytics;
    const diagnostic = data.diagnostic_statistics;
    return <div className="analytics-page"><header className="analytics-header"><div><Link to="/admin/dashboard" className="analytics-back"><FaArrowLeft /> Dashboard</Link><span className="analytics-kicker">INSIGHTS / DECISION SUPPORT</span><h1>Reports & Analytics</h1><p>A clear operating picture for better clinic decisions.</p></div><div className="analytics-badge"><FaChartLine /> Live admin view</div></header><section className="analytics-kpis"><div><FaCalendarCheck /><span>Appointments<strong>{appointment.total}</strong></span></div><div><FaStethoscope /><span>Approved doctors<strong>{doctor.by_status.find((item) => item.approval_status === "approved")?.total || 0}</strong></span></div><div><FaUsers /><span>Active patients<strong>{patient.active_accounts}</strong></span></div><div><FaMoneyBillWave /><span>Collected revenue<strong>BDT {Number(revenue.collected || 0).toLocaleString()}</strong></span></div><div><FaVials /><span>Diagnostic bookings<strong>{diagnostic.total_bookings}</strong></span></div></section><div className="analytics-grid"><section className="analytics-card"><div className="analytics-card-heading"><div><span>OPERATIONS</span><h2>Appointment analytics</h2></div><FaCalendarCheck /></div><BarList items={appointment.by_status} accent="blue" /></section><section className="analytics-card"><div className="analytics-card-heading"><div><span>CLINICAL NETWORK</span><h2>Doctor statistics</h2></div><FaStethoscope /></div><BarList items={doctor.by_status.map((item) => ({ ...item, status: item.approval_status }))} accent="green" /></section><section className="analytics-card"><div className="analytics-card-heading"><div><span>REACH</span><h2>Patient statistics</h2></div><FaUsers /></div><div className="patient-stat-big"><strong>{patient.total}</strong><span>registered patients</span></div><BarList items={patient.by_gender} accent="gold" /></section><section className="analytics-card"><div className="analytics-card-heading"><div><span>FINANCE</span><h2>Revenue analytics</h2></div><FaMoneyBillWave /></div><div className="revenue-line"><span>Collected<strong>BDT {Number(revenue.collected || 0).toLocaleString()}</strong></span><span>Pending<strong>BDT {Number(revenue.pending || 0).toLocaleString()}</strong></span><span>Refunded<strong>BDT {Number(revenue.refunded || 0).toLocaleString()}</strong></span></div><BarList items={revenue.by_mode} accent="teal" /></section></div><section className="analytics-card analytics-wide"><div className="analytics-card-heading"><div><span>DIAGNOSTICS</span><h2>Diagnostic statistics</h2></div><span className="available-tests">{diagnostic.available_tests} active tests</span></div><BarList items={diagnostic.by_status} accent="purple" /></section><section className="analytics-card analytics-wide"><div className="analytics-card-heading"><div><span>PERFORMANCE</span><h2>Most booked doctors</h2></div></div><div className="doctor-ranking">{doctor.top_doctors.map((item, index) => <div key={`${item.name}-${index}`}><b>0{index + 1}</b><span>{item.name}<small>{item.department}</small></span><strong>{item.appointments} appointments</strong></div>)}</div></section></div>;
}
