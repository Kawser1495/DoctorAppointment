import { Navigate } from "react-router-dom";

import useAuth from "../context/useAuth";

function ProtectedRoute({ children }) {

    const {

        isAuthenticated,

        loading,

    } = useAuth();

    // =====================================
    // Loading
    // =====================================

    if (loading) {

        return (

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    fontSize: "22px",
                    fontWeight: "bold",
                }}
            >

                Loading...

            </div>

        );

    }

    // =====================================
    // Not Logged In
    // =====================================

    if (!isAuthenticated) {

        return <Navigate to="/login" replace />;

    }

    // =====================================
    // Logged In
    // =====================================

    return children;

}

export default ProtectedRoute;