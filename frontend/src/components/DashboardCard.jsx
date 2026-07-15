import React from "react";
import "./DashboardCard.css";

function DashboardCard({
    title,
    value,
    icon,
    color = "#0D6EFD",
    subtitle = "",
    trend = "",
}) {
    return (
        <div
            className="dashboard-card"
            style={{
                borderTop: `5px solid ${color}`,
            }}
        >
            {/* Card Header */}
            <div className="card-header">

                <div className="card-title-section">

                    <h5 className="card-title">
                        {title}
                    </h5>

                    {subtitle && (
                        <p className="card-subtitle">
                            {subtitle}
                        </p>
                    )}

                </div>

                <div
                    className="card-icon"
                    style={{
                        backgroundColor: `${color}15`,
                        color: color,
                    }}
                >
                    {icon}
                </div>

            </div>

            {/* Card Body */}

            <div className="card-body">

                <h2 className="card-value">
                    {value}
                </h2>

            </div>

            {/* Card Footer */}

            {trend && (
                <div className="card-footer">

                    <span className="trend">
                        {trend}
                    </span>

                </div>
            )}

        </div>
    );
}

export default DashboardCard;