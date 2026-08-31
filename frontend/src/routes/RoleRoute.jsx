import {
    Navigate,
} from "react-router-dom";

import useAuth from "../context/useAuth";


export default function RoleRoute({
    children,
    allowedRoles = [],
}) {

    const {
        isAuthenticated,
        user,
        loading,
    } = useAuth();


    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (

            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight: "60vh",
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
    // Not Authenticated
    // ==========================================================

    if (!isAuthenticated) {

        return (

            <Navigate
                to="/login"
                replace
            />

        );

    }


    // ==========================================================
    // User Missing
    // ==========================================================

    if (!user) {

        return (

            <Navigate
                to="/login"
                replace
            />

        );

    }


    // ==========================================================
    // Normalize Role
    // ==========================================================

    const userRole =
        String(user.role || "")
            .trim()
            .toLowerCase();


    // ==========================================================
    // Invalid Role
    // ==========================================================

    if (!userRole) {

        console.error(
            "RoleRoute: User role is missing.",
            user
        );


        return (

            <Navigate
                to="/login"
                replace
            />

        );

    }


    // ==========================================================
    // Normalize Allowed Roles
    // ==========================================================

    const normalizedAllowedRoles =
        allowedRoles.map(
            (role) =>
                String(role)
                    .trim()
                    .toLowerCase()
        );


    // ==========================================================
    // Role Authorization
    // ==========================================================

    if (
        !normalizedAllowedRoles.includes(
            userRole
        )
    ) {

        console.warn(
            "RoleRoute: Access denied.",
            {
                userRole,
                allowedRoles:
                    normalizedAllowedRoles,
            }
        );


        // ------------------------------------------------------
        // Send user to THEIR dashboard
        // ------------------------------------------------------

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
            dashboardRoutes[userRole]
            || "/dashboard";


        return (

            <Navigate
                to={dashboardPath}
                replace
            />

        );

    }


    // ==========================================================
    // Authorized
    // ==========================================================

    return children;

}