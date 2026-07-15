import React from "react";

function Navbar() {
    return (
        <nav
            style={{
                height: "70px",
                background: "#0d6efd",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 30px",
            }}
        >
            <h3>Doctor Appointment System</h3>

            <div>

                Welcome, Patient

            </div>

        </nav>
    );
}

export default Navbar;