import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import WelcomeBanner from "../../components/WelcomeBanner";
import DashboardCard from "../../components/DashboardCard";

import "../../styles/dashboard.css";

function Dashboard() {

    return (

        <>

            <Navbar />

            <div className="dashboard-container">

                <Sidebar />

                <div className="dashboard-content">

                    <WelcomeBanner />

                    <div className="card-container">

                        <DashboardCard
                            title="Appointments"
                            value="10"
                        />

                        <DashboardCard
                            title="Pending"
                            value="2"
                        />

                        <DashboardCard
                            title="Completed"
                            value="8"
                        />

                        <DashboardCard
                            title="Reports"
                            value="5"
                        />

                    </div>

                </div>

            </div>

        </>

    );

}

export default Dashboard;