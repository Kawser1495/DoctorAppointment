import React from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import WelcomeBanner from "../../components/WelcomeBanner";
import DashboardCard from "../../components/DashboardCard";

import {
    FaCalendarCheck,
    FaClock,
    FaCheckCircle,
    FaUserMd,
    FaFileMedical,
    FaMoneyBillWave,
    FaUsers,
    FaBell
} from "react-icons/fa";

import "../../styles/dashboard.css";

function Dashboard() {

    return (

        <>

            {/* Navbar */}

            <Navbar />

            {/* Dashboard Layout */}

            <div className="dashboard-container">

                {/* Sidebar */}

                <Sidebar />

                {/* Main Content */}

                <div className="dashboard-content">

                    {/* Welcome Banner */}

                    <WelcomeBanner />

                    {/* Dashboard Cards */}

                    <div className="card-container">

                        <DashboardCard
                            title="Appointments"
                            value="12"
                            color="#0D6EFD"
                            icon={<FaCalendarCheck />}
                        />

                        <DashboardCard
                            title="Pending"
                            value="3"
                            color="#F59E0B"
                            icon={<FaClock />}
                        />

                        <DashboardCard
                            title="Completed"
                            value="9"
                            color="#10B981"
                            icon={<FaCheckCircle />}
                        />

                        <DashboardCard
                            title="Doctors"
                            value="15"
                            color="#8B5CF6"
                            icon={<FaUserMd />}
                        />

                        <DashboardCard
                            title="Medical Reports"
                            value="7"
                            color="#EF4444"
                            icon={<FaFileMedical />}
                        />

                        <DashboardCard
                            title="Payments"
                            value="৳3500"
                            color="#14B8A6"
                            icon={<FaMoneyBillWave />}
                        />

                        <DashboardCard
                            title="Family Members"
                            value="2"
                            color="#EC4899"
                            icon={<FaUsers />}
                        />

                        <DashboardCard
                            title="Notifications"
                            value="5"
                            color="#6366F1"
                            icon={<FaBell />}
                        />

                    </div>

                </div>

            </div>

        </>

    );

}

export default Dashboard;