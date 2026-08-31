import {
    useEffect,
} from "react";

import {
    Navigate,
} from "react-router-dom";

import useAuth from "../../context/useAuth";


// ==========================================================
// Dashboard
//
// This component is ONLY a role-based dashboard router.
//
// IMPORTANT:
// Do not render Navbar / Sidebar / DashboardCard here.
// Each role has its own actual dashboard.
//
// Patient:
//     /patient/dashboard
//
// Doctor:
//     /doctor/dashboard
//
// Admin:
//     /admin/dashboard
//
// Receptionist:
//     /dashboard
// ==========================================================

function Dashboard() {

    const {
        user,
        isAuthenticated,
        loading,
    } = useAuth();


    // ======================================================
    // Debug
    // ======================================================

    useEffect(() => {

        if (!loading) {

            console.log(
                "GENERAL DASHBOARD REDIRECT:",
                {
                    isAuthenticated,
                    user,
                    role: user?.role,
                }
            );

        }

    }, [
        loading,
        isAuthenticated,
        user,
    ]);


    // ======================================================
    // Authentication Loading
    // ======================================================

    if (loading) {

        return (

            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight: "100vh",
                }}
            >

                <div className="text-center">

                    <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                    />

                    <h5 className="mb-0">
                        Loading Dashboard...
                    </h5>

                </div>

            </div>

        );

    }


    // ======================================================
    // Not Authenticated
    // ======================================================

    if (!isAuthenticated || !user) {

        return (

            <Navigate
                to="/login"
                replace
            />

        );

    }


    // ======================================================
    // Normalize Role
    // ======================================================

    const role =
        String(
            user.role || ""
        )
            .trim()
            .toLowerCase();


    // ======================================================
    // Role-Based Dashboard Routes
    // ======================================================

    const dashboardRoutes = {

        patient:
            "/patient/dashboard",

        doctor:
            "/doctor/dashboard",

        admin:
            "/admin/dashboard",

        receptionist:
            "/dashboard",

    };


    const dashboardPath =
        dashboardRoutes[role];


    // ======================================================
    // Unknown Role
    // ======================================================

    if (!dashboardPath) {

        console.error(
            "Unknown user role:",
            user.role
        );


        return (

            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight: "100vh",
                    padding: "30px",
                }}
            >

                <div
                    className="alert alert-danger text-center"
                    style={{
                        maxWidth: "500px",
                        width: "100%",
                    }}
                >

                    <h4 className="mb-3">
                        Dashboard Access Error
                    </h4>

                    <p className="mb-2">

                        Your account does not have
                        a valid dashboard role.

                    </p>

                    <strong>
                        Role:
                    </strong>

                    {" "}

                    {user.role || "Not assigned"}

                </div>

            </div>

        );

    }


    // ======================================================
    // Redirect
    // ======================================================

    console.log(
        "REDIRECTING DASHBOARD:",
        {
            role,
            dashboardPath,
        }
    );


    return (

        <Navigate
            to={dashboardPath}
            replace
        />

    );

}


export default Dashboard;