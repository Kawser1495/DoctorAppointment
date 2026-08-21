import {
    Navigate,
} from "react-router-dom";

import useAuth from "../context/useAuth";


export default function ProtectedRoute({
    children,
}) {

    const {
        isAuthenticated,
        loading,
    } = useAuth();


    if (loading) {

        return (

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: "600",
                }}
            >

                Loading...

            </div>

        );

    }


    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    return children;

}