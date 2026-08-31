import {
    Navigate,
} from "react-router-dom";

import useAuth from "../context/useAuth";


// ==========================================================
// Guest Route
//
// Used for:
// - Login
// - Register
//
// If user is already authenticated,
// redirect them to their role-based dashboard.
// ==========================================================

export default function GuestRoute({
    children,
}) {

    const {
        isAuthenticated,
        user,
        loading,
    } = useAuth();


    // ==========================================================
    // Authentication Loading
    // ==========================================================

    if (loading) {

        return (

            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight: "100vh",
                }}
            >

                <div
                    className="spinner-border text-primary"
                    role="status"
                >

                    <span className="visually-hidden">
                        Loading...
                    </span>

                </div>

            </div>

        );

    }


    // ==========================================================
    // Guest User
    // ==========================================================

    if (!isAuthenticated) {

        return children;

    }


    // ==========================================================
    // Normalize User Role
    // ==========================================================

    const role = user?.role
        ? String(user.role)
            .trim()
            .toLowerCase()
        : "";


    console.log(
        "GuestRoute:",
        {
            isAuthenticated,
            user,
            role,
        }
    );


    // ==========================================================
    // Role-Based Redirect
    // ==========================================================

    const dashboardRoutes = {

        doctor:
            "/doctor/dashboard",

        patient:
            "/patient/dashboard",

        admin:
            "/admin/dashboard",

        receptionist:
            "/dashboard",

    };


    const dashboardPath =
        dashboardRoutes[role];


    // ==========================================================
    // Valid Role
    // ==========================================================

    if (dashboardPath) {

        console.log(
            "GuestRoute redirect:",
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


    // ==========================================================
    // Invalid / Missing Role
    // ==========================================================

    console.warn(
        "GuestRoute: Unknown or missing role:",
        user?.role
    );


    return (

        <Navigate
            to="/login"
            replace
        />

    );

}