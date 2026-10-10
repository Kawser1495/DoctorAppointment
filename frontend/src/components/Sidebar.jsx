import React from "react";
import { NavLink } from "react-router-dom";

import {
    FaHome,
    FaCalendarCheck,
    FaUserMd,
    FaHeartbeat,
    FaFlask,
    FaClipboardList,
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
            name: "Book Appointments",
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
            name: "Diagnostic Tests",
            path: "/tests",
            icon: <FaFlask />,
        },

        {
            name: "My Diagnostic Bookings",
            path: "/my-diagnostic-bookings",
            icon: <FaClipboardList />,
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

        <aside className="sidebar">

            <h2 className="logo">
                <span className="logo-mark"><FaHeartbeat /></span>
                <span><strong>MediCare</strong><small>Connect</small></span>
            </h2>


            <nav className="menu">

                {menuItems.map((item) => (

                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive
                                ? "menu-item active"
                                : "menu-item"
                        }


                        onClick={(e) => {
                            if (item.name === "") {
                                e.preventDefault();
                            }
                        }}
                    >

                        <span className="icon">
                            {item.icon}
                        </span>

                        <span>
                            {item.name}
                        </span>

                    </NavLink>

                ))}

            </nav>

        </aside>

    );

}


export default Sidebar;