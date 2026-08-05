import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../context/useAuth";

export default function Logout() {

    const navigate = useNavigate();

    const { logout } = useAuth();

    useEffect(() => {

        logout();

        navigate("/login", {
            replace: true,
        });

    }, [logout, navigate]);

    return (

        <div
            className="text-center mt-5"
        >

            <h3>

                Logging out...

            </h3>

        </div>

    );

}