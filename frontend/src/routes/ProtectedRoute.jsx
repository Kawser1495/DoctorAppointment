import {
    Navigate,
    useLocation,
} from "react-router-dom";

import useAuth
    from "../context/useAuth";


function ProtectedRoute({
    children,
}) {

    const {
        isAuthenticated,
        loading,
    } = useAuth();


    const location =
        useLocation();


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
    // Not Authenticated
    // ======================================================

    if (!isAuthenticated) {

        return (

            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />

        );

    }


    // ======================================================
    // Authenticated
    // ======================================================

    return children;

}


export default ProtectedRoute;