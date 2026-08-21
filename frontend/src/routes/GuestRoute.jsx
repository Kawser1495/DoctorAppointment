import { Navigate } from "react-router-dom";

import useAuth from "../context/useAuth";


export default function GuestRoute({
    children,
}) {

    const {
        isAuthenticated,
        loading,
    } = useAuth();


    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >

                Loading...

            </div>

        );

    }


    // ==========================================================
    // Already Logged In
    // ==========================================================

    if (isAuthenticated) {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );

    }


    // ==========================================================
    // Guest
    // ==========================================================

    return children;

}