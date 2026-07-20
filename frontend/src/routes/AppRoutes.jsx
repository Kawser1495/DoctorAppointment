import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Dashboard from "../pages/Dashboard/Dashboard";

import BookAppointment from "../pages/Appointments/BookAppointment";
import MyAppointments from "../pages/Appointments/MyAppointments";
import AppointmentDetails from "../pages/Appointments/AppointmentDetails";
import AppointmentSuccess from "../pages/Appointments/AppointmentSuccess";

export default function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ==========================================
                   Authentication
                ========================================== */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* ==========================================
                   Dashboard
                ========================================== */}

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                {/* ==========================================
                   Appointment Module
                ========================================== */}

                <Route
                    path="/appointments/book"
                    element={<BookAppointment />}
                />

                <Route
                    path="/appointments"
                    element={<MyAppointments />}
                />

                <Route
                    path="/appointments/details/:id"
                    element={<AppointmentDetails />}
                />

                <Route
                    path="/appointments/success"
                    element={<AppointmentSuccess />}
                />

                {/* ==========================================
                   404 Page
                ========================================== */}

                <Route
                    path="*"
                    element={
                        <h2
                            style={{
                                textAlign: "center",
                                marginTop: "100px",
                            }}
                        >
                            404 - Page Not Found
                        </h2>
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}