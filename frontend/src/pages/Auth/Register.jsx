import { useEffect, useState } from "react";
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

    department: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultation_fee: "",
    biography: "",
};

const INITIAL_SCHEDULE = {
    day: "Saturday",
    start_time: "09:00",
    end_time: "17:00",
    slot_duration_minutes: 20,
    max_patient_per_slot: 1,
};

const WEEK_DAYS = [
    { value: "Sunday", label: "Sunday" },
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
];

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
    // Schedule State
    // ==========================================================

    const [schedules, setSchedules] = useState([
        { ...INITIAL_SCHEDULE },
    ]);

    // ==========================================================
    // Department State
    // ==========================================================

    const [departments, setDepartments] = useState([]);
    const [departmentLoading, setDepartmentLoading] = useState(false);

    // ==========================================================
    // UI State
    // ==========================================================

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    // ==========================================================
    // Load Departments
    // ==========================================================

    useEffect(() => {
        let isMounted = true;

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

                const departmentList = Array.isArray(data)
                    ? data
                    : data.results || [];

                if (isMounted) {
                    setDepartments(departmentList);
                }
            } catch (departmentError) {
                console.error(
                    "Department loading error:",
                    departmentError
                );

                if (isMounted) {
                    setError(
                        "Unable to load departments. Please try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setDepartmentLoading(false);
                }
            }
        };

        loadDepartments();

        return () => {
            isMounted = false;
        };
    }, []);

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
    // Schedule Change
    // ==========================================================

    const handleScheduleChange = (index, event) => {
        const { name, value } = event.target;

        setSchedules((previousSchedules) =>
            previousSchedules.map((schedule, scheduleIndex) =>
                scheduleIndex === index
                    ? {
                          ...schedule,
                          [name]: value,
                      }
                    : schedule
            )
        );

        setError("");
        setSuccess("");
    };

    // ==========================================================
    // Add Schedule
    // ==========================================================

    const handleAddSchedule = () => {
        setSchedules((previousSchedules) => [
            ...previousSchedules,
            {
                ...INITIAL_SCHEDULE,
                day: "Sunday",
            },
        ]);
    };

    // ==========================================================
    // Remove Schedule
    // ==========================================================

    const handleRemoveSchedule = (index) => {
        if (schedules.length === 1) {
            setError(
                "At least one weekly schedule is required."
            );
            return;
        }

        setSchedules((previousSchedules) =>
            previousSchedules.filter(
                (_, scheduleIndex) =>
                    scheduleIndex !== index
            )
        );
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
        // Doctor Validation
        // ------------------------------------------------------

        if (role === "doctor") {
            if (!formData.department) {
                setError("Please select a department.");
                return;
            }

            if (!formData.specialization.trim()) {
                setError("Please enter your specialization.");
                return;
            }

            if (!formData.qualification.trim()) {
                setError("Please enter your qualification.");
                return;
            }

            if (formData.experience === "") {
                setError("Please enter your experience.");
                return;
            }

            if (Number(formData.experience) < 0) {
                setError(
                    "Experience cannot be negative."
                );
                return;
            }

            if (formData.consultation_fee === "") {
                setError(
                    "Please enter your consultation fee."
                );
                return;
            }

            if (Number(formData.consultation_fee) < 0) {
                setError(
                    "Consultation fee cannot be negative."
                );
                return;
            }

            if (schedules.length === 0) {
                setError(
                    "At least one weekly schedule is required."
                );
                return;
            }

            for (let index = 0; index < schedules.length; index++) {
                const schedule = schedules[index];

                if (
                    !schedule.day ||
                    !schedule.start_time ||
                    !schedule.end_time
                ) {
                    setError(
                        `Please complete schedule ${index + 1}.`
                    );
                    return;
                }

                if (
                    schedule.start_time >=
                    schedule.end_time
                ) {
                    setError(
                        `Schedule ${index + 1}: End time must be later than start time.`
                    );
                    return;
                }

                if (
                    Number(schedule.slot_duration_minutes) <= 0
                ) {
                    setError(
                        `Schedule ${index + 1}: Slot duration must be greater than zero.`
                    );
                    return;
                }

                if (
                    Number(schedule.max_patient_per_slot) <= 0
                ) {
                    setError(
                        `Schedule ${index + 1}: Maximum patient per slot must be greater than zero.`
                    );
                    return;
                }
            }
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
        // Doctor Payload
        // ------------------------------------------------------

        if (role === "doctor") {
            payload.department = Number(
                formData.department
            );

            payload.specialization =
                formData.specialization.trim();

            payload.qualification =
                formData.qualification.trim();

            payload.experience = Number(
                formData.experience
            );

            payload.consultation_fee =
                formData.consultation_fee;

            payload.biography =
                formData.biography.trim();

            payload.schedules = schedules.map(
                (schedule) => ({
                    day: schedule.day,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    slot_duration_minutes: Number(
                        schedule.slot_duration_minutes
                    ),
                    max_patient_per_slot: Number(
                        schedule.max_patient_per_slot
                    ),
                })
            );
        }

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

                                {/* Doctor Information */}

                                {role === "doctor" && (
                                    <div className="border rounded p-3 mb-4">
                                        <h5 className="mb-3">
                                            Doctor Information
                                        </h5>

                                        {/* Department */}

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Department
                                            </label>

                                            <select
                                                className={`form-select ${
                                                    getFieldError(
                                                        "department"
                                                    )
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                name="department"
                                                value={
                                                    formData.department
                                                }
                                                onChange={handleChange}
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

                                            {getFieldError(
                                                "department"
                                            ) && (
                                                <div className="invalid-feedback">
                                                    {getFieldError(
                                                        "department"
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Specialization */}

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
                                                onChange={handleChange}
                                                placeholder="Example: Cardiology"
                                                required
                                            />
                                        </div>

                                        {/* Qualification */}

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
                                                onChange={handleChange}
                                                placeholder="Example: MBBS, FCPS"
                                                required
                                            />
                                        </div>

                                        {/* Experience */}

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Experience in Years
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                placeholder="Experience in years"
                                                min="0"
                                                required
                                            />
                                        </div>

                                        {/* Consultation Fee */}

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
                                                onChange={handleChange}
                                                placeholder="Enter consultation fee"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        {/* Biography */}

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Biography
                                            </label>

                                            <textarea
                                                className="form-control"
                                                name="biography"
                                                value={formData.biography}
                                                onChange={handleChange}
                                                placeholder="Write a short biography"
                                                rows="4"
                                            />
                                        </div>

                                        {/* Weekly Schedule */}

                                        <div className="border-top pt-3 mt-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="mb-0">
                                                    Weekly Schedule
                                                </h5>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={
                                                        handleAddSchedule
                                                    }
                                                >
                                                    + Add Schedule
                                                </button>
                                            </div>

                                            {schedules.map(
                                                (
                                                    schedule,
                                                    index
                                                ) => (
                                                    <div
                                                        className="border rounded p-3 mb-3"
                                                        key={index}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <strong>
                                                                Schedule{" "}
                                                                {index + 1}
                                                            </strong>

                                                            {schedules.length >
                                                                1 && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() =>
                                                                        handleRemoveSchedule(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="row g-3">
                                                            {/* Day */}

                                                            <div className="col-md-6">
                                                                <label className="form-label">
                                                                    Day
                                                                </label>

                                                                <select
                                                                    className="form-select"
                                                                    name="day"
                                                                    value={
                                                                        schedule.day
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handleScheduleChange(
                                                                            index,
                                                                            event
                                                                        )
                                                                    }
                                                                    required
                                                                >
                                                                    {WEEK_DAYS.map(
                                                                        (
                                                                            day
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    day.value
                                                                                }
                                                                                value={
                                                                                    day.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    day.label
                                                                                }
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </select>
                                                            </div>

                                                            {/* Start Time */}

                                                            <div className="col-md-6">
                                                                <label className="form-label">
                                                                    Start Time
                                                                </label>

                                                                <input
                                                                    type="time"
                                                                    className="form-control"
                                                                    name="start_time"
                                                                    value={
                                                                        schedule.start_time
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handleScheduleChange(
                                                                            index,
                                                                            event
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                            </div>

                                                            {/* End Time */}

                                                            <div className="col-md-6">
                                                                <label className="form-label">
                                                                    End Time
                                                                </label>

                                                                <input
                                                                    type="time"
                                                                    className="form-control"
                                                                    name="end_time"
                                                                    value={
                                                                        schedule.end_time
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handleScheduleChange(
                                                                            index,
                                                                            event
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                            </div>

                                                            {/* Slot Duration */}

                                                            <div className="col-md-6">
                                                                <label className="form-label">
                                                                    Slot Duration
                                                                    (minutes)
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    name="slot_duration_minutes"
                                                                    value={
                                                                        schedule.slot_duration_minutes
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handleScheduleChange(
                                                                            index,
                                                                            event
                                                                        )
                                                                    }
                                                                    min="1"
                                                                    required
                                                                />
                                                            </div>

                                                            {/* Maximum Patients */}

                                                            <div className="col-md-6">
                                                                <label className="form-label">
                                                                    Maximum Patients
                                                                    Per Slot
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    name="max_patient_per_slot"
                                                                    value={
                                                                        schedule.max_patient_per_slot
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handleScheduleChange(
                                                                            index,
                                                                            event
                                                                        )
                                                                    }
                                                                    min="1"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

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