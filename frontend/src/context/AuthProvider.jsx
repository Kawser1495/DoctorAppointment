import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";

export default function AuthProvider({ children }) {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const token = localStorage.getItem("access");

        setIsAuthenticated(!!token);

        setLoading(false);

    }, []);

    const login = (access, refresh) => {

        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        setIsAuthenticated(true);

    };

    const logout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

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