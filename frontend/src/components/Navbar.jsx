import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell,
    FaUserMd,
    FaUserCircle,
    FaSearch,
    FaChevronDown,
} from "react-icons/fa";
import useAuth from "../context/useAuth";
import { fetchPatientProfile } from "../services/patientService";
import { getNotifications } from "../services/notificationService";
import "./Navbar.css";

function Navbar() {
    const [showMenu, setShowMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [profileImage, setProfileImage] = useState("");
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        if (user?.role !== "patient") {
            setProfileImage("");
            return undefined;
        }

        let active = true;
        const loadProfileImage = async () => {
            try {
                const response = await fetchPatientProfile();
                if (active) setProfileImage(response?.data?.profile_image || "");
            } catch {
                if (active) setProfileImage("");
            }
        };

        loadProfileImage();
        const handleProfileUpdate = () => loadProfileImage();
        window.addEventListener("patient-profile-updated", handleProfileUpdate);

        return () => {
            active = false;
            window.removeEventListener("patient-profile-updated", handleProfileUpdate);
        };
    }, [user?.role]);

    useEffect(() => {
        if (!user) {
            setUnreadNotifications(0);
            return undefined;
        }

        let active = true;
        const loadUnreadNotifications = async () => {
            try {
                const notifications = await getNotifications();
                if (active && Array.isArray(notifications)) {
                    setUnreadNotifications(
                        notifications.filter((notification) => !notification?.is_read).length
                    );
                }
            } catch {
                if (active) setUnreadNotifications(0);
            }
        };

        loadUnreadNotifications();
        window.addEventListener("notifications-updated", loadUnreadNotifications);

        return () => {
            active = false;
            window.removeEventListener("notifications-updated", loadUnreadNotifications);
        };
    }, [user]);

    const handleLogout = () => {
        setShowMenu(false);
        logout();
        navigate("/login");
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const query = searchQuery.trim().toLowerCase();
        if (!query) return;

        const destinations = [
            { keywords: ["appointment", "appointments", "booking"], path: "/appointments" },
            { keywords: ["doctor", "doctors", "specialist"], path: "/doctors" },
            { keywords: ["payment", "payments", "invoice"], path: "/payments" },
            { keywords: ["report", "reports", "medical"], path: "/reports" },
            { keywords: ["test", "tests", "diagnostic"], path: "/tests" },
            { keywords: ["family", "member"], path: "/family" },
            { keywords: ["notification", "notifications"], path: "/notifications" },
            { keywords: ["setting", "settings", "account"], path: "/settings" },
            { keywords: ["symptom", "checker"], path: "/symptom-checker" },
            { keywords: ["health", "tips"], path: "/health-tips" },
        ];
        const destination = destinations.find(({ keywords }) =>
            keywords.some((keyword) => query.includes(keyword))
        );

        if (destination) {
            setSearchQuery("");
            navigate(destination.path);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h2 className="navbar-brand">
                    <span className="navbar-brand-mark"><FaUserMd /></span>
                    <span className="navbar-brand-copy"><strong>Doctor Appointment</strong><small>System</small></span>
                </h2>
            </div>

            <div className="navbar-center">
                <form className="search-box" onSubmit={handleSearch}>
                    <button type="submit" aria-label="Search">
                        <FaSearch />
                    </button>
                    <input
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        aria-label="Search sections"
                    />
                </form>
            </div>

            <div className="navbar-right">
                <button
                    type="button"
                    className="notification"
                    onClick={() => navigate("/notifications")}
                    aria-label="Open notifications"
                >
                    <FaBell size={22} />
                    {unreadNotifications > 0 && (
                        <span className="badge" aria-label={`${unreadNotifications} unread notifications`}>
                            {unreadNotifications > 99 ? "99+" : unreadNotifications}
                        </span>
                    )}
                </button>

                <div className="profile-menu">
                    <button
                        type="button"
                        className="profile"
                        onClick={() => setShowMenu((visible) => !visible)}
                        aria-expanded={showMenu}
                        aria-label="Open profile menu"
                    >
                        {profileImage ? <img className="navbar-profile-image" src={profileImage} alt="Profile" /> : <FaUserCircle size={35} />}
                        <span>{user?.first_name || user?.username || "Profile"}</span>
                        <FaChevronDown />
                    </button>

                    {showMenu && (
                        <div className="dropdown">
                            <button type="button" onClick={() => { setShowMenu(false); navigate("/patient/profile"); }}>
                                My Profile
                            </button>
                            <button type="button" onClick={() => { setShowMenu(false); navigate("/settings"); }}>
                                Settings
                            </button>
                            <button type="button" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
