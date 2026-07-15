import React from "react";
import { NavLink } from "react-router-dom";

import {
    FaHome,
    FaCalendarCheck,
    FaUserMd,
    FaFlask,
    FaFileMedical,
    FaMoneyBillWave,
    FaUsers,
    FaBell,
    FaCog,
    FaSignOutAlt,
} from "react-icons/fa";

import "./Sidebar.css";

function Sidebar() {

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <FaHome />,
        },
        {
            name: "Book Appointment",
            path: "/appointments/book",
            icon: <FaCalendarCheck />,
        },
        {
            name: "My Appointments",
            path: "/appointments",
            icon: <FaCalendarCheck />,
        },
        {
            name: "Doctors",
            path: "/doctors",
            icon: <FaUserMd />,
        },
        {
            name: "AI Assistant",
            path: "/ai",
            icon: <FaRobot />,
        },
        {
            name: "Diagnostic Tests",
            path: "/tests",
            icon: <FaFlask />,
        },
        {
            name: "Medical Reports",
            path: "/reports",
            icon: <FaFileMedical />,
        },
        {
            name: "Payments",
            path: "/payments",
            icon: <FaMoneyBillWave />,
        },
        {
            name: "Family Members",
            path: "/family",
            icon: <FaUsers />,
        },
        {
            name: "Notifications",
            path: "/notifications",
            icon: <FaBell />,
        },
        {
            name: "Settings",
            path: "/settings",
            icon: <FaCog />,
        },
        {
            name: "Logout",
            path: "/logout",
            icon: <FaSignOutAlt />,
        },
    ];

    return (

        <div className="sidebar">

            <h2 className="logo">

                Doctor Appointment

            </h2>

            <div className="menu">

                {menuItems.map((item, index) => (

                    <NavLink

                        key={index}

                        to={item.path}

                        className={({ isActive }) =>
                            isActive
                                ? "menu-item active"
                                : "menu-item"
                        }

                    >

                        <span className="icon">

                            {item.icon}

                        </span>

                        {item.name}

                    </NavLink>

                ))}

            </div>

        </div>

    );

}

export default Sidebar;