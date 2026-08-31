import {
    useState,
    useEffect,
} from "react";

import {
    useNavigate,
    Link,
} from "react-router-dom";

import {
    loginUser,
} from "../../services/authService";

import useAuth from "../../context/useAuth";


export default function Login() {

    const navigate = useNavigate();

    const {
        login,
        isAuthenticated,
        user,
        loading: authLoading,
    } = useAuth();


    // ==========================================================
    // Form State
    // ==========================================================

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });


    // ==========================================================
    // UI State
    // ==========================================================

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [rememberMe, setRememberMe] = useState(false);


    // ==========================================================
    // Load Remember Me
    // ==========================================================

    useEffect(() => {

        const savedRemember =
            localStorage.getItem("rememberMe");

        if (savedRemember === "true") {

            setRememberMe(true);

        }

    }, []);


    // ==========================================================
    // If Already Authenticated
    // ==========================================================

    useEffect(() => {

        if (
            authLoading ||
            loading ||
            !isAuthenticated ||
            !user
        ) {
            return;
        }


        const role =
            String(user.role || "")
                .trim()
                .toLowerCase();


        const dashboardRoutes = {

            doctor:
                "/doctor/dashboard",

            patient:
                "/patient/dashboard",

            admin:
                "/admin/dashboard",

            receptionist:
                "/dashboard",

        };


        const dashboardPath =
            dashboardRoutes[role];


        if (!dashboardPath) {

            console.error(
                "Invalid stored user role:",
                user.role
            );

            return;

        }


        console.log(
            "AUTHENTICATED USER REDIRECT:",
            {
                role,
                dashboardPath,
            }
        );


        navigate(
            dashboardPath,
            {
                replace: true,
            }
        );

    }, [
        authLoading,
        loading,
        isAuthenticated,
        user,
        navigate,
    ]);


    // ==========================================================
    // Handle Input Change
    // ==========================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            (previousData) => ({

                ...previousData,

                [name]: value,

            })
        );


        setError("");

    };


    // ==========================================================
    // Role-Based Dashboard
    // ==========================================================

    const getDashboardPath = (role) => {

        const normalizedRole =
            String(role || "")
                .trim()
                .toLowerCase();


        const dashboardRoutes = {

            doctor:
                "/doctor/dashboard",

            patient:
                "/patient/dashboard",

            admin:
                "/admin/dashboard",

            receptionist:
                "/dashboard",

        };


        return dashboardRoutes[
            normalizedRole
        ] || null;

    };


    // ==========================================================
    // Handle Login
    // ==========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        if (loading) {
            return;
        }


        setLoading(true);

        setError("");


        try {

            // ==================================================
            // Login API
            // ==================================================

            const response =
                await loginUser(formData);


            console.log(
                "LOGIN RESPONSE:",
                response.data
            );


            // ==================================================
            // Extract Authentication Data
            // ==================================================

            const {
                access,
                refresh,
                user,
            } = response.data;


            // ==================================================
            // Validate Access Token
            // ==================================================

            if (!access) {

                throw new Error(
                    "Access token is missing from server response."
                );

            }


            // ==================================================
            // Validate Refresh Token
            // ==================================================

            if (!refresh) {

                throw new Error(
                    "Refresh token is missing from server response."
                );

            }


            // ==================================================
            // Validate User
            // ==================================================

            if (!user) {

                throw new Error(
                    "User information is missing from server response."
                );

            }


            // ==================================================
            // Validate Role
            // ==================================================

            if (!user.role) {

                console.error(
                    "USER OBJECT:",
                    user
                );


                throw new Error(
                    "User role is missing from server response."
                );

            }


            // ==================================================
            // Normalize Role
            // ==================================================

            const role =
                String(user.role)
                    .trim()
                    .toLowerCase();


            console.log(
                "LOGIN USER:",
                user
            );


            console.log(
                "NORMALIZED USER ROLE:",
                role
            );


            // ==================================================
            // Get Dashboard Path
            // ==================================================

            const dashboardPath =
                getDashboardPath(role);


            if (!dashboardPath) {

                console.error(
                    "Unknown user role:",
                    role
                );


                throw new Error(
                    `Unknown user role: ${role}`
                );

            }


            console.log(
                "DASHBOARD PATH:",
                dashboardPath
            );


            // ==================================================
            // Remember Me
            // ==================================================

            if (rememberMe) {

                localStorage.setItem(
                    "rememberMe",
                    "true"
                );

            } else {

                localStorage.removeItem(
                    "rememberMe"
                );

            }


            // ==================================================
            // Save Authentication
            // ==================================================

            const loginSuccess =
                login(

                    access,

                    refresh,

                    {
                        ...user,

                        role: role,
                    },

                    rememberMe

                );


            if (!loginSuccess) {

                throw new Error(
                    "Unable to save login information."
                );

            }


            // ==================================================
            // Debug Authentication
            // ==================================================

            console.log(
                "LOGIN SUCCESS",
                {
                    userId: user.id,
                    username: user.username,
                    role: role,
                    dashboardPath: dashboardPath,
                }
            );


            // ==================================================
            // Role-Based Redirect
            // ==================================================

            navigate(
                dashboardPath,
                {
                    replace: true,
                }
            );


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            // ==================================================
            // Backend Error
            // ==================================================

            if (error.response) {

                const data =
                    error.response.data;


                console.error(
                    "BACKEND LOGIN ERROR:",
                    data
                );


                if (data?.detail) {

                    setError(
                        data.detail
                    );

                }

                else if (
                    data?.non_field_errors
                ) {

                    setError(

                        Array.isArray(
                            data.non_field_errors
                        )

                            ? data.non_field_errors.join(", ")

                            : data.non_field_errors

                    );

                }

                else {

                    setError(
                        "Invalid username or password."
                    );

                }

            }

            // ==================================================
            // JavaScript / Custom Error
            // ==================================================

            else if (error.message) {

                setError(
                    error.message
                );

            }

            // ==================================================
            // Network Error
            // ==================================================

            else {

                setError(
                    "Cannot connect to the server. Please try again later."
                );

            }

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================================
    // Render
    // ==========================================================

    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-lg-5 col-md-7">

                    <div className="card shadow-lg border-0">


                        {/* ==================================================
                            Header
                        ================================================== */}

                        <div className="card-header bg-primary text-white text-center py-4">

                            <h3 className="mb-1">
                                Doctor Appointment System
                            </h3>

                            <p className="mb-0">
                                Login to Continue
                            </p>

                        </div>


                        {/* ==================================================
                            Body
                        ================================================== */}

                        <div className="card-body p-4">


                            {/* ==================================================
                                Error
                            ================================================== */}

                            {error && (

                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >

                                    {error}

                                </div>

                            )}


                            {/* ==================================================
                                Login Form
                            ================================================== */}

                            <form
                                onSubmit={handleSubmit}
                                autoComplete="on"
                            >


                                {/* ==================================================
                                    Username
                                ================================================== */}

                                <div className="mb-3">

                                    <label
                                        htmlFor="username"
                                        className="form-label"
                                    >
                                        Username
                                    </label>


                                    <input
                                        id="username"
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        value={
                                            formData.username
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter Username"
                                        autoComplete="username"
                                        required
                                    />

                                </div>


                                {/* ==================================================
                                    Password
                                ================================================== */}

                                <div className="mb-3">

                                    <label
                                        htmlFor="password"
                                        className="form-label"
                                    >
                                        Password
                                    </label>


                                    <div className="input-group">

                                        <input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            className="form-control"
                                            name="password"
                                            value={
                                                formData.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter Password"
                                            autoComplete="current-password"
                                            required
                                        />


                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() =>
                                                setShowPassword(
                                                    (previous) =>
                                                        !previous
                                                )
                                            }
                                        >

                                            {
                                                showPassword
                                                    ? "Hide"
                                                    : "Show"
                                            }

                                        </button>

                                    </div>

                                </div>


                                {/* ==================================================
                                    Remember Me
                                ================================================== */}

                                <div className="d-flex justify-content-between align-items-center mb-4">

                                    <div className="form-check">

                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="remember"
                                            checked={
                                                rememberMe
                                            }
                                            onChange={
                                                (event) =>
                                                    setRememberMe(
                                                        event.target.checked
                                                    )
                                            }
                                        />


                                        <label
                                            htmlFor="remember"
                                            className="form-check-label"
                                        >
                                            Remember Me
                                        </label>

                                    </div>


                                    <Link to="#">
                                        Forgot Password?
                                    </Link>

                                </div>


                                {/* ==================================================
                                    Login Button
                                ================================================== */}

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={
                                        loading ||
                                        authLoading
                                    }
                                >

                                    {
                                        loading
                                            ? "Logging in..."
                                            : "Login"
                                    }

                                </button>

                            </form>


                            <hr className="my-4" />


                            {/* ==================================================
                                Registration
                            ================================================== */}

                            <div className="text-center">

                                <p className="mb-2">
                                    Don't have an account?
                                </p>


                                <Link
                                    to="/register"
                                    className="btn btn-success"
                                >
                                    Create Patient Account
                                </Link>

                            </div>


                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}