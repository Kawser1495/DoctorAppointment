import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard(){

    const navigate = useNavigate();

    useEffect(() => {

        const token = localStorage.getItem("access");

        if(!token){

            navigate("/");

        }

    }, []);

    return(

        <div className="container mt-5">

            <h2>Dashboard</h2>

            <h4>Welcome to Doctor Appointment System</h4>

        </div>

    )

}