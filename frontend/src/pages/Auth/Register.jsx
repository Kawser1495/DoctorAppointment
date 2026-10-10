import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "../../services/authService";

const INITIAL_FORM_DATA = {
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",

    gender: "",
    date_of_birth: "",
    blood_group: "",
    address: "",

};

export default function Register() {
    const navigate = useNavigate();

    // ==========================================================
    // Role State
    // ==========================================================

    const [role, setRole] = useState("patient");

    // ==========================================================
    // Form State
    // ==========================================================

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    const [confirmPassword, setConfirmPassword] = useState("");

    // ==========================================================
    // ==========================================================
    // UI State
    // ==========================================================

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    // ==========================================================
    // Input Change
    // ==========================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        setFieldErrors((previousErrors) => ({
            ...previousErrors,
            [name]: "",
        }));

        setError("");
        setSuccess("");
    };

    // ==========================================================
    // Confirm Password Change
    // ==========================================================

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);

        setFieldErrors((previousErrors) => ({
            ...previousErrors,
            confirm_password: "",
        }));

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
        setFieldErrors({});
    };

    // ==========================================================
    // Format Backend Errors
    // ==========================================================

    const formatErrorMessage = (message) => {
        if (Array.isArray(message)) {
            return message.join(", ");
        }

        if (typeof message === "object" && message !== null) {
            return Object.values(message)
                .flat()
                .join(", ");
        }

        return String(message);
    };

    const getFieldError = (fieldName) => {
        const message = fieldErrors[fieldName];

        if (!message) {
            return "";
        }

        return formatErrorMessage(message);
    };

    // ==========================================================
    // Submit
    // ==========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setFieldErrors({});

        // ------------------------------------------------------
        // Clean Values
        // ------------------------------------------------------

        const username = formData.username.trim();
        const firstName = formData.first_name.trim();
        const lastName = formData.last_name.trim();
        const email = formData.email.trim();
        const phone = formData.phone.trim();

        // ------------------------------------------------------
        // Username Validation
        // ------------------------------------------------------

        if (!username) {
            setError("Please choose a username.");
            return;
        }

        if (username.length < 3) {
            setError(
                "Username must contain at least 3 characters."
            );
            return;
        }

        if (username.length > 150) {
            setError(
                "Username cannot exceed 150 characters."
            );
            return;
        }

        if (!/^[A-Za-z0-9._-]+$/.test(username)) {
            setError(
                "Username can contain only letters, numbers, dot, underscore and hyphen."
            );
            return;
        }

        // ------------------------------------------------------
        // Basic Validation
        // ------------------------------------------------------

        if (!firstName) {
            setError("Please enter your first name.");
            return;
        }

        if (!lastName) {
            setError("Please enter your last name.");
            return;
        }

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        if (!phone) {
            setError("Please enter your phone number.");
            return;
        }

        if (!/^\d+$/.test(phone)) {
            setError("Phone number must contain only digits.");
            return;
        }

        if (phone.length < 10 || phone.length > 15) {
            setError(
                "Phone number must contain 10 to 15 digits."
            );
            return;
        }

        // ------------------------------------------------------
        // Password Validation
        // ------------------------------------------------------

        if (formData.password.length < 8) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (formData.password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // ------------------------------------------------------
        // Registration Payload
        // ------------------------------------------------------

        const payload = {
            username: username,

            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,

            password: formData.password,
            confirm_password: confirmPassword,

            role: role,

            gender: formData.gender,
            date_of_birth:
                formData.date_of_birth || null,
            blood_group: formData.blood_group,
            address: formData.address.trim(),
        };

        // ------------------------------------------------------
        // API Request
        // ------------------------------------------------------

        setLoading(true);

        try {
            await registerUser(payload);

            setSuccess(
                role === "doctor"
                    ? "Doctor application submitted successfully. Please wait for admin approval."
                    : "Patient account created successfully."
            );

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (registrationError) {
            console.error(
                "Registration error:",
                registrationError
            );

            const responseData =
                registrationError.response?.data;

            console.error(
                "Backend response:",
                responseData
            );

            if (
                responseData &&
                typeof responseData === "object"
            ) {
                setFieldErrors(responseData);

                const generalMessages = Object.entries(
                    responseData
                )
                    .filter(
                        ([field]) =>
                            ![
                                "username",
                                "first_name",
                                "last_name",
                                "email",
                                "phone",
                                "password",
                                "confirm_password",
                                "gender",
                                "date_of_birth",
                                "blood_group",
                                "address",
                                "department",
                                "specialization",
                                "qualification",
                                "experience",
                                "consultation_fee",
                                "biography",
                                "schedules",
                            ].includes(field)
                    )
                    .map(([, message]) =>
                        formatErrorMessage(message)
                    );

                if (generalMessages.length > 0) {
                    setError(
                        generalMessages.join("\n")
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
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-lg-7 col-md-9">
                    <div className="card shadow-lg border-0">
                        {/* Header */}

                        <div className="card-header bg-primary text-white text-center py-4">
                            <h2 className="mb-1">
                                Doctor Appointment System
                            </h2>

                            <p className="mb-0">
                                Create Your Account
                            </p>
                        </div>

                        {/* Body */}

                        <div className="card-body p-4">
                            {error && (
                                <div
                                    className="alert alert-danger"
                                    style={{
                                        whiteSpace: "pre-line",
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    {success}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                autoComplete="on"
                            >
                                {/* Account Type */}

                                <div className="mb-4">
                                    <label className="form-label fw-bold">
                                        Select Account Type
                                    </label>

                                    <div className="row g-3">
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

                                {/* Username */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        className={`form-control ${
                                            getFieldError("username")
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Choose a unique username"
                                        autoComplete="username"
                                        minLength={3}
                                        maxLength={150}
                                        pattern="[A-Za-z0-9._-]+"
                                        required
                                    />

                                    {getFieldError("username") ? (
                                        <div className="invalid-feedback">
                                            {getFieldError("username")}
                                        </div>
                                    ) : (
                                        <small className="text-muted">
                                            At least 3 characters. Use only
                                            letters, numbers, dot,
                                            underscore and hyphen.
                                        </small>
                                    )}
                                </div>

                                {/* First Name */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        className={`form-control ${
                                            getFieldError("first_name")
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        placeholder="Enter first name"
                                        autoComplete="given-name"
                                        required
                                    />

                                    {getFieldError("first_name") && (
                                        <div className="invalid-feedback">
                                            {getFieldError("first_name")}
                                        </div>
                                    )}
                                </div>

                                {/* Last Name */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        className={`form-control ${
                                            getFieldError("last_name")
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        placeholder="Enter last name"
                                        autoComplete="family-name"
                                        required
                                    />

                                    {getFieldError("last_name") && (
                                        <div className="invalid-feedback">
                                            {getFieldError("last_name")}
                                        </div>
                                    )}
                                </div>

                                {/* Email */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        className={`form-control ${
                                            getFieldError("email")
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email address"
                                        autoComplete="email"
                                        required
                                    />

                                    {getFieldError("email") && (
                                        <div className="invalid-feedback">
                                            {getFieldError("email")}
                                        </div>
                                    )}
                                </div>

                                {/* Phone */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Phone Number
                                    </label>

                                    <input
                                        type="tel"
                                        className={`form-control ${
                                            getFieldError("phone")
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="017XXXXXXXX"
                                        autoComplete="tel"
                                        required
                                    />

                                    {getFieldError("phone") && (
                                        <div className="invalid-feedback">
                                            {getFieldError("phone")}
                                        </div>
                                    )}
                                </div>

                                {/* Gender */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Gender
                                    </label>

                                    <select
                                        className="form-select"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Gender
                                        </option>
                                        <option value="Male">
                                            Male
                                        </option>
                                        <option value="Female">
                                            Female
                                        </option>
                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </div>

                                {/* Date of Birth */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Date of Birth
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        name="date_of_birth"
                                        value={
                                            formData.date_of_birth
                                        }
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Blood Group */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Blood Group
                                    </label>

                                    <select
                                        className="form-select"
                                        name="blood_group"
                                        value={formData.blood_group}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Blood Group
                                        </option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">
                                            AB+
                                        </option>
                                        <option value="AB-">
                                            AB-
                                        </option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>

                                {/* Address */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Address
                                    </label>

                                    <textarea
                                        className="form-control"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter your address"
                                        rows="3"
                                    />
                                </div>

                                {/* Password */}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        className={`form-control ${
                                            getFieldError("password")
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Minimum 8 characters"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />

                                    {getFieldError("password") && (
                                        <div className="invalid-feedback">
                                            {getFieldError("password")}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}

                                <div className="mb-4">
                                    <label className="form-label">
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        className={`form-control ${
                                            getFieldError(
                                                "confirm_password"
                                            )
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        name="confirm_password"
                                        value={confirmPassword}
                                        onChange={
                                            handleConfirmPasswordChange
                                        }
                                        placeholder="Re-enter password"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />

                                    {getFieldError(
                                        "confirm_password"
                                    ) && (
                                        <div className="invalid-feedback">
                                            {getFieldError(
                                                "confirm_password"
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}

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

                            {/* Login Link */}

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