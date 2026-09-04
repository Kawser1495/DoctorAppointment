import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "../../services/authService";


export default function Register() {

    const navigate = useNavigate();


    // ==========================================================
    // Role State
    // ==========================================================

    const [role, setRole] = useState("patient");


    // ==========================================================
    // Form State
    // ==========================================================

    const [formData, setFormData] = useState({

        username: "",
        email: "",
        phone: "",
        password: "",

        department: "",
        specialization: "",
        qualification: "",
        experience: "",
        consultation_fee: "",
        biography: "",

    });


    const [confirmPassword, setConfirmPassword] =
        useState("");


    // ==========================================================
    // Department State
    // ==========================================================

    const [departments, setDepartments] = useState([]);

    const [departmentLoading, setDepartmentLoading] =
        useState(false);


    // ==========================================================
    // UI State
    // ==========================================================

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ==========================================================
    // Load Departments
    // ==========================================================

    useEffect(() => {

        const loadDepartments = async () => {

            setDepartmentLoading(true);

            try {

                const response = await fetch(
                    "http://127.0.0.1:8000/api/doctors/departments/"
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        "Failed to load departments."
                    );
                }

                setDepartments(data);

            } catch (error) {

                console.error(
                    "Department loading error:",
                    error
                );

            } finally {

                setDepartmentLoading(false);

            }

        };

        loadDepartments();

    }, []);


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
    // Confirm Password Change
    // ==========================================================

    const handleConfirmPasswordChange = (event) => {

        setConfirmPassword(
            event.target.value
        );

        setError("");

        setSuccess("");

    };


    // ==========================================================
    // Role Change
    // ==========================================================

    const handleRoleChange = (selectedRole) => {

        setRole(selectedRole);

        setError("");

        setSuccess("");

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


        // ------------------------------------------------------
        // Doctor Required Fields
        // ------------------------------------------------------

        if (role === "doctor") {

            if (!formData.department) {

                setError(
                    "Please select a department."
                );

                return;

            }

            if (!formData.specialization.trim()) {

                setError(
                    "Please enter your specialization."
                );

                return;

            }

            if (!formData.qualification.trim()) {

                setError(
                    "Please enter your qualification."
                );

                return;

            }

            if (!formData.experience) {

                setError(
                    "Please enter your experience."
                );

                return;

            }

            if (!formData.consultation_fee) {

                setError(
                    "Please enter your consultation fee."
                );

                return;

            }

        }


        // ------------------------------------------------------
        // Registration Payload
        // ------------------------------------------------------

        const payload = {

            username: formData.username,

            email: formData.email,

            phone: formData.phone,

            password: formData.password,

            confirm_password: confirmPassword,

            role: role,

        };


        // ------------------------------------------------------
        // Doctor Payload
        // ------------------------------------------------------

        if (role === "doctor") {

            payload.department =
                formData.department;

            payload.specialization =
                formData.specialization;

            payload.qualification =
                formData.qualification;

            payload.experience =
                formData.experience;

            payload.consultation_fee =
                formData.consultation_fee;

            payload.biography =
                formData.biography;

        }


        setLoading(true);


        try {

            await registerUser(payload);


            // --------------------------------------------------
            // Doctor Success
            // --------------------------------------------------

            if (role === "doctor") {

                setSuccess(
                    "Doctor application submitted successfully. " +
                    "Please wait for admin approval."
                );

            }

            // --------------------------------------------------
            // Patient Success
            // --------------------------------------------------

            else {

                setSuccess(
                    "Patient account created successfully."
                );

            }


            // --------------------------------------------------
            // Redirect to Login
            // --------------------------------------------------

            setTimeout(() => {

                navigate("/login");

            }, 2000);


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

                                Create Your Account

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
                                    Role Selection
                                ================================================== */}

                                <div className="mb-4">

                                    <label className="form-label fw-bold">

                                        Select Account Type

                                    </label>


                                    <div className="row g-3">

                                        {/* ------------------------------------------
                                            Patient
                                        ------------------------------------------ */}

                                        <div className="col-md-6">

                                            <button
                                                type="button"
                                                className={
                                                    role === "patient"
                                                        ? "btn btn-primary w-100 p-3 h-100"
                                                        : "btn btn-outline-primary w-100 p-3 h-100"
                                                }
                                                onClick={() =>
                                                    handleRoleChange(
                                                        "patient"
                                                    )
                                                }
                                            >

                                                <h5 className="mb-2">

                                                    Patient

                                                </h5>

                                                <small>

                                                    Book appointments and
                                                    manage health records.

                                                </small>

                                            </button>

                                        </div>


                                        {/* ------------------------------------------
                                            Doctor
                                        ------------------------------------------ */}

                                        <div className="col-md-6">

                                            <button
                                                type="button"
                                                className={
                                                    role === "doctor"
                                                        ? "btn btn-primary w-100 p-3 h-100"
                                                        : "btn btn-outline-primary w-100 p-3 h-100"
                                                }
                                                onClick={() =>
                                                    handleRoleChange(
                                                        "doctor"
                                                    )
                                                }
                                            >

                                                <h5 className="mb-2">

                                                    Doctor

                                                </h5>

                                                <small>

                                                    Apply to join and manage
                                                    patient appointments.

                                                </small>

                                            </button>

                                        </div>

                                    </div>

                                </div>


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
                                    Doctor Fields
                                ================================================== */}

                                {role === "doctor" && (

                                    <div className="border rounded p-3 mb-4">

                                        <h5 className="mb-3">

                                            Doctor Information

                                        </h5>


                                        {/* ------------------------------------------
                                            Department
                                        ------------------------------------------ */}

                                        <div className="mb-3">

                                            <label className="form-label">

                                                Department

                                            </label>

                                            <select
                                                className="form-select"
                                                name="department"
                                                value={
                                                    formData.department
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                                disabled={
                                                    departmentLoading
                                                }
                                            >

                                                <option value="">

                                                    {departmentLoading
                                                        ? "Loading departments..."
                                                        : "Select Department"}

                                                </option>

                                                {departments.map(
                                                    (department) => (

                                                        <option
                                                            key={
                                                                department.id
                                                            }
                                                            value={
                                                                department.id
                                                            }
                                                        >

                                                            {
                                                                department.name
                                                            }

                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        {/* ------------------------------------------
                                            Specialization
                                        ------------------------------------------ */}

                                        <div className="mb-3">

                                            <label className="form-label">

                                                Specialization

                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                name="specialization"
                                                value={
                                                    formData.specialization
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Example: Cardiologist"
                                                required
                                            />

                                        </div>


                                        {/* ------------------------------------------
                                            Qualification
                                        ------------------------------------------ */}

                                        <div className="mb-3">

                                            <label className="form-label">

                                                Qualification

                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                name="qualification"
                                                value={
                                                    formData.qualification
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Example: MBBS, FCPS"
                                                required
                                            />

                                        </div>


                                        {/* ------------------------------------------
                                            Experience
                                        ------------------------------------------ */}

                                        <div className="mb-3">

                                            <label className="form-label">

                                                Experience

                                            </label>

                                            <input
                                                type="number"
                                                className="form-control"
                                                name="experience"
                                                value={
                                                    formData.experience
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Experience in years"
                                                min="0"
                                                required
                                            />

                                        </div>


                                        {/* ------------------------------------------
                                            Consultation Fee
                                        ------------------------------------------ */}

                                        <div className="mb-3">

                                            <label className="form-label">

                                                Consultation Fee

                                            </label>

                                            <input
                                                type="number"
                                                className="form-control"
                                                name="consultation_fee"
                                                value={
                                                    formData.consultation_fee
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter consultation fee"
                                                min="0"
                                                required
                                            />

                                        </div>


                                        {/* ------------------------------------------
                                            Biography
                                        ------------------------------------------ */}

                                        <div className="mb-3">

                                            <label className="form-label">

                                                Biography

                                            </label>

                                            <textarea
                                                className="form-control"
                                                name="biography"
                                                value={
                                                    formData.biography
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Write a short biography"
                                                rows="4"
                                            />

                                        </div>

                                    </div>

                                )}


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
                                        name="confirm_password"
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
                                        : role === "doctor"
                                            ? "Submit Doctor Application"
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