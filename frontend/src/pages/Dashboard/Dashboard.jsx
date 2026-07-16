import React, { useState, useEffect } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import WelcomeBanner from "../../components/WelcomeBanner";
import DashboardCard from "../../components/DashboardCard";

import { getDashboardData } from "../../api/dashboardApi";

import {
    FaCalendarCheck,
    FaClock,
    FaCheckCircle,
    FaUserMd,
    FaFileMedical,
    FaMoneyBillWave,
    FaUsers,
    FaBell,
} from "react-icons/fa";

import "../../styles/dashboard.css";

function Dashboard() {

    // Dashboard State
    const [dashboardData, setDashboardData] = useState({
        total_appointments: 0,
        pending_appointments: 0,
        completed_appointments: 0,
        total_doctors: 0,
        total_reports: 0,
        total_payments: 0,
        family_members: 0,
        notifications: 0,
    });

    // Load Dashboard Data
    useEffect(() => {
        loadDashboard();
    }, []);

    // API Call
    const loadDashboard = async () => {

        try {

            const response = await getDashboardData();

            setDashboardData(response.data);

            console.log("Dashboard Data:", response.data);

        } catch (error) {

            console.error("Dashboard API Error:", error);

        }

    };

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
                            value={dashboardData.total_appointments}
                            color="#0D6EFD"
                            icon={<FaCalendarCheck />}
                        />

                        <DashboardCard
                            title="Pending"
                            value={dashboardData.pending_appointments}
                            color="#F59E0B"
                            icon={<FaClock />}
                        />

                        <DashboardCard
                            title="Completed"
                            value={dashboardData.completed_appointments}
                            color="#10B981"
                            icon={<FaCheckCircle />}
                        />

                        <DashboardCard
                            title="Doctors"
                            value={dashboardData.total_doctors}
                            color="#8B5CF6"
                            icon={<FaUserMd />}
                        />

                        <DashboardCard
                            title="Medical Reports"
                            value={dashboardData.total_reports}
                            color="#EF4444"
                            icon={<FaFileMedical />}
                        />

                        <DashboardCard
                            title="Payments"
                            value={dashboardData.total_payments}
                            color="#14B8A6"
                            icon={<FaMoneyBillWave />}
                        />

                        <DashboardCard
                            title="Family Members"
                            value={dashboardData.family_members}
                            color="#EC4899"
                            icon={<FaUsers />}
                        />

                        <DashboardCard
                            title="Notifications"
                            value={dashboardData.notifications}
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