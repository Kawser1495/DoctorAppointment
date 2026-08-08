import {
    Navigate,
} from "react-router-dom";

import useAuth
    from "../context/useAuth";


function GuestRoute({
    children,
}) {

    const {
        isAuthenticated,
        loading,
    } = useAuth();


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >

                Loading...

            </div>

        );

    }


    // ======================================================
    // Already Logged In
    // ======================================================

    if (isAuthenticated) {

        return (

            <Navigate
                to="/dashboard"
                replace
            />

        );

    }


    return children;

}


export default GuestRoute;