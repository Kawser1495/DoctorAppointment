import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import RoleRoute from "./RoleRoute";


// ==========================================================
// Authentication
// ==========================================================

import Login
    from "../pages/Auth/Login";

import Register
    from "../pages/Auth/Register";

import Logout
    from "../pages/Auth/Logout";


// ==========================================================
// General Dashboard
// ==========================================================

import Dashboard
    from "../pages/Dashboard/Dashboard";


// ==========================================================
// Admin
// ==========================================================

import AdminDashboard
    from "../pages/Admin/AdminDashboard";

import AdminUsers
    from "../pages/Admin/AdminUsers";

import AdminPayments
    from "../pages/Admin/AdminPayments";

import AdminSupport
    from "../pages/Admin/AdminSupport";

import AdminDoctorRequests
    from "../pages/Admin/AdminDoctorRequests";

import AdminDoctors
    from "../pages/Admin/AdminDoctors";

import AdminPatients
    from "../pages/Admin/AdminPatients";

import AdminDepartments
    from "../pages/Admin/AdminDepartments";

import AdminAppointments
    from "../pages/Admin/AdminAppointments";

import AdminSchedules
    from "../pages/Admin/AdminSchedules";

import AdminDiagnostics
    from "../pages/Admin/AdminDiagnostics";


// ==========================================================
// Doctor
// ==========================================================

import DoctorDashboard
    from "../pages/Doctors/DoctorDashboard";

import DoctorAppointmentDetails
    from "../pages/Doctors/DoctorAppointmentDetails";

import DoctorAppointments
    from "../pages/Doctors/DoctorAppointments";

import DoctorProfile
    from "../pages/Doctors/DoctorProfile";

import DoctorSchedule
    from "../pages/Doctors/DoctorSchedule";

import DoctorPatients
    from "../pages/Doctors/DoctorPatients";

import DoctorPrescriptions
    from "../pages/Doctors/DoctorPrescriptions";

import DoctorNotifications
    from "../pages/Doctors/DoctorNotifications";

import DoctorAnalytics
    from "../pages/Doctors/DoctorAnalytics";

import DoctorSettings
    from "../pages/Doctors/DoctorSettings";

import DoctorList
    from "../pages/Doctors/DoctorList";


// ==========================================================
// Patient
// ==========================================================

import PatientDashboard
    from "../pages/Patients/PatientDashboard";


// ==========================================================
// Appointments
// ==========================================================

import BookAppointment
    from "../pages/Appointments/BookAppointment";

import MyAppointments
    from "../pages/Appointments/MyAppointments";

import AppointmentDetails
    from "../pages/Appointments/AppointmentDetails";

import AppointmentSuccess
    from "../pages/Appointments/AppointmentSuccess";


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

import MedicalReports
    from "../pages/Reports/MedicalReports";


// ==========================================================
// Payments
// ==========================================================

import PaymentPage
    from "../pages/Payments/PaymentPage";

import PaymentSuccess
    from "../pages/Payments/PaymentSuccess";

import PaymentHistory
    from "../pages/Payments/PaymentHistory";

import PaymentDetails
    from "../pages/Payments/PaymentDetails";

import PaymentReceipt
    from "../pages/Payments/PaymentReceipt";

import PaymentInvoice
    from "../pages/Payments/PaymentInvoice";


// ==========================================================
// Family
// ==========================================================

import FamilyMembers
    from "../pages/Family/FamilyMembers";


// ==========================================================
// Notifications
// ==========================================================

import Notifications
    from "../pages/Notifications/Notifications";


// ==========================================================
// Settings
// ==========================================================

import Settings
    from "../pages/Settings/Settings";


// ==========================================================
// App Routes
// ==========================================================

export default function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>


                {/* ==================================================
                    AUTHENTICATION
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


                <Route
                    path="/logout"
                    element={
                        <Logout />
                    }
                />


                {/* ==================================================
                    GENERAL DASHBOARD
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
                    ADMIN DASHBOARD
                ================================================== */}

                <Route
                    path="/admin/dashboard"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "admin",
                            ]}
                        >

                            <AdminDashboard />

                        </RoleRoute>

                    }
                />


                {/* ==================================================
                    ADMIN USER MANAGEMENT
                ================================================== */}

                <Route
                    path="/admin/users"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "admin",
                            ]}
                        >

                            <AdminUsers />

                        </RoleRoute>

                    }
                />


                {/* ==================================================
                    ADMIN DOCTOR APPROVAL
                ================================================== */}

                <Route
                    path="/admin/doctor-requests"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "admin",
                            ]}
                        >

                            <AdminDoctorRequests />

                        </RoleRoute>

                    }
                />

                <Route
                    path="/admin/doctors"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <AdminDoctors />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/admin/patients"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <AdminPatients />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/admin/departments"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <AdminDepartments />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/admin/appointments"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <AdminAppointments />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/admin/schedules"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <AdminSchedules />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/admin/diagnostics"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <AdminDiagnostics />
                        </RoleRoute>
                    }
                />


                {/* ==================================================
                    ADMIN PAYMENTS
                ================================================== */}

                <Route
                    path="/admin/payments"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "admin",
                            ]}
                        >

                            <AdminPayments />

                        </RoleRoute>

                    }
                />


                {/* ==================================================
                    ADMIN SUPPORT
                ================================================== */}

                <Route
                    path="/admin/support"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "admin",
                            ]}
                        >

                            <AdminSupport />

                        </RoleRoute>

                    }
                />


                {/* ==================================================
                    DOCTOR DASHBOARD
                ================================================== */}

                <Route
                    path="/doctor/dashboard"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "doctor",
                            ]}
                        >

                            <DoctorDashboard />

                        </RoleRoute>

                    }
                />


                {/* ==================================================
                    DOCTOR APPOINTMENTS
                ================================================== */}

                <Route
                    path="/doctor/appointments"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "doctor",
                            ]}
                        >

                            <DoctorAppointments />

                        </RoleRoute>

                    }
                />

                <Route
                    path="/doctor/appointments/:id"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "doctor",
                            ]}
                        >

                            <DoctorAppointmentDetails />

                        </RoleRoute>

                    }
                />


                <Route
                    path="/doctor/profile"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "doctor",
                            ]}
                        >

                            <DoctorProfile />

                        </RoleRoute>

                    }
                />


                <Route
                    path="/doctor/schedule"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "doctor",
                            ]}
                        >

                            <DoctorSchedule />

                        </RoleRoute>

                    }
                />

                <Route
                    path="/doctor/patients"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "doctor",
                            ]}
                        >

                            <DoctorPatients />

                        </RoleRoute>

                    }
                />

                <Route
                    path="/doctor/prescriptions"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "doctor",
                            ]}
                        >

                            <DoctorPrescriptions />

                        </RoleRoute>

                    }
                />

                <Route
                    path="/doctor/notifications"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "doctor",
                            ]}
                        >

                            <DoctorNotifications />

                        </RoleRoute>

                    }
                />

                <Route
                    path="/doctor/analytics"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "doctor",
                            ]}
                        >

                            <DoctorAnalytics />

                        </RoleRoute>

                    }
                />

                <Route
                    path="/doctor/settings"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "doctor",
                            ]}
                        >

                            <DoctorSettings />

                        </RoleRoute>

                    }
                />


                {/* ==================================================
                    PATIENT DASHBOARD
                ================================================== */}

                <Route
                    path="/patient/dashboard"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "patient",
                            ]}
                        >

                            <PatientDashboard />

                        </RoleRoute>

                    }
                />


                {/* ==================================================
                    APPOINTMENTS
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
                    DOCTORS
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
                    DIAGNOSTIC TESTS
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
                    DIAGNOSTIC TEST BOOKING
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
                    MY DIAGNOSTIC BOOKINGS
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
                    DIAGNOSTIC BOOKING DETAILS
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
                    DIAGNOSTIC PAYMENT
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
                    MEDICAL REPORTS
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
                    PAYMENTS
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
                    FAMILY MEMBERS
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
                    NOTIFICATIONS
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
                    SETTINGS
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
                    404 PAGE
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
                                The page you are looking for
                                does not exist.
                            </p>

                        </div>

                    }
                />

            </Routes>

        </BrowserRouter>

    );

}