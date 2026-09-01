import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./DoctorLayout.css";

export default function DoctorLayout({ children }) {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            logout();
            navigate("/login");
        }
    };

    const navItems = [
        {
            label: "Dashboard",
            icon: "fas fa-home",
            path: "/doctor/dashboard",
            id: "dashboard",
        },
        {
            label: "My Patients",
            icon: "fas fa-users",
            path: "/doctor/patients",
            id: "patients",
        },
        {
            label: "My Profile",
            icon: "fas fa-user-md",
            path: "/doctor/profile",
            id: "profile",
        },
        {
            label: "Schedule",
            icon: "fas fa-calendar-alt",
            path: "/doctor/schedule",
            id: "schedule",
        },
        {
            label: "Prescriptions",
            icon: "fas fa-prescription-bottle",
            path: "/doctor/prescriptions",
            id: "prescriptions",
        },
        {
            label: "Notifications",
            icon: "fas fa-bell",
            path: "/doctor/notifications",
            id: "notifications",
        },
        {
            label: "Analytics",
            icon: "fas fa-chart-bar",
            path: "/doctor/analytics",
            id: "analytics",
        },
        {
            label: "Settings",
            icon: "fas fa-cog",
            path: "/doctor/settings",
            id: "settings",
        },
    ];

    const isActive = (path) => {
        return window.location.pathname === path;
    };

    return (
        <div className="doctor-layout">
            {/* Sidebar */}
            <aside className={`doctor-layout__sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
                <div className="doctor-layout__sidebar-header">
                    <h3 className="doctor-layout__logo">
                        <i className="fas fa-clinic-medical me-2" />
                        {sidebarOpen && "DocApp"}
                    </h3>
                    <button
                        className="doctor-layout__toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <i className={`fas fa-${sidebarOpen ? "chevron-left" : "chevron-right"}`} />
                    </button>
                </div>

                {/* Doctor Info */}
                {sidebarOpen && user && (
                    <div className="doctor-layout__user-info">
                        <div className="doctor-layout__avatar">
                            <i className="fas fa-user-circle" />
                        </div>
                        <div className="doctor-layout__user-details">
                            <p className="doctor-layout__user-name">{user.first_name || "Doctor"}</p>
                            <p className="doctor-layout__user-role">Doctor</p>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="doctor-layout__nav">
                    <ul className="doctor-layout__nav-list">
                        {navItems.map((item) => (
                            <li key={item.id} className="doctor-layout__nav-item">
                                <a
                                    href={item.path}
                                    className={`doctor-layout__nav-link ${
                                        isActive(item.path) ? "active" : ""
                                    }`}
                                >
                                    <i className={`${item.icon} doctor-layout__nav-icon`} />
                                    {sidebarOpen && (
                                        <span className="doctor-layout__nav-label">{item.label}</span>
                                    )}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="doctor-layout__sidebar-footer">
                    <button
                        className="doctor-layout__logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <i className="fas fa-sign-out-alt" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="doctor-layout__main">
                <main className="doctor-layout__content">
                    {children}
                </main>
            </div>
        </div>
    );
}
