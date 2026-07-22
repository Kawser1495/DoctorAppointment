import { BrowserRouter, Routes, Route } from "react-router-dom";

// ==========================================
// Authentication
// ==========================================

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

// ==========================================
// Dashboard
// ==========================================

import Dashboard from "../pages/Dashboard/Dashboard";

// ==========================================
// Appointment Module
// ==========================================

import BookAppointment from "../pages/Appointments/BookAppointment";
import MyAppointments from "../pages/Appointments/MyAppointments";
import AppointmentDetails from "../pages/Appointments/AppointmentDetails";
import AppointmentSuccess from "../pages/Appointments/AppointmentSuccess";

// ==========================================
// Doctor Module
// ==========================================

import DoctorList from "../pages/Doctors/DoctorList";

// ==========================================
// Diagnostic Module
// ==========================================

import DiagnosticTests from "../pages/Diagnostics/DiagnosticTests";

// ==========================================
// Report Module
// ==========================================

import MedicalReports from "../pages/Reports/MedicalReports";

// ==========================================
// Payment Module
// ==========================================

import Payments from "../pages/Payments/Payments";

// ==========================================
// Family Module
// ==========================================

import FamilyMembers from "../pages/Family/FamilyMembers";

// ==========================================
// Notification Module
// ==========================================

import Notifications from "../pages/Notifications/Notifications";

// ==========================================
// Settings Module
// ==========================================

import Settings from "../pages/Settings/Settings";

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
                    Doctor Module
                ========================================== */}

                <Route
                    path="/doctors"
                    element={<DoctorList />}
                />

                {/* ==========================================
                    Diagnostic Module
                ========================================== */}

                <Route
                    path="/tests"
                    element={<DiagnosticTests />}
                />

                {/* ==========================================
                    Medical Reports
                ========================================== */}

                <Route
                    path="/reports"
                    element={<MedicalReports />}
                />

                {/* ==========================================
                    Payments
                ========================================== */}

                <Route
                    path="/payments"
                    element={<Payments />}
                />

                {/* ==========================================
                    Family Members
                ========================================== */}

                <Route
                    path="/family"
                    element={<FamilyMembers />}
                />

                {/* ==========================================
                    Notifications
                ========================================== */}

                <Route
                    path="/notifications"
                    element={<Notifications />}
                />

                {/* ==========================================
                    Settings
                ========================================== */}

                <Route
                    path="/settings"
                    element={<Settings />}
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