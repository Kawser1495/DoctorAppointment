import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Dashboard from "../pages/Dashboard/Dashboard";

export default function AppRoutes(){

    return(

        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Login/>}/>

                <Route path="/register" element={<Register/>}/>

                <Route path="/dashboard" element={<Dashboard/>}/>

            </Routes>

        </BrowserRouter>

    )

}