import "./Settings.css";
import { useEffect, useState } from "react";

import {
    getUserSettings,
    updateUserSettings,
    changePassword,
} from "../../services/settingsService";

import "./Settings.css";


function Settings() {

    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [passwordSaving, setPasswordSaving] = useState(false);


    // ======================================================
    // Load User Settings
    // ======================================================

    const loadSettings = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getUserSettings();

            const data = response?.data || response;

            setFormData({
                username: data?.username || "",
                first_name: data?.first_name || "",
                last_name: data?.last_name || "",
                email: data?.email || "",
                phone: data?.phone || "",
                role: data?.role || "",
            });

        } catch (error) {

            console.error(
                "Settings Error:",
                error
            );

            console.error(
                "Backend Error:",
                error.response?.data
            );

            setError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to load settings. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    // ======================================================
    // Load on Page Open
    // ======================================================

    useEffect(() => {

        loadSettings();

    }, []);


    // ======================================================
    // Handle Input
    // ======================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordData((previous) => ({
            ...previous,
            [name]: value,
        }));
        setError("");
        setSuccess("");
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        try {
            setPasswordSaving(true);
            setError("");
            setSuccess("");

            await changePassword(passwordData);
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
            setSuccess("Your password has been changed successfully.");
        } catch (error) {
            const backendError = error.response?.data;
            const firstError = backendError && typeof backendError === "object"
                ? Object.values(backendError)?.[0]
                : null;

            setError(
                Array.isArray(firstError)
                    ? firstError[0]
                    : firstError || "Unable to change your password. Please try again."
            );
        } finally {
            setPasswordSaving(false);
        }
    };


    // ======================================================
    // Save Changes
    // ======================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
            };

            const response =
                await updateUserSettings(payload);

            const data =
                response?.data || response;

            setFormData((previous) => ({
                ...previous,
                username:
                    data?.username ??
                    previous.username,

                first_name:
                    data?.first_name ??
                    previous.first_name,

                last_name:
                    data?.last_name ??
                    previous.last_name,

                email:
                    data?.email ??
                    previous.email,

                phone:
                    data?.phone ??
                    previous.phone,

                role:
                    data?.role ??
                    previous.role,
            }));

            setSuccess(
                "Your account settings have been updated successfully."
            );

        } catch (error) {

            console.error(
                "Update Settings Error:",
                error
            );

            console.error(
                "Backend Error:",
                error.response?.data
            );

            const backendError =
                error.response?.data;

            if (
                backendError &&
                typeof backendError === "object"
            ) {

                const firstError =
                    Object.values(
                        backendError
                    )?.[0];

                if (Array.isArray(firstError)) {

                    setError(
                        firstError[0]
                    );

                } else if (
                    typeof firstError === "string"
                ) {

                    setError(firstError);

                } else {

                    setError(
                        "Unable to update settings."
                    );
                }

            } else {

                setError(
                    "Unable to update settings. Please try again."
                );
            }

        } finally {

            setSaving(false);

        }
    };


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="settings-page">

                <div className="settings-container">

                    <div className="settings-loading">

                        <div className="settings-spinner"></div>

                        <p>
                            Loading your settings...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ======================================================
    // Page
    // ======================================================

    return (

        <div className="settings-page">

            <div className="settings-container">

                {/* ==================================================
                    Header
                ================================================== */}

                <div className="settings-header">

                    <div>

                        <h2>
                            Account Settings
                        </h2>

                        <p>
                            Manage your personal account information.
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    Error
                ================================================== */}

                {error && (

                    <div className="settings-alert settings-error">

                        <span className="settings-alert-icon">
                            ⚠️
                        </span>

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* ==================================================
                    Success
                ================================================== */}

                {success && (

                    <div className="settings-alert settings-success">

                        <span className="settings-alert-icon">
                            ✓
                        </span>

                        <span>
                            {success}
                        </span>

                    </div>

                )}


                {/* ==================================================
                    Settings Form
                ================================================== */}

                <form
                    className="settings-form"
                    onSubmit={handleSubmit}
                >

                    {/* ==================================================
                        Username
                    ================================================== */}

                    <div className="settings-field">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            className="settings-input"
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />

                        <small>
                            You can update your username.
                        </small>

                    </div>


                    {/* ==================================================
                        First Name
                    ================================================== */}

                    <div className="settings-field">

                        <label htmlFor="first_name">
                            First Name
                        </label>

                        <input
                            className="settings-input"
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                        />

                    </div>


                    {/* ==================================================
                        Last Name
                    ================================================== */}

                    <div className="settings-field">

                        <label htmlFor="last_name">
                            Last Name
                        </label>

                        <input
                            className="settings-input"
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                        />

                    </div>


                    {/* ==================================================
                        Email
                    ================================================== */}

                    <div className="settings-field">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            className="settings-input"
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* ==================================================
                        Phone
                    ================================================== */}

                    <div className="settings-field">

                        <label htmlFor="phone">
                            Phone Number
                        </label>

                        <input
                            className="settings-input"
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                    </div>


                    {/* ==================================================
                        Role
                    ================================================== */}

                    <div className="settings-field">

                        <label htmlFor="role">
                            Role
                        </label>

                        <input
                            className="settings-input settings-readonly"
                            type="text"
                            id="role"
                            value={formData.role}
                            disabled
                        />

                        <small>
                            Your account role can only be changed by an administrator.
                        </small>

                    </div>


                    {/* ==================================================
                        Save Button
                    ================================================== */}

                    <div className="settings-actions">

                        <button
                            className="settings-save-btn"
                            type="submit"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : "Save Changes"
                            }

                        </button>

                    </div>

                </form>

                <form
                    className="settings-form settings-password-form"
                    onSubmit={handlePasswordSubmit}
                >
                    <div className="settings-section-heading">
                        <h3>Change Password</h3>
                        <p>Use your current password to set a new password.</p>
                    </div>

                    <div className="settings-field">
                        <label htmlFor="current_password">Current Password</label>
                        <input
                            className="settings-input"
                            type="password"
                            id="current_password"
                            name="current_password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <div className="settings-field">
                        <label htmlFor="new_password">New Password</label>
                        <input
                            className="settings-input"
                            type="password"
                            id="new_password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            minLength={8}
                            autoComplete="new-password"
                            required
                        />
                        <small>Use at least 8 characters.</small>
                    </div>

                    <div className="settings-field">
                        <label htmlFor="confirm_password">Confirm New Password</label>
                        <input
                            className="settings-input"
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            minLength={8}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="settings-actions">
                        <button
                            className="settings-save-btn settings-password-btn"
                            type="submit"
                            disabled={passwordSaving}
                        >
                            {passwordSaving ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>

            </div>

        </div>
    );
}


export default Settings;