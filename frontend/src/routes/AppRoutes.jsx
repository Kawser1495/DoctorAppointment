import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";


// ==========================================
// Payment Module
// ==========================================

import PaymentPage from "../pages/Payments/PaymentPage";
import PaymentSuccess from "../pages/Payments/PaymentSuccess";
import PaymentHistory from "../pages/Payments/PaymentHistory";
import PaymentDetails from "../pages/Payments/PaymentDetails";

// ==========================================
// Authentication
// ==========================================

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Logout from "../pages/Auth/Logout";

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
                <Route
                    path="/logout"
                    element={<Logout />}
                />

                {/* ==========================================
                    Dashboard
                ========================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ==========================================
                    Appointment Module
                ========================================== */}

                <Route
                    path="/appointments/book"
                    element={

                        <ProtectedRoute>

                            <BookAppointment />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/appointments"
                    element={
                        <ProtectedRoute>
                            <MyAppointments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/appointments/details/:id"
                    element={
                        <ProtectedRoute>
                            <AppointmentDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/appointments/success"
                    element={
                        <ProtectedRoute>
                            <AppointmentSuccess />
                        </ProtectedRoute>
                    }
                />

                {/* ==========================================
                    Doctor Module
                ========================================== */}

                <Route
                    path="/doctors"
                    element={
                        <ProtectedRoute>
                            <DoctorList />
                        </ProtectedRoute>
                    }
                />

                {/* ==========================================
                    Diagnostic Module
                ========================================== */}

                <Route
                    path="/tests"
                    element={
                        <ProtectedRoute>
                            <DiagnosticTests />
                        </ProtectedRoute>
                    }
                />

                {/* ==========================================
                    Medical Reports
                ========================================== */}

                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <MedicalReports />
                        </ProtectedRoute>
                    }
                />

                {/* ==========================================
                    Payments
                ========================================== */}

                {/* ==========================================
                    Payment Module
                ========================================== */}

                <Route
                    path="/payment"
                    element={
                        <ProtectedRoute>
                            <PaymentPage />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/payments/:id"
                    element={
                        <ProtectedRoute>
                            <PaymentDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/payment-success"
                    element={
                        <ProtectedRoute>
                            <PaymentSuccess />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/payments"
                    element={
                        <ProtectedRoute>
                            <PaymentHistory />
                        </ProtectedRoute>
                    }
                />

                {/* ==========================================
                    Family Members
                ========================================== */}

                <Route
                    path="/family"
                    element={
                        <ProtectedRoute>
                            <FamilyMembers />
                        </ProtectedRoute>
                    }
                />

                {/* ==========================================
                    Notifications
                ========================================== */}

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />

                {/* ==========================================
                    Settings
                ========================================== */}

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
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