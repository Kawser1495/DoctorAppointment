import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";


// ==========================================================
// Authentication
// ==========================================================

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Logout from "../pages/Auth/Logout";


// ==========================================================
// Dashboard
// ==========================================================

import Dashboard from "../pages/Dashboard/Dashboard";


// ==========================================================
// Appointments
// ==========================================================

import BookAppointment from "../pages/Appointments/BookAppointment";
import MyAppointments from "../pages/Appointments/MyAppointments";
import AppointmentDetails from "../pages/Appointments/AppointmentDetails";
import AppointmentSuccess from "../pages/Appointments/AppointmentSuccess";


// ==========================================================
// Doctors
// ==========================================================

import DoctorList from "../pages/Doctors/DoctorList";


// ==========================================================
// Diagnostics
// ==========================================================

import DiagnosticTests
    from "../pages/Diagnostics/DiagnosticTests";

import DiagnosticTestBooking
    from "../pages/Diagnostics/DiagnosticTestBooking";

import MyDiagnosticBookings
    from "../pages/Diagnostics/MyDiagnosticBookings";

import DiagnosticBookingDetails
    from "../pages/Diagnostics/DiagnosticBookingDetails";

import DiagnosticPayment
    from "../pages/Diagnostics/DiagnosticPayment";


// ==========================================================
// Reports
// ==========================================================

import MedicalReports from "../pages/Reports/MedicalReports";


// ==========================================================
// Payments
// ==========================================================

import PaymentPage from "../pages/Payments/PaymentPage";
import PaymentSuccess from "../pages/Payments/PaymentSuccess";
import PaymentHistory from "../pages/Payments/PaymentHistory";
import PaymentDetails from "../pages/Payments/PaymentDetails";
import PaymentReceipt from "../pages/Payments/PaymentReceipt";
import PaymentInvoice from "../pages/Payments/PaymentInvoice";


// ==========================================================
// Admin
// ==========================================================

import AdminPayments from "../pages/Admin/AdminPayments";


// ==========================================================
// Family
// ==========================================================

import FamilyMembers from "../pages/Family/FamilyMembers";


// ==========================================================
// Notifications
// ==========================================================

import Notifications from "../pages/Notifications/Notifications";


// ==========================================================
// Settings
// ==========================================================

import Settings from "../pages/Settings/Settings";


// ==========================================================
// App Routes
// ==========================================================

export default function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>


                {/* ==================================================
                    Guest Routes
                ================================================== */}

                <Route
                    path="/"
                    element={
                        <GuestRoute>
                            <Login />
                        </GuestRoute>
                    }
                />

                <Route
                    path="/login"
                    element={
                        <GuestRoute>
                            <Login />
                        </GuestRoute>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <GuestRoute>
                            <Register />
                        </GuestRoute>
                    }
                />


                {/* ==================================================
                    Logout
                ================================================== */}

                <Route
                    path="/logout"
                    element={
                        <Logout />
                    }
                />


                {/* ==================================================
                    Dashboard
                ================================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    Appointments
                ================================================== */}

                <Route
                    path="/appointments"
                    element={
                        <ProtectedRoute>
                            <MyAppointments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/appointments/book"
                    element={
                        <ProtectedRoute>
                            <BookAppointment />
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


                {/* ==================================================
                    Doctors
                ================================================== */}

                <Route
                    path="/doctors"
                    element={
                        <ProtectedRoute>
                            <DoctorList />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    Diagnostics - Test List
                ================================================== */}

                <Route
                    path="/tests"
                    element={
                        <ProtectedRoute>
                            <DiagnosticTests />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    Diagnostics - Book Test
                ================================================== */}

                <Route
                    path="/diagnostics/book/:testId"
                    element={
                        <ProtectedRoute>
                            <DiagnosticTestBooking />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    My Diagnostic Bookings
                ================================================== */}

                <Route
                    path="/my-diagnostic-bookings"
                    element={
                        <ProtectedRoute>
                            <MyDiagnosticBookings />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    Diagnostic Booking Details
                ================================================== */}

                <Route
                    path="/my-diagnostic-bookings/:id"
                    element={
                        <ProtectedRoute>
                            <DiagnosticBookingDetails />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    Diagnostic Payment
                ================================================== */}

                <Route
                    path="/diagnostic-payment/:id"
                    element={
                        <ProtectedRoute>
                            <DiagnosticPayment />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    Reports
                ================================================== */}

                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <MedicalReports />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    Payments
                ================================================== */}

                <Route
                    path="/payment"
                    element={
                        <ProtectedRoute>
                            <PaymentPage />
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

                <Route
                    path="/payments/:id"
                    element={
                        <ProtectedRoute>
                            <PaymentDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/payments/:id/receipt"
                    element={
                        <ProtectedRoute>
                            <PaymentReceipt />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/payments/:id/invoice"
                    element={
                        <ProtectedRoute>
                            <PaymentInvoice />
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


                {/* ==================================================
                    Admin
                ================================================== */}

                <Route
                    path="/admin/payments"
                    element={
                        <ProtectedRoute>
                            <AdminPayments />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    Family
                ================================================== */}

                <Route
                    path="/family"
                    element={
                        <ProtectedRoute>
                            <FamilyMembers />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    Notifications
                ================================================== */}

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    Settings
                ================================================== */}

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    404
                ================================================== */}

                <Route
                    path="*"
                    element={
                        <div
                            style={{
                                minHeight: "60vh",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center",
                            }}
                        >
                            <h2>
                                404 - Page Not Found
                            </h2>

                            <p>
                                The page you are looking for does not exist.
                            </p>
                        </div>
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}