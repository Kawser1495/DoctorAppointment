import React from "react";

import "./DashboardCard.css";

function DashboardCard({

    title,

    value,

    color,

    icon

}){

    return(

        <div

            className="dashboard-card"

            style={{

                borderLeft:`6px solid ${color}`

            }}

        >

            <div className="card-top">

                <div>

                    <h5>

                        {title}

                    </h5>

                    <h2>

                        {value}

                    </h2>

                </div>

                <div

                    className="card-icon"

                    style={{

                        color:color

                    }}

                >

                    {icon}

                </div>

            </div>

        </div>

    )

}

export default DashboardCard;