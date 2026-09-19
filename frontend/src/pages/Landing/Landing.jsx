import {
    FaArrowRight,
    FaCalendarCheck,
    FaChartLine,
    FaClipboardList,
    FaHeartbeat,
    FaLock,
    FaNotesMedical,
    FaStethoscope,
    FaUserMd,
    FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Landing.css";

const roles = [
    {
        icon: <FaUsers />,
        title: "Patients",
        description: "Book visits, manage family members, pay securely, and follow your care records.",
        link: "Register as a patient",
        path: "/register",
    },
    {
        icon: <FaUserMd />,
        title: "Doctors",
        description: "Apply to join, manage availability, review appointments, and share clinical reports.",
        link: "Register as a doctor",
        path: "/register",
    },
    {
        icon: <FaChartLine />,
        title: "Administrators",
        description: "Oversee users, doctors, appointments, diagnostics, payments, reports, and analytics.",
        link: "Admin sign in",
        path: "/login",
    },
];

const workflow = [
    {
        icon: <FaCalendarCheck />,
        title: "Simple appointment booking",
        description: "Find the right specialist, choose an available slot, and keep every booking in one place.",
    },
    {
        icon: <FaStethoscope />,
        title: "Trusted doctor profiles",
        description: "Explore departments, doctor expertise, consultation fees, schedules, and availability.",
    },
    {
        icon: <FaNotesMedical />,
        title: "Organised health records",
        description: "Access prescriptions, medical reports, diagnostic results, and follow-up information securely.",
    },
];

function Brand() {
    return (
        <Link className="landing-brand" to="/" aria-label="MediCare home">
            <span className="landing-brand-mark"><FaHeartbeat /></span>
            <span>
                <strong>MediCare</strong>
                <small>DOCTOR APPOINTMENT SYSTEM</small>
            </span>
        </Link>
    );
}

function OverviewGraphic() {
    return (
        <div className="overview-graphic" aria-label="MediCare appointment overview">
            <div className="overview-topline">
                <span>Today at MediCare</span>
                <span className="live-state"><i /> Live</span>
            </div>
            <div className="overview-title">
                <span className="overview-mini-icon"><FaHeartbeat /></span>
                <span><strong>Care, in one view</strong><small>Everything you need for your visit</small></span>
            </div>
            <div className="overview-chart-label"><span>Appointments</span><b>Connected</b></div>
            <div className="overview-chart" aria-hidden="true">
                <i /><i /><i /><i className="highlight" /><i /><i className="gold" /><i />
            </div>
            <ul className="overview-list">
                <li><FaCalendarCheck /> Flexible schedules</li>
                <li><FaClipboardList /> Digital reports</li>
                <li><FaLock /> Clear progress tracking</li>
            </ul>
        </div>
    );
}

export default function Landing() {
    return (
        <main className="landing-page">
            <header className="landing-header landing-shell">
                <Brand />
                <nav className="landing-nav" aria-label="Public navigation">
                    <Link to="/login">Sign in</Link>
                    <Link className="landing-nav-cta" to="/register">Create account <FaArrowRight /></Link>
                </nav>
            </header>

            <section className="landing-hero landing-shell">
                <div className="hero-copy">
                    <p className="eyebrow"><FaHeartbeat /> Care coordination, made clearer</p>
                    <h1>Healthcare<br />that fits into<br /><em>your day.</em></h1>
                    <p className="hero-description">Book trusted doctors, manage appointments, complete diagnostic tests, and keep your medical journey connected in one calm, secure space.</p>
                    <div className="hero-actions">
                        <Link className="primary-button" to="/register">Get started <FaArrowRight /></Link>
                        <Link className="secondary-button" to="/login">I already have an account</Link>
                    </div>
                    <div className="hero-notes"><span><FaHeartbeat /> Role-based access</span><span><FaLock /> Secure account flow</span></div>
                </div>
                <div className="landing-hero-visual"><div className="visual-backdrop" /><OverviewGraphic /></div>
            </section>

            <section className="landing-section landing-shell">
                <p className="eyebrow">Built around your role</p>
                <h2>One system, three focused<br />experiences.</h2>
                <div className="role-grid">
                    {roles.map((role) => (
                        <article className="role-card" key={role.title}>
                            <span className="feature-icon">{role.icon}</span>
                            <h3>{role.title}</h3>
                            <p>{role.description}</p>
                            <Link to={role.path}>{role.link} <FaArrowRight /></Link>
                        </article>
                    ))}
                </div>
            </section>

            <section className="landing-section workflow-section landing-shell">
                <div className="section-heading-row">
                    <div><p className="eyebrow">A better care workflow</p><h2>Everything you need before and after the visit.</h2></div>
                    <p className="section-aside">Designed for fewer missed details and a smoother experience for every person involved.</p>
                </div>
                <div className="workflow-grid">
                    {workflow.map((item) => (
                        <article className="workflow-card" key={item.title}>
                            <span className="feature-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="landing-final landing-shell">
                <div><p className="eyebrow">Start in minutes</p><h2>Your next appointment is<br />closer than you think.</h2></div>
                <ol><li><span>01</span>Create a patient or doctor account</li><li><span>02</span>Sign in to your role-based dashboard</li><li><span>03</span>Manage appointments, care, and reports</li></ol>
                <Link className="final-button" to="/register">Create your account <FaArrowRight /></Link>
            </section>
        </main>
    );
}