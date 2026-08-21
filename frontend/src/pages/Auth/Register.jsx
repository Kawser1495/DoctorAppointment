import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "../../services/authService";


export default function Register() {

    const navigate = useNavigate();


    // ==========================================================
    // Form State
    // ==========================================================

    const [formData, setFormData] = useState({

        username: "",
        email: "",
        phone: "",
        password: "",

    });


    const [confirmPassword, setConfirmPassword] = useState("");


    // ==========================================================
    // UI State
    // ==========================================================

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ==========================================================
    // Input Change
    // ==========================================================

    const handleChange = (event) => {

        setFormData((previousData) => ({

            ...previousData,

            [event.target.name]:
                event.target.value,

        }));

        setError("");

        setSuccess("");

    };


    // ==========================================================
    // Confirm Password
    // ==========================================================

    const handleConfirmPasswordChange = (event) => {

        setConfirmPassword(
            event.target.value
        );

        setError("");

    };


    // ==========================================================
    // Submit
    // ==========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setSuccess("");


        // ------------------------------------------------------
        // Password Match
        // ------------------------------------------------------

        if (
            formData.password !==
            confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;

        }


        // ------------------------------------------------------
        // Minimum Password Length
        // ------------------------------------------------------

        if (
            formData.password.length < 8
        ) {

            setError(
                "Password must contain at least 8 characters."
            );

            return;

        }


        setLoading(true);


        try {

            await registerUser(formData);


            setSuccess(
                "Registration successful. You can now login."
            );


            // --------------------------------------------------
            // Redirect to Login
            // --------------------------------------------------

            setTimeout(() => {

                navigate("/login");

            }, 1000);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            // --------------------------------------------------
            // Backend Validation Error
            // --------------------------------------------------

            if (error.response?.data) {

                const data =
                    error.response.data;


                if (typeof data === "object") {

                    const messages =
                        Object.entries(data)
                            .map(
                                ([field, message]) =>
                                    `${field}: ${
                                        Array.isArray(message)
                                            ? message.join(", ")
                                            : message
                                    }`
                            )
                            .join("\n");


                    setError(messages);

                } else {

                    setError(
                        String(data)
                    );

                }

            } else {

                setError(
                    "Cannot connect to the server. Please try again later."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-lg-6 col-md-8">

                    <div className="card shadow-lg border-0">

                        {/* ==================================================
                            Header
                        ================================================== */}

                        <div className="card-header bg-primary text-white text-center py-4">

                            <h2 className="mb-1">

                                Doctor Appointment System

                            </h2>

                            <p className="mb-0">

                                Create Your Patient Account

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
                                    style={{
                                        whiteSpace: "pre-line"
                                    }}
                                >

                                    {error}

                                </div>

                            )}


                            {/* ==================================================
                                Success
                            ================================================== */}

                            {success && (

                                <div className="alert alert-success">

                                    {success}

                                </div>

                            )}


                            <form
                                onSubmit={handleSubmit}
                                autoComplete="on"
                            >


                                {/* ==================================================
                                    Username
                                ================================================== */}

                                <div className="mb-3">

                                    <label className="form-label">

                                        Username

                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        value={
                                            formData.username
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter username"
                                        autoComplete="username"
                                        required
                                    />

                                </div>


                                {/* ==================================================
                                    Email
                                ================================================== */}

                                <div className="mb-3">

                                    <label className="form-label">

                                        Email Address

                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter email address"
                                        autoComplete="email"
                                        required
                                    />

                                </div>


                                {/* ==================================================
                                    Phone
                                ================================================== */}

                                <div className="mb-3">

                                    <label className="form-label">

                                        Phone Number

                                    </label>

                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="017XXXXXXXX"
                                        autoComplete="tel"
                                        required
                                    />

                                </div>


                                {/* ==================================================
                                    Password
                                ================================================== */}

                                <div className="mb-3">

                                    <label className="form-label">

                                        Password

                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={
                                            formData.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Minimum 8 characters"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />

                                </div>


                                {/* ==================================================
                                    Confirm Password
                                ================================================== */}

                                <div className="mb-4">

                                    <label className="form-label">

                                        Confirm Password

                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={
                                            confirmPassword
                                        }
                                        onChange={
                                            handleConfirmPasswordChange
                                        }
                                        placeholder="Re-enter password"
                                        autoComplete="new-password"
                                        required
                                    />

                                </div>


                                {/* ==================================================
                                    Submit
                                ================================================== */}

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Creating Account..."
                                        : "Create Patient Account"}

                                </button>


                            </form>


                            <hr className="my-4" />


                            {/* ==================================================
                                Login Link
                            ================================================== */}

                            <div className="text-center">

                                <p className="mb-2">

                                    Already have an account?

                                </p>

                                <Link
                                    to="/login"
                                    className="btn btn-outline-primary"
                                >

                                    Login Here

                                </Link>

                            </div>


                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}