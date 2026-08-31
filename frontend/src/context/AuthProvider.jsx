import {
    useEffect,
    useState,
} from "react";

import AuthContext from "./AuthContext";


export default function AuthProvider({ children }) {

    const [isAuthenticated, setIsAuthenticated] =
        useState(false);

    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    // ==========================================================
    // Normalize User
    // ==========================================================

    const normalizeUser = (userData) => {

        if (!userData) {
            return null;
        }

        return {
            ...userData,

            role: userData.role
                ? String(userData.role)
                    .trim()
                    .toLowerCase()
                : null,
        };

    };


    // ==========================================================
    // Load Stored Authentication
    // ==========================================================

    useEffect(() => {

        const loadAuthentication = () => {

            try {

                const accessToken =
                    localStorage.getItem("access") ||
                    sessionStorage.getItem("access");

                const refreshToken =
                    localStorage.getItem("refresh") ||
                    sessionStorage.getItem("refresh");

                const storedUser =
                    localStorage.getItem("user") ||
                    sessionStorage.getItem("user");


                // ------------------------------------------------
                // No authentication data
                // ------------------------------------------------

                if (
                    !accessToken ||
                    !refreshToken ||
                    !storedUser
                ) {

                    setUser(null);
                    setIsAuthenticated(false);

                    return;

                }


                // ------------------------------------------------
                // Parse User
                // ------------------------------------------------

                const parsedUser =
                    JSON.parse(storedUser);


                const normalizedUser =
                    normalizeUser(parsedUser);


                // ------------------------------------------------
                // Validate Role
                // ------------------------------------------------

                if (!normalizedUser?.role) {

                    console.warn(
                        "AuthProvider: Stored user has no role."
                    );

                    setUser(null);
                    setIsAuthenticated(false);

                    return;

                }


                console.log(
                    "AuthProvider: Stored authentication loaded",
                    {
                        user: normalizedUser,
                        role: normalizedUser.role,
                    }
                );


                // ------------------------------------------------
                // Set State
                // ------------------------------------------------

                setUser(normalizedUser);

                setIsAuthenticated(true);

            } catch (error) {

                console.error(
                    "AuthProvider: Failed to load authentication",
                    error
                );


                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("user");

                sessionStorage.removeItem("access");
                sessionStorage.removeItem("refresh");
                sessionStorage.removeItem("user");


                setUser(null);
                setIsAuthenticated(false);

            } finally {

                setLoading(false);

            }

        };


        loadAuthentication();

    }, []);


    // ==========================================================
    // Login
    // ==========================================================

    const login = (
        accessToken,
        refreshToken,
        userData,
        rememberMe = true
    ) => {

        if (
            !accessToken ||
            !refreshToken ||
            !userData
        ) {

            console.error(
                "AuthProvider: Incomplete login data."
            );

            return false;

        }


        const normalizedUser =
            normalizeUser(userData);


        if (!normalizedUser?.role) {

            console.error(
                "AuthProvider: User role is missing.",
                userData
            );

            return false;

        }


        console.log(
            "AuthProvider: Saving login user",
            normalizedUser
        );


        const userJSON =
            JSON.stringify(normalizedUser);


        // ======================================================
        // Clear Previous Authentication
        // ======================================================

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");
        sessionStorage.removeItem("user");


        // ======================================================
        // Save Authentication
        // ======================================================

        if (rememberMe) {

            localStorage.setItem(
                "access",
                accessToken
            );

            localStorage.setItem(
                "refresh",
                refreshToken
            );

            localStorage.setItem(
                "user",
                userJSON
            );

        } else {

            sessionStorage.setItem(
                "access",
                accessToken
            );

            sessionStorage.setItem(
                "refresh",
                refreshToken
            );

            sessionStorage.setItem(
                "user",
                userJSON
            );

        }


        // ======================================================
        // Update React State
        // ======================================================

        setUser(normalizedUser);

        setIsAuthenticated(true);


        console.log(
            "AuthProvider: Authentication state updated",
            {
                isAuthenticated: true,
                role: normalizedUser.role,
            }
        );


        return true;

    };


    // ==========================================================
    // Logout
    // ==========================================================

    const logout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        localStorage.removeItem("rememberMe");

        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");
        sessionStorage.removeItem("user");


        setUser(null);
        setIsAuthenticated(false);

    };


    // ==========================================================
    // Context
    // ==========================================================

    return (

        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                loading,
                login,
                logout,
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}