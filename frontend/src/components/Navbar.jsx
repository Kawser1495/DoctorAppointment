import React, { useState } from "react";

import {
    FaBell,
    FaUserCircle,
    FaSearch,
    FaChevronDown
} from "react-icons/fa";

import "./Navbar.css";

function Navbar() {

    const [showMenu, setShowMenu] = useState(false);

    return (

        <nav className="navbar">

            <div className="navbar-left">

                <h2>

                    🏥 Doctor Appointment System

                </h2>

            </div>

            <div className="navbar-center">

                <div className="search-box">

                    <FaSearch />

                    <input

                        type="text"

                        placeholder="Search..."

                    />

                </div>

            </div>

            <div className="navbar-right">

                <div className="notification">

                    <FaBell size={22} />

                    <span className="badge">

                        3

                    </span>

                </div>

                <div

                    className="profile"

                    onClick={() => setShowMenu(!showMenu)}

                >

                    <FaUserCircle size={35} />

                    <span>

                        Kawser

                    </span>

                    <FaChevronDown />

                </div>

                {showMenu && (

                    <div className="dropdown">

                        <p>My Profile</p>

                        <p>Settings</p>

                        <p>Logout</p>

                    </div>

                )}

            </div>

        </nav>

    );

}

export default Navbar;