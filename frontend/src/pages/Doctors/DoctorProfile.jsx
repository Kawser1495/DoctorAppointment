import {
    useEffect,
    useState,
} from "react";

import {
    getDoctorProfile,
    updateDoctorProfile,
} from "../../services/doctorService";

import "./DoctorProfile.css";


export default function DoctorProfile() {

    // ======================================================
    // State
    // ======================================================

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [editing, setEditing] = useState(false);

    const [saving, setSaving] = useState(false);


    // ======================================================
    // Form State
    // ======================================================

    const [formData, setFormData] = useState({

        first_name: "",
        last_name: "",
        email: "",
        phone: "",

        department: "",

        specialization: "",
        qualification: "",
        experience: "",
        consultation_fee: "",

        biography: "",

        is_available: true,

        profile_image: null,

    });


    // ======================================================
    // Load Profile
    // ======================================================

    const loadProfile = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await getDoctorProfile();


            const data =
                response.data;


            console.log(
                "Doctor Profile:",
                data
            );


            setProfile(data);


            setFormData({

                first_name:
                    data.first_name || "",

                last_name:
                    data.last_name || "",

                email:
                    data.email || "",

                phone:
                    data.phone || "",

                department:
                    data.department || "",

                specialization:
                    data.specialization || "",

                qualification:
                    data.qualification || "",

                experience:
                    data.experience ?? "",

                consultation_fee:
                    data.consultation_fee ?? "",

                biography:
                    data.biography || "",

                is_available:
                    data.is_available ?? true,

                profile_image:
                    null,

            });


        } catch (error) {

            console.error(
                "Load doctor profile error:",
                error
            );


            if (
                error.response?.status === 401
            ) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (
                error.response?.status === 403
            ) {

                setError(
                    "You are not authorized as a doctor."
                );

            } else {

                setError(
                    error.response?.data?.detail ||
                    "Failed to load doctor profile."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // Load Profile On Mount
    // ======================================================

    useEffect(() => {

        loadProfile();

    }, []);


    // ======================================================
    // Handle Input Change
    // ======================================================

    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;


        setFormData(
            (previousData) => ({

                ...previousData,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value,

            })
        );

    };


    // ======================================================
    // Handle Image
    // ======================================================

    const handleImageChange = (event) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        setFormData(
            (previousData) => ({

                ...previousData,

                profile_image: file,

            })
        );

    };


    // ======================================================
    // Submit
    // ======================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        try {

            setSaving(true);

            setError("");

            setSuccess("");


            const data =
                new FormData();


            data.append(
                "first_name",
                formData.first_name
            );


            data.append(
                "last_name",
                formData.last_name
            );


            data.append(
                "email",
                formData.email
            );


            data.append(
                "phone",
                formData.phone
            );


            data.append(
                "department",
                formData.department
            );


            data.append(
                "specialization",
                formData.specialization
            );


            data.append(
                "qualification",
                formData.qualification
            );


            data.append(
                "experience",
                formData.experience
            );


            data.append(
                "consultation_fee",
                formData.consultation_fee
            );


            data.append(
                "biography",
                formData.biography
            );


            data.append(
                "is_available",
                formData.is_available
            );


            if (
                formData.profile_image
            ) {

                data.append(
                    "profile_image",
                    formData.profile_image
                );

            }


            const response =
                await updateDoctorProfile(
                    data
                );


            setProfile(
                response.data
            );


            setSuccess(
                "Doctor profile updated successfully."
            );


            setEditing(false);


            await loadProfile();


        } catch (error) {

            console.error(
                "Update doctor profile error:",
                error
            );


            console.log(
                "API Error:",
                error.response?.data
            );


            setError(
                error.response?.data?.detail ||
                "Failed to update doctor profile."
            );

        } finally {

            setSaving(false);

        }

    };


    // ======================================================
    // Cancel Editing
    // ======================================================

    const handleCancel = () => {

        setEditing(false);

        setError("");

        setSuccess("");

        setFormData({

            first_name:
                profile?.first_name || "",

            last_name:
                profile?.last_name || "",

            email:
                profile?.email || "",

            phone:
                profile?.phone || "",

            department:
                profile?.department || "",

            specialization:
                profile?.specialization || "",

            qualification:
                profile?.qualification || "",

            experience:
                profile?.experience ?? "",

            consultation_fee:
                profile?.consultation_fee ?? "",

            biography:
                profile?.biography || "",

            is_available:
                profile?.is_available ?? true,

            profile_image:
                null,

        });

    };


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="doctor-profile-loading">

                <div className="doctor-profile-loading-box">

                    Loading doctor profile...

                </div>

            </div>

        );

    }


    // ======================================================
    // Doctor Name
    // ======================================================

    const doctorName =
        profile?.doctor_name ||
        `${formData.first_name} ${formData.last_name}`.trim() ||
        "Doctor";


    // ======================================================
    // Initial
    // ======================================================

    const doctorInitial =
        doctorName.charAt(0).toUpperCase();


    // ======================================================
    // Render
    // ======================================================

    return (

        <div className="doctor-profile-page">

            <div className="doctor-profile-container">


                {/* ==================================================
                    Page Header
                ================================================== */}

                <div className="doctor-profile-page-header">

                    <div>

                        <h1>
                            Doctor Profile
                        </h1>

                        <p>
                            Manage your personal and professional information.
                        </p>

                    </div>


                    {!editing && (

                        <div className="doctor-profile-actions">

                            <button
                                type="button"
                                className="doctor-btn doctor-btn-primary"
                                onClick={() => {

                                    setEditing(true);

                                    setError("");

                                    setSuccess("");

                                }}
                            >
                                Edit Profile
                            </button>

                        </div>

                    )}

                </div>


                {/* ==================================================
                    Error
                ================================================== */}

                {error && (

                    <div className="doctor-profile-alert doctor-profile-alert-error">

                        {error}

                    </div>

                )}


                {/* ==================================================
                    Success
                ================================================== */}

                {success && (

                    <div className="doctor-profile-alert doctor-profile-alert-success">

                        {success}

                    </div>

                )}


                {/* ==================================================
                    Profile Hero
                ================================================== */}

                <div className="doctor-profile-hero">

                    <div className="doctor-profile-hero-left">


                        {/* Profile Image */}

                        <div className="doctor-profile-image-wrapper">

                            {profile?.profile_image ? (

                                <img
                                    src={profile.profile_image}
                                    alt="Doctor Profile"
                                    className="doctor-profile-image"
                                />

                            ) : (

                                <div className="doctor-profile-image-placeholder">

                                    {doctorInitial}

                                </div>

                            )}


                            {editing && (

                                <div className="doctor-image-upload">

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageChange
                                        }
                                    />

                                </div>

                            )}

                        </div>


                        {/* Doctor Information */}

                        <div className="doctor-profile-hero-info">

                            <h2>
                                {doctorName}
                            </h2>


                            <p className="doctor-profile-specialization">

                                {profile?.specialization ||
                                    "Medical Professional"}

                            </p>


                            <div className="doctor-profile-meta">

                                <span className="doctor-profile-meta-item">

                                    {profile?.qualification ||
                                        "Qualification not available"}

                                </span>


                                <span className="doctor-profile-meta-item">

                                    {profile?.department_name ||
                                        "Department not available"}

                                </span>

                            </div>

                        </div>

                    </div>


                    {/* Availability */}

                    <div>

                        {profile?.is_available ? (

                            <span className="doctor-availability-badge available">

                                <span className="doctor-status-dot"></span>

                                Available for appointments

                            </span>

                        ) : (

                            <span className="doctor-availability-badge unavailable">

                                <span className="doctor-status-dot"></span>

                                Currently unavailable

                            </span>

                        )}

                    </div>

                </div>


                {/* ==================================================
                    Content
                ================================================== */}

                <form onSubmit={handleSubmit}>


                    <div className="doctor-profile-grid">


                        {/* ==================================================
                            Personal Information
                        ================================================== */}

                        <div className="doctor-profile-card">

                            <div className="doctor-profile-card-header">

                                <div className="doctor-profile-card-icon">
                                    👤
                                </div>

                                <div>

                                    <h3>
                                        Personal Information
                                    </h3>

                                    <p>
                                        Basic contact information
                                    </p>

                                </div>

                            </div>


                            {editing ? (

                                <div className="doctor-form-grid">


                                    <div className="doctor-form-group">

                                        <label>
                                            First Name
                                        </label>

                                        <input
                                            type="text"
                                            name="first_name"
                                            value={
                                                formData.first_name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>


                                    <div className="doctor-form-group">

                                        <label>
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            name="last_name"
                                            value={
                                                formData.last_name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>


                                    <div className="doctor-form-group">

                                        <label>
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>


                                    <div className="doctor-form-group">

                                        <label>
                                            Phone
                                        </label>

                                        <input
                                            type="text"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                </div>

                            ) : (

                                <div className="doctor-info-grid">


                                    <div className="doctor-info-item">

                                        <span className="doctor-info-label">
                                            Full Name
                                        </span>

                                        <span className="doctor-info-value">

                                            {doctorName}

                                        </span>

                                    </div>


                                    <div className="doctor-info-item">

                                        <span className="doctor-info-label">
                                            Email
                                        </span>

                                        <span className="doctor-info-value">

                                            {profile?.email ||
                                                "Not available"}

                                        </span>

                                    </div>


                                    <div className="doctor-info-item">

                                        <span className="doctor-info-label">
                                            Phone
                                        </span>

                                        <span className="doctor-info-value">

                                            {profile?.phone ||
                                                "Not available"}

                                        </span>

                                    </div>


                                    <div className="doctor-info-item">

                                        <span className="doctor-info-label">
                                            Username
                                        </span>

                                        <span className="doctor-info-value">

                                            {profile?.username ||
                                                "Not available"}

                                        </span>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* ==================================================
                            Professional Information
                        ================================================== */}

                        <div className="doctor-profile-card">

                            <div className="doctor-profile-card-header">

                                <div className="doctor-profile-card-icon">
                                    🎓
                                </div>

                                <div>

                                    <h3>
                                        Professional Information
                                    </h3>

                                    <p>
                                        Medical qualifications and expertise
                                    </p>

                                </div>

                            </div>


                            {editing ? (

                                <div className="doctor-form-grid">


                                    <div className="doctor-form-group">

                                        <label>
                                            Department ID
                                        </label>

                                        <input
                                            type="number"
                                            name="department"
                                            value={
                                                formData.department
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>


                                    <div className="doctor-form-group">

                                        <label>
                                            Specialization
                                        </label>

                                        <input
                                            type="text"
                                            name="specialization"
                                            value={
                                                formData.specialization
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>


                                    <div className="doctor-form-group">

                                        <label>
                                            Qualification
                                        </label>

                                        <input
                                            type="text"
                                            name="qualification"
                                            value={
                                                formData.qualification
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>


                                    <div className="doctor-form-group">

                                        <label>
                                            Experience (Years)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            name="experience"
                                            value={
                                                formData.experience
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>


                                    <div className="doctor-form-group">

                                        <label>
                                            Consultation Fee
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="consultation_fee"
                                            value={
                                                formData.consultation_fee
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>


                                    <div className="doctor-form-group">

                                        <label>
                                            Availability
                                        </label>

                                        <div className="doctor-availability-control">

                                            <input
                                                type="checkbox"
                                                name="is_available"
                                                checked={
                                                    formData.is_available
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <label>
                                                Available for appointments
                                            </label>

                                        </div>

                                    </div>

                                </div>

                            ) : (

                                <div className="doctor-info-grid">


                                    <div className="doctor-info-item">

                                        <span className="doctor-info-label">
                                            Department
                                        </span>

                                        <span className="doctor-info-value">

                                            {profile?.department_name ||
                                                "Not available"}

                                        </span>

                                    </div>


                                    <div className="doctor-info-item">

                                        <span className="doctor-info-label">
                                            Specialization
                                        </span>

                                        <span className="doctor-info-value">

                                            {profile?.specialization ||
                                                "Not available"}

                                        </span>

                                    </div>


                                    <div className="doctor-info-item">

                                        <span className="doctor-info-label">
                                            Qualification
                                        </span>

                                        <span className="doctor-info-value">

                                            {profile?.qualification ||
                                                "Not available"}

                                        </span>

                                    </div>


                                    <div className="doctor-info-item">

                                        <span className="doctor-info-label">
                                            Experience
                                        </span>

                                        <span className="doctor-info-value">

                                            {profile?.experience != null
                                                ? `${profile.experience} years`
                                                : "Not available"}

                                        </span>

                                    </div>


                                    <div className="doctor-info-item">

                                        <span className="doctor-info-label">
                                            Consultation Fee
                                        </span>

                                        <span className="doctor-fee">

                                            ৳ {profile?.consultation_fee || "0.00"}

                                        </span>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* ==================================================
                            Biography
                        ================================================== */}

                        <div className="doctor-profile-card doctor-profile-card-full">

                            <div className="doctor-profile-card-header">

                                <div className="doctor-profile-card-icon">
                                    📝
                                </div>

                                <div>

                                    <h3>
                                        Professional Biography
                                    </h3>

                                    <p>
                                        About the doctor's professional background
                                    </p>

                                </div>

                            </div>


                            {editing ? (

                                <div className="doctor-form-group">

                                    <label>
                                        Biography
                                    </label>

                                    <textarea
                                        name="biography"
                                        rows="6"
                                        value={
                                            formData.biography
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Write a short professional biography..."
                                    />

                                </div>

                            ) : (

                                <div
                                    className={
                                        profile?.biography
                                            ? "doctor-biography"
                                            : "doctor-biography empty"
                                    }
                                >

                                    {profile?.biography ||
                                        "No professional biography has been added yet."}

                                </div>

                            )}

                        </div>


                    </div>


                    {/* ==================================================
                        Save / Cancel
                    ================================================== */}

                    {editing && (

                        <div className="doctor-profile-save-area">

                            <button
                                type="button"
                                className="doctor-btn doctor-btn-secondary"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="doctor-btn doctor-btn-success"
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}

                            </button>

                        </div>

                    )}

                </form>

            </div>

        </div>

    );

}