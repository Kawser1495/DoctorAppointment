import { createContext, useState, useEffect } from "react";

// ==========================================
// Create Context
// ==========================================

const AuthContext = createContext();

// ==========================================
// Auth Provider
// ==========================================

export function AuthProvider({ children }) {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const token =
            localStorage.getItem("access") ||
            sessionStorage.getItem("access");

        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }

        setLoading(false);

    }, []);

    // ==========================================
    // Login
    // ==========================================

    const login = (access, refresh) => {

        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        setIsAuthenticated(true);

    };

    // ==========================================
    // Logout
    // ==========================================

    const logout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");

        localStorage.removeItem("rememberMe");
        setIsAuthenticated(false);

    };

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

export default AuthContext;
