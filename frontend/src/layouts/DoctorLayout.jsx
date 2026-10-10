import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import AuthContext from "../context/AuthContext";
import "./DoctorLayout.css";

function DoctorLayout({ children }) {
    const { logout } = useContext(AuthContext);
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
            label: "Medical Reports",
            icon: "fas fa-file-medical",
            path: "/doctor/medical-reports",
            id: "medical-reports",
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
            label: "Kaium",
            icon: "fas fa-users",
            path: "/doctor/Kaium",
            id: "kaium",
        },
        {
            label: "Settings",
            icon: "fas fa-cog",
            path: "/doctor/settings",
            id: "settings",
        },
    ];

    return (
        <div className="doctor-layout">
            {/* Sidebar */}
            <aside className={`doctor-layout__sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
                <div className="doctor-layout__sidebar-header">
                    <h3 className="doctor-layout__logo">
                        <span className="doctor-layout__logo-mark"><FaHeartbeat /></span>
                        {sidebarOpen && <span><strong>MediCare</strong><small>Connect</small></span>}
                    </h3>
                    <button
                        className="doctor-layout__toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <i className={`fas fa-${sidebarOpen ? "chevron-left" : "chevron-right"}`} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="doctor-layout__nav" aria-label="Doctor dashboard navigation">
                    <ul className="doctor-layout__nav-list">
                        {navItems.map((item) => (
                            <li key={item.id} className="doctor-layout__nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive: active }) =>
                                        `doctor-layout__nav-link ${active ? "active" : ""}`
                                    }

                                    /* side ber click*/
                                    onClick={(e) => {
                                        if (item.label === "") {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                
                                    <i className={`${item.icon} doctor-layout__nav-icon`} />
                                    {sidebarOpen && (
                                        <span className="doctor-layout__nav-label">{item.label}</span>
                                    )}
                                </NavLink>
                                
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="doctor-layout__sidebar-footer">
                    <button
                        type="button"
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

export { DoctorLayout };
export default DoctorLayout;


