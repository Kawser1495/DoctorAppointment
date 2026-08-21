import {
    useEffect,
    useState,
} from "react";

import AuthContext from "./AuthContext";


// ==========================================================
// Auth Provider
// ==========================================================

export default function AuthProvider({ children }) {

    const [
        isAuthenticated,
        setIsAuthenticated,
    ] = useState(false);

    const [
        loading,
        setLoading,
    ] = useState(true);


    // ======================================================
    // Check Existing Authentication
    // ======================================================

    useEffect(() => {

        const accessToken =
            localStorage.getItem("access") ||
            sessionStorage.getItem("access");

        const refreshToken =
            localStorage.getItem("refresh") ||
            sessionStorage.getItem("refresh");


        setIsAuthenticated(
            Boolean(
                accessToken &&
                refreshToken
            )
        );

        setLoading(false);

    }, []);


    // ======================================================
    // Login
    // ======================================================

    const login = (
        accessToken,
        refreshToken,
        rememberMe = true
    ) => {

        if (!accessToken || !refreshToken) {

            console.error(
                "Access token or refresh token missing."
            );

            return;

        }


        if (rememberMe) {

            localStorage.setItem(
                "access",
                accessToken
            );

            localStorage.setItem(
                "refresh",
                refreshToken
            );

            sessionStorage.removeItem("access");
            sessionStorage.removeItem("refresh");

        } else {

            sessionStorage.setItem(
                "access",
                accessToken
            );

            sessionStorage.setItem(
                "refresh",
                refreshToken
            );

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");

        }


        setIsAuthenticated(true);

    };


    // ======================================================
    // Logout
    // ======================================================

    const logout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("rememberMe");

        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");

        setIsAuthenticated(false);

    };


    // ======================================================
    // Context
    // ======================================================

    return (

        <AuthContext.Provider
            value={{
                isAuthenticated,
                loading,
                login,
                logout,
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}