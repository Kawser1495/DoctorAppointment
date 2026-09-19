import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBell, FaCalendarCheck, FaCheckCircle, FaChevronRight, FaClock, FaFlask, FaHistory, FaListOl, FaMoneyBillWave, FaRedo, FaSearch, FaSignOutAlt, FaTimesCircle, FaUsers, FaUserCircle, FaUserMd } from "react-icons/fa";
import { getDashboard } from "../../services/dashboardService";
import { getReceptionistAppointments, updateReceptionistAppointmentStatus } from "../../services/appointmentService";
import useAuth from "../../context/useAuth";
import "./ReceptionistDashboard.css";
import "./ReceptionistDashboardOverrides.css";
import "./ReceptionistQuickCards.css";

const list = (value) => Array.isArray(value) ? value : [];
const dateLabel = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "No date";
const timeLabel = (value) => value ? String(value).slice(0, 5) : "Time pending";

function ReceptionistDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [queueView, setQueueView] = useState("today");
    const [directoryView, setDirectoryView] = useState("patients");
    const [paymentView, setPaymentView] = useState("");
    const [paymentSearch, setPaymentSearch] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("all");
    const [serialLookupOpen, setSerialLookupOpen] = useState(false);
    const [serialSearch, setSerialSearch] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user, logout } = useAuth();

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [dashboardResponse, appointmentResponse] = await Promise.all([
                getDashboard(),
                getReceptionistAppointments(),
            ]);
            setDashboard(dashboardResponse?.data?.data || dashboardResponse?.data || {});
            const appointmentData = appointmentResponse?.data?.results || appointmentResponse?.data || [];
            setAppointments(list(appointmentData).map((appointment) => ({
                ...appointment,
                family_member: appointment.family_member_name || "Self",
                department: appointment.department_name || "General",
            })));
            setError("");
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Unable to load receptionist dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDashboard(); }, []);

    const todayKey = new Date().toISOString().slice(0, 10);
    const activeAppointments = appointments.filter((appointment) => ["Pending", "Confirmed"].includes(appointment.status));
    const todayAppointments = activeAppointments.filter((appointment) => appointment.appointment_date === todayKey);
    const upcomingAppointments = activeAppointments.filter((appointment) => appointment.appointment_date > todayKey);
    const visibleQueue = queueView === "today" ? todayAppointments : queueView === "upcoming" ? upcomingAppointments : activeAppointments;
    const patients = useMemo(() => list(dashboard?.receptionist_patients).filter((patient) => {
        const query = search.trim().toLowerCase();
        return !query || [patient.name, patient.phone, patient.email].join(" ").toLowerCase().includes(query);
    }), [dashboard, search]);
    const doctors = useMemo(() => list(dashboard?.receptionist_doctors).filter((doctor) => {
        const query = search.trim().toLowerCase();
        return !query || [doctor.name, doctor.phone, doctor.email, doctor.department, doctor.specialization].join(" ").toLowerCase().includes(query);
    }), [dashboard, search]);

    const statusCount = (status) => todayAppointments.filter((item) => item.status === status).length;
    const openPaymentView = (view) => {
        setPaymentView(view);
        setPaymentSearch("");
        setPaymentStatus(view === "pending" ? "Pending" : "all");
    };
    const visiblePaymentRecords = useMemo(() => list(dashboard?.payment_history_records).filter((payment) => {
        const query = paymentSearch.trim().toLowerCase();
        const matchesSearch = !query || [payment.patient_name, payment.booking_number].join(" ").toLowerCase().includes(query);
        const matchesStatus = paymentStatus === "all" || payment.payment_status === paymentStatus;
        return matchesSearch && matchesStatus;
    }), [dashboard, paymentSearch, paymentStatus]);
    const visibleSerials = useMemo(() => list(dashboard?.receptionist_appointment_serials).filter((appointment) => {
        const query = serialSearch.trim().toLowerCase();
        return !query || [appointment.patient_name, appointment.booking_number, appointment.doctor_name].join(" ").toLowerCase().includes(query);
    }), [dashboard, serialSearch]);
    const changeStatus = async (appointment, nextStatus) => {
        try {
            await updateReceptionistAppointmentStatus(appointment.id, nextStatus);
            setAppointments((items) => items.map((item) => item.id === appointment.id ? { ...item, status: nextStatus } : item));
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to update appointment status.");
        }
    };

    if (loading) return <div className="receptionist-state"><div className="receptionist-spinner" /><p>Preparing today&apos;s front desk...</p></div>;

    return <div className="receptionist-shell">
        <aside className="receptionist-rail">
            <Link to="/receptionist/dashboard" className="receptionist-brand"><span>MC</span><strong>MediCare<small>Front desk</small></strong></Link>
            <p className="receptionist-rail-label">OPERATIONS</p>
            <nav>
                <NavLink to="/receptionist/dashboard" className="active"><FaCalendarCheck /> Dashboard</NavLink>
                <a href="#queue"><FaClock /> Appointment queue</a>
                <a href="#directory" onClick={() => setDirectoryView("patients")}><FaUsers /> Patient directory</a>
                <a href="#directory" onClick={() => setDirectoryView("doctors")}><FaUserMd /> Doctor directory</a>
                <a href="#payments"><FaMoneyBillWave /> Payment desk</a>
                <a href="#diagnostics"><FaFlask /> Diagnostics</a>
                <Link to="/notifications"><FaBell /> Notifications{dashboard?.unread_notifications > 0 && <span className="receptionist-notification-badge">{dashboard.unread_notifications}</span>}</Link>
                <Link to="/receptionist/profile"><FaUserCircle /> My profile</Link>
            </nav>
            <button type="button" className="receptionist-logout" onClick={logout}><FaSignOutAlt /> Sign out</button>
        </aside>
        <main className="receptionist-main">
            <header className="receptionist-topbar"><div><span className="receptionist-kicker">FRONT DESK / LIVE OPERATIONS</span><h1>Welcome back, {user?.first_name || "Receptionist"}</h1><p>Keep the clinic moving with a clear view of today&apos;s patients and pending work.</p></div><div className="receptionist-topbar-actions"><Link to="/notifications" className="receptionist-notification-button" aria-label="Open notifications"><FaBell /><span>{dashboard?.unread_notifications ?? 0}</span></Link><div className="receptionist-date"><FaClock /><span>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span></div></div></header>
            {error && <div className="receptionist-alert">{error}<button type="button" onClick={loadDashboard}>Retry</button></div>}
            <section className="receptionist-hero"><div><span className="receptionist-kicker">TODAY&apos;S CLINIC PULSE</span><h2>{activeAppointments.length} active appointments across the clinic</h2><p>Use the queue below to confirm arrivals, update status, and keep every booking on time.</p></div><a href="#queue" className="receptionist-primary-action">Open appointment queue <FaChevronRight /></a></section>
            <section className="receptionist-kpis"><article><span className="kpi-icon blue"><FaCalendarCheck /></span><div><strong>{dashboard?.today_appointment_count ?? todayAppointments.length}</strong><small>Today&apos;s appointments</small></div></article><article><span className="kpi-icon amber"><FaClock /></span><div><strong>{dashboard?.today_pending_appointment_count ?? statusCount("Pending")}</strong><small>Waiting confirmation</small></div></article><article><span className="kpi-icon green"><FaUsers /></span><div><strong>{dashboard?.total_patients ?? patients.length}</strong><small>Patients in directory</small></div></article><article><span className="kpi-icon teal"><FaUserMd /></span><div><strong>{dashboard?.total_doctors ?? doctors.length}</strong><small>Doctors in directory</small></div></article><article className="receptionist-kpi-clickable" onClick={() => openPaymentView("pending")} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && openPaymentView("pending")}><span className="kpi-icon violet"><FaMoneyBillWave /></span><div><strong>৳ {Number(dashboard?.pending_payment_total || 0).toLocaleString()}</strong><small>{dashboard?.pending_payment_count ?? 0} pending payments</small></div></article><article><span className="kpi-icon cyan"><FaFlask /></span><div><strong>{dashboard?.today_diagnostic_bookings ?? 0}</strong><small>Diagnostic bookings today</small></div></article><Link to="/notifications" className="receptionist-kpi-notification"><span className="kpi-icon yellow"><FaBell /></span><div><strong>{dashboard?.unread_notifications ?? 0}</strong><small>Notifications</small></div><FaChevronRight /></Link><article className="receptionist-kpi-revenue"><span className="kpi-icon mint"><FaMoneyBillWave /></span><div><strong>৳ {Number(dashboard?.total_revenue || 0).toLocaleString()}</strong><small>Total revenue</small></div></article><article className="receptionist-kpi-history receptionist-kpi-clickable" onClick={() => openPaymentView("history")} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && openPaymentView("history")}><span className="kpi-icon lavender"><FaHistory /></span><div><strong>{dashboard?.payment_history_count ?? 0}</strong><small>Payment history</small></div></article><article className="receptionist-kpi-serial receptionist-kpi-clickable" onClick={() => setSerialLookupOpen(true)} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setSerialLookupOpen(true)}><span className="kpi-icon coral"><FaListOl /></span><div><strong>Serial lookup</strong><small>Find patient serial</small></div><FaChevronRight /></article></section>
            <section className="receptionist-grid">
                <div id="queue" className="receptionist-panel queue-panel"><div className="panel-heading"><div><span className="receptionist-kicker">LIVE QUEUE</span><h2>{queueView === "today" ? "Today's appointments" : queueView === "upcoming" ? "Upcoming appointments" : "All active appointments"}</h2></div><span className="panel-count">{visibleQueue.length} bookings</span></div><div className="queue-tabs">{[["today", "Today"], ["upcoming", "Upcoming"], ["all", "All active"]].map(([value, label]) => <button type="button" key={value} className={queueView === value ? "active" : ""} onClick={() => setQueueView(value)}>{label}</button>)}</div>{visibleQueue.length === 0 ? <div className="receptionist-empty">No appointments in this view.</div> : <div className="queue-list">{visibleQueue.map((appointment) => <article className="queue-row" key={appointment.id}><div className="queue-time"><strong>{timeLabel(appointment.slot_time)}</strong><span>{dateLabel(appointment.appointment_date)}</span></div><div className="queue-person"><strong>{appointment.patient_name}</strong><span>{appointment.family_member} · {appointment.doctor_name}</span><small>{appointment.department} · {appointment.booking_number} · {appointment.payment_status || "Unpaid"}</small></div><select className={`queue-status-select ${String(appointment.status).toLowerCase()}`} value={appointment.status} onChange={(event) => changeStatus(appointment, event.target.value)} aria-label={`Status for ${appointment.booking_number}`}><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select></article>)}</div>}</div>
                <div id="directory" className="receptionist-panel patient-panel"><div className="panel-heading"><div><span className="receptionist-kicker">{directoryView === "patients" ? "PATIENT LOOKUP" : "DOCTOR LOOKUP"}</span><h2>{directoryView === "patients" ? "Find a patient" : "Find a doctor"}</h2></div><FaSearch className="panel-search-icon" /></div><div className="directory-tabs"><button type="button" className={directoryView === "patients" ? "active" : ""} onClick={() => setDirectoryView("patients")}><FaUsers /> Patients</button><button type="button" className={directoryView === "doctors" ? "active" : ""} onClick={() => setDirectoryView("doctors")}><FaUserMd /> Doctors</button></div><label className="receptionist-search"><FaSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={directoryView === "patients" ? "Name, phone or email" : "Name, department or specialty"} /></label>{directoryView === "patients" ? <div className="patient-list">{patients.map((patient) => <div className="patient-row" key={patient.id}><span>{patient.name.slice(0, 1).toUpperCase()}</span><div><strong>{patient.name}</strong><small>{patient.phone}</small></div><FaChevronRight /></div>)}{patients.length === 0 && <div className="receptionist-empty">No matching patients.</div>}</div> : <div className="patient-list">{doctors.map((doctor) => <div className="patient-row" key={doctor.id}><span><FaUserMd /></span><div><strong>{doctor.name}</strong><small>{doctor.specialization} · {doctor.department}</small></div><FaChevronRight /></div>)}{doctors.length === 0 && <div className="receptionist-empty">No matching doctors.</div>}</div>}<button type="button" className="panel-link directory-link" onClick={() => setDirectoryView(directoryView === "patients" ? "doctors" : "patients")}>{directoryView === "patients" ? "Doctor directory" : "Patient directory"} <FaChevronRight /></button></div>
            </section>
            <section className="receptionist-panel upcoming-panel"><div className="panel-heading"><div><span className="receptionist-kicker">NEXT UP</span><h2>Upcoming appointments</h2></div><a href="#queue" onClick={() => setQueueView("upcoming")}>View queue <FaChevronRight /></a></div><div className="upcoming-list">{upcomingAppointments.slice(0, 5).map((appointment) => <div className="upcoming-row" key={appointment.id}><div><strong>{appointment.patient_name}</strong><span>{appointment.doctor_name} · {appointment.department}</span></div><time>{dateLabel(appointment.appointment_date)}<b>{timeLabel(appointment.slot_time)}</b></time></div>)}{upcomingAppointments.length === 0 && <div className="receptionist-empty">No upcoming appointments.</div>}</div></section>
            <section className="receptionist-quick-grid"><article id="payments" className="receptionist-quick-card"><FaMoneyBillWave /><div><span className="receptionist-kicker">PAYMENT DESK</span><strong>৳ {Number(dashboard?.pending_payment_total || 0).toLocaleString()}</strong><small>{dashboard?.pending_payment_count ?? 0} pending payments waiting for review</small></div></article><article id="diagnostics" className="receptionist-quick-card"><FaFlask /><div><span className="receptionist-kicker">DIAGNOSTICS</span><strong>Today&apos;s test bookings</strong><small>{dashboard?.today_diagnostic_bookings || 0} bookings scheduled today</small></div></article></section>
            <section className="receptionist-overview-section"><div className="receptionist-overview-heading"><div><span className="receptionist-kicker">OPERATIONS</span><h2>Appointment Overview</h2><p>Current appointment activity across the clinic.</p></div><a href="#queue">View all <FaChevronRight /></a></div><div className="receptionist-overview-cards"><article className="overview-pending"><FaClock /><div><small>Pending</small><strong>{dashboard?.appointment_overview?.pending ?? 0}</strong></div></article><article className="overview-confirmed"><FaCheckCircle /><div><small>Confirmed</small><strong>{dashboard?.appointment_overview?.confirmed ?? 0}</strong></div></article><article className="overview-completed"><FaCalendarCheck /><div><small>Completed</small><strong>{dashboard?.appointment_overview?.completed ?? 0}</strong></div></article><article className="overview-cancelled"><FaTimesCircle /><div><small>Cancelled</small><strong>{dashboard?.appointment_overview?.cancelled ?? 0}</strong></div></article></div></section>
            <section className="receptionist-overview-section"><div className="receptionist-overview-heading"><div><span className="receptionist-kicker">FINANCIAL ACTIVITY</span><h2>Payment Overview</h2><p>Current payment status across all patient services.</p></div><a href="#payments">View all <FaChevronRight /></a></div><div className="receptionist-overview-cards"><article className="overview-all"><FaMoneyBillWave /><div><small>All payments</small><strong>{dashboard?.payment_overview?.all ?? 0}</strong></div></article><article className="overview-paid"><FaCheckCircle /><div><small>Paid</small><strong>{dashboard?.payment_overview?.paid ?? 0}</strong></div></article><article className="overview-payment-pending receptionist-kpi-clickable" onClick={() => openPaymentView("pending")} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && openPaymentView("pending")}><FaClock /><div><small>Pending</small><strong>{dashboard?.payment_overview?.pending ?? 0}</strong></div></article><article className="overview-refunded"><FaRedo /><div><small>Refunded</small><strong>{dashboard?.payment_overview?.refunded ?? 0}</strong></div></article></div></section>
            {paymentView && <div className="receptionist-payment-modal-backdrop" onClick={() => setPaymentView("")}><section id="payment-records" className="receptionist-payment-records" onClick={(event) => event.stopPropagation()}><div className="receptionist-overview-heading"><div><span className="receptionist-kicker">PAYMENT DESK</span><h2>{paymentView === "pending" ? "Payment status lookup" : "Payment history"}</h2><p>Search by patient name or booking number and filter by payment status.</p></div><button type="button" onClick={() => setPaymentView("")}>Close</button></div><div className="receptionist-payment-filters"><input value={paymentSearch} onChange={(event) => setPaymentSearch(event.target.value)} placeholder="Patient name or booking number" /><select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="all">All statuses</option><option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Partially Paid">Partially Paid</option><option value="Refunded">Refunded</option></select></div><div className="receptionist-payment-list">{visiblePaymentRecords.map((payment) => <article className="receptionist-payment-row" key={payment.id}><div><strong>{payment.patient_name}</strong><small>{payment.booking_number} · {payment.payment_status}</small></div><div className="receptionist-payment-row-meta"><strong>৳ {Number(payment.amount || 0).toLocaleString()}</strong><small>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "No date"}</small></div></article>)}{visiblePaymentRecords.length === 0 && <div className="receptionist-empty">No matching payment records.</div>}</div></section></div>}
            {serialLookupOpen && <div className="receptionist-payment-modal-backdrop" onClick={() => setSerialLookupOpen(false)}><section className="receptionist-payment-records receptionist-serial-modal" onClick={(event) => event.stopPropagation()}><div className="receptionist-overview-heading"><div><span className="receptionist-kicker">TODAY&apos;S APPOINTMENT DESK</span><h2>Today&apos;s patient serial lookup</h2><p>All doctors&apos; appointments for today, ordered by doctor and scheduled time.</p></div><button type="button" onClick={() => setSerialLookupOpen(false)}>Close</button></div><div className="receptionist-payment-filters"><input value={serialSearch} onChange={(event) => setSerialSearch(event.target.value)} placeholder="Patient name or booking number" /></div><div className="receptionist-payment-list">{visibleSerials.map((appointment) => <article className="receptionist-payment-row" key={appointment.id}><div><strong>{appointment.patient_name}</strong><small>{appointment.booking_number} · Dr. {appointment.doctor_name} · {appointment.status}</small></div><div className="receptionist-payment-row-meta"><strong>Serial #{appointment.serial_number}</strong><small>{dateLabel(appointment.appointment_date)} · {timeLabel(appointment.slot_time)}</small></div></article>)}{visibleSerials.length === 0 && <div className="receptionist-empty">No matching appointments for today.</div>}</div></section></div>}
        </main>
    </div>;
}

export default ReceptionistDashboard;
