import React from "react";

function DashboardCard({ title, value }) {

    return (

        <div
            style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0px 2px 8px rgba(0,0,0,.1)",
                width: "220px",
            }}
        >

            <h5>{title}</h5>

            <h2>{value}</h2>

        </div>

    );

}

export default DashboardCard;