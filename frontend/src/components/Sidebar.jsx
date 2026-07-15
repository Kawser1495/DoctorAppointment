import React from "react";

function Sidebar() {

    return (

        <div
            style={{
                width: "250px",
                height: "100vh",
                background: "#1f2937",
                color: "white",
                padding: "20px",
            }}
        >

            <h2>Menu</h2>

            <hr />

            <p>Dashboard</p>

            <p>Book Appointment</p>

            <p>My Appointments</p>

            <p>Doctors</p>

            <p>Medical Reports</p>

            <p>Payments</p>

            <p>Logout</p>

        </div>

    );

}

export default Sidebar;