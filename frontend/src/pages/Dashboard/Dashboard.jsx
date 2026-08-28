import {
    useState,
    useEffect,
    useCallback,
} from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import WelcomeBanner from "../../components/WelcomeBanner";
import DashboardCard from "../../components/DashboardCard";

import {
    getDashboardData,
} from "../../api/dashboardApi";

import {
    FaCalendarCheck,
    FaClock,
    FaCheckCircle,
    FaUserMd,
    FaFileMedical,
    FaMoneyBillWave,
    FaUsers,
    FaBell,
    FaFlask,
} from "react-icons/fa";

import "../../styles/dashboard.css";


function Dashboard() {

    // ======================================================
    // Dashboard State
    // ======================================================

    const [dashboardData, setDashboardData] =
        useState({

            // Appointments
            total_appointments: 0,
            pending_appointments: 0,
            completed_appointments: 0,

            // Diagnostic Bookings
            total_diagnostic_bookings: 0,
            pending_diagnostic_bookings: 0,
            completed_diagnostic_bookings: 0,

            // Other
            total_doctors: 0,
            total_reports: 0,
            total_payments: 0,
            family_members: 0,

            // Notifications
            total_notifications: 0,
            unread_notifications: 0,
        });


    const [loading, setLoading] =
        useState(true);


    // ======================================================
    // Load Dashboard Data
    // ======================================================

    const loadDashboard =
        useCallback(async () => {

            try {

                setLoading(true);


                const response =
                    await getDashboardData();


                console.log(
                    "Full Dashboard Response:",
                    response
                );


                const data =
                    response?.data?.data ||
                    response?.data ||
                    {};


                console.log(
                    "Dashboard Data:",
                    data
                );


                setDashboardData(
                    previousData => ({

                        ...previousData,

                        ...data,

                    })
                );

            }

            catch (error) {

                console.error(
                    "Dashboard API Error:",
                    error
                );

            }

            finally {

                setLoading(false);

            }

        }, []);


    // ======================================================
    // Load Dashboard
    // ======================================================

    useEffect(() => {

        loadDashboard();

    }, [loadDashboard]);


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="text-center mt-5">

                <h4>
                    Loading Dashboard...
                </h4>

            </div>

        );

    }


    // ======================================================
    // UI
    // ======================================================

    return (

        <>

            <Navbar />

            <div className="dashboard-container">

                <Sidebar />

                <div className="dashboard-content">

                    <WelcomeBanner />


                    <div className="card-container">


                        {/* ==================================
                            Appointment Cards
                        ================================== */}

                        <DashboardCard
                            title="Appointments"
                            value={
                                dashboardData.total_appointments
                            }
                            color="#0D6EFD"
                            icon={<FaCalendarCheck />}
                        />


                        <DashboardCard
                            title="Pending"
                            value={
                                dashboardData.pending_appointments
                            }
                            color="#F59E0B"
                            icon={<FaClock />}
                        />


                        <DashboardCard
                            title="Completed"
                            value={
                                dashboardData.completed_appointments
                            }
                            color="#10B981"
                            icon={<FaCheckCircle />}
                        />


                        {/* ==================================
                            NEW: Diagnostic Test Booking
                        ================================== */}

                        <DashboardCard
                            title="Diagnostic Bookings"
                            value={
                                dashboardData.total_diagnostic_bookings
                            }
                            color="#06B6D4"
                            icon={<FaFlask />}
                        />


                        {/* ==================================
                            Other Cards
                        ================================== */}

                        <DashboardCard
                            title="Doctors"
                            value={
                                dashboardData.total_doctors
                            }
                            color="#8B5CF6"
                            icon={<FaUserMd />}
                        />


                        <DashboardCard
                            title="Medical Reports"
                            value={
                                dashboardData.total_reports
                            }
                            color="#EF4444"
                            icon={<FaFileMedical />}
                        />


                        <DashboardCard
                            title="Payments"
                            value={
                                Number(
                                    dashboardData.total_payments || 0
                                ).toFixed(2)
                            }
                            color="#14B8A6"
                            icon={<FaMoneyBillWave />}
                        />


                        <DashboardCard
                            title="Family Members"
                            value={
                                dashboardData.family_members
                            }
                            color="#EC4899"
                            icon={<FaUsers />}
                        />


                        {/* ==================================
                            Notifications

                            Shows unread notifications
                        ================================== */}

                        <DashboardCard
                            title="Notifications"
                            value={
                                dashboardData.unread_notifications
                            }
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