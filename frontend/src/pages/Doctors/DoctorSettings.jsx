import { useContext, useEffect, useState } from "react";
import DoctorLayout from "../../layouts/DoctorLayout";
import AuthContext from "../../context/AuthContext";
import api from "../../services/api";
import "./DoctorSettings.css";

export default function DoctorSettings() {
    useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("password");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [notificationSettings, setNotificationSettings] = useState({
        email_on_new_appointment: true,
        email_on_cancellation: true,
        sms_reminders: true,
        appointment_reminders: true,
    });

    const [accountSettings, setAccountSettings] = useState({
        profile_visibility: "public",
        allow_direct_messages: true,
        two_factor_auth: false,
    });

    const [profileSettings, setProfileSettings] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await api.get("accounts/settings/");
                const data = response?.data || {};

                setNotificationSettings((previous) => ({
                    ...previous,
                    email_on_new_appointment: data.notification_new_appointment ?? previous.email_on_new_appointment,
                    email_on_cancellation: data.notification_cancellation ?? previous.email_on_cancellation,
                    appointment_reminders: data.notification_reminder ?? previous.appointment_reminders,
                    sms_reminders: data.notification_reminder ?? previous.sms_reminders,
                }));

                setAccountSettings((previous) => ({
                    ...previous,
                    profile_visibility: data.profile_visibility || previous.profile_visibility,
                    allow_direct_messages: data.allow_direct_messages ?? previous.allow_direct_messages,
                }));

                setProfileSettings({
                    username: data.username || "",
                    email: data.email || "",
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                });
            } catch (loadError) {
                setMessage({
                    type: "error",
                    text: loadError?.response?.data?.detail || "Unable to load settings.",
                });
            }
        };

        loadSettings();
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setMessage({ type: "error", text: "Passwords do not match!" });
            return;
        }

        try {
            setLoading(true);
            await api.post("/accounts/change-password/", {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
            });

            setMessage({ type: "success", text: "Password changed successfully!" });
            setPasswordForm({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
        } catch (err) {
            setMessage({
                type: "error",
                text: err?.response?.data?.detail || "Failed to change password",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async () => {
        try {
            setLoading(true);
            await api.patch("accounts/settings/", {
                notification_new_appointment: notificationSettings.email_on_new_appointment,
                notification_cancellation: notificationSettings.email_on_cancellation,
                notification_reminder: notificationSettings.appointment_reminders,
            });
            setMessage({ type: "success", text: "Notification settings updated!" });
        } catch {
            setMessage({
                type: "error",
                text: "Failed to update notification settings",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAccountUpdate = async () => {
        try {
            setLoading(true);
            await api.patch("accounts/settings/", {
                username: profileSettings.username.trim(),
                email: profileSettings.email.trim(),
                first_name: profileSettings.first_name.trim(),
                last_name: profileSettings.last_name.trim(),
                profile_visibility: accountSettings.profile_visibility,
                allow_direct_messages: accountSettings.allow_direct_messages,
            });
            setMessage({ type: "success", text: "Account information updated!" });
        } catch (error) {
            setMessage({
                type: "error",
                text: error?.response?.data?.detail ||
                    Object.values(error?.response?.data || {}).flat().join(" ") ||
                    "Failed to update account information",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DoctorLayout>
            <div className="doctor-settings">
                <h2 className="doctor-settings__title">
                    <i className="fas fa-cog me-2" />
                    Settings
                </h2>

                {message && (
                    <div className={`alert alert-${message.type === "success" ? "success" : "danger"}`} role="alert">
                        {message.text}
                    </div>
                )}

                <div className="row">
                    {/* Sidebar */}
                    <div className="col-lg-3 mb-4">
                        <div className="doctor-settings__tabs">
                            <button
                                className={`doctor-settings__tab ${activeTab === "password" ? "active" : ""}`}
                                onClick={() => setActiveTab("password")}
                            >
                                <i className="fas fa-lock me-2" />
                                Change Password
                            </button>
                            <button
                                className={`doctor-settings__tab ${activeTab === "notifications" ? "active" : ""}`}
                                onClick={() => setActiveTab("notifications")}
                            >
                                <i className="fas fa-bell me-2" />
                                Notifications
                            </button>
                            <button
                                className={`doctor-settings__tab ${activeTab === "account" ? "active" : ""}`}
                                onClick={() => setActiveTab("account")}
                            >
                                <i className="fas fa-shield-alt me-2" />
                                Account
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="col-lg-9">
                        {/* Change Password */}
                        {activeTab === "password" && (
                            <div className="card border-0">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">
                                        <i className="fas fa-lock me-2" />
                                        Change Password
                                    </h5>

                                    <form onSubmit={handlePasswordChange}>
                                        <div className="mb-3">
                                            <label className="form-label">Current Password *</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={passwordForm.current_password}
                                                onChange={(e) =>
                                                    setPasswordForm({
                                                        ...passwordForm,
                                                        current_password: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">New Password *</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={passwordForm.new_password}
                                                onChange={(e) =>
                                                    setPasswordForm({
                                                        ...passwordForm,
                                                        new_password: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label">Confirm Password *</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={passwordForm.confirm_password}
                                                onChange={(e) =>
                                                    setPasswordForm({
                                                        ...passwordForm,
                                                        confirm_password: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? "Updating..." : "Update Password"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Notifications */}
                        {activeTab === "notifications" && (
                            <div className="card border-0">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">
                                        <i className="fas fa-bell me-2" />
                                        Notification Preferences
                                    </h5>

                                    <div className="doctor-settings__switch-group">
                                        <div className="doctor-settings__switch-item">
                                            <div>
                                                <h6 className="mb-1">Email on New Appointment</h6>
                                                <p className="text-muted small mb-0">
                                                    Receive email when a patient books an appointment
                                                </p>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={notificationSettings.email_on_new_appointment}
                                                    onChange={(e) =>
                                                        setNotificationSettings({
                                                            ...notificationSettings,
                                                            email_on_new_appointment: e.target.checked,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="doctor-settings__switch-item">
                                            <div>
                                                <h6 className="mb-1">Email on Cancellation</h6>
                                                <p className="text-muted small mb-0">
                                                    Receive email when patient cancels appointment
                                                </p>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={notificationSettings.email_on_cancellation}
                                                    onChange={(e) =>
                                                        setNotificationSettings({
                                                            ...notificationSettings,
                                                            email_on_cancellation: e.target.checked,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="doctor-settings__switch-item">
                                            <div>
                                                <h6 className="mb-1">SMS Reminders</h6>
                                                <p className="text-muted small mb-0">
                                                    Receive SMS reminder before appointments
                                                </p>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={notificationSettings.sms_reminders}
                                                    onChange={(e) =>
                                                        setNotificationSettings({
                                                            ...notificationSettings,
                                                            sms_reminders: e.target.checked,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="doctor-settings__switch-item">
                                            <div>
                                                <h6 className="mb-1">Appointment Reminders</h6>
                                                <p className="text-muted small mb-0">
                                                    Show in-app reminders for upcoming appointments
                                                </p>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={notificationSettings.appointment_reminders}
                                                    onChange={(e) =>
                                                        setNotificationSettings({
                                                            ...notificationSettings,
                                                            appointment_reminders: e.target.checked,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary mt-4"
                                        onClick={handleNotificationUpdate}
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "Save Preferences"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Account Settings */}
                        {activeTab === "account" && (
                            <div className="card border-0">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">
                                        <i className="fas fa-shield-alt me-2" />
                                        Account Settings
                                    </h5>

                                    <h6 className="mb-3">Personal Information</h6>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Username</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileSettings.username}
                                                onChange={(e) => setProfileSettings({ ...profileSettings, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={profileSettings.email}
                                                onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">First Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileSettings.first_name}
                                                onChange={(e) => setProfileSettings({ ...profileSettings, first_name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Last Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileSettings.last_name}
                                                onChange={(e) => setProfileSettings({ ...profileSettings, last_name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Profile Visibility</label>
                                        <select
                                            className="form-select"
                                            value={accountSettings.profile_visibility}
                                            onChange={(e) =>
                                                setAccountSettings({
                                                    ...accountSettings,
                                                    profile_visibility: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="public">Public</option>
                                            <option value="private">Private</option>
                                            <option value="contacts">Contacts Only</option>
                                        </select>
                                        <small className="text-muted d-block mt-1">
                                            Choose who can see your profile information
                                        </small>
                                    </div>

                                    <div className="doctor-settings__switch-item mb-3">
                                        <div>
                                            <h6 className="mb-1">Allow Direct Messages</h6>
                                            <p className="text-muted small mb-0">
                                                Patients can send you direct messages
                                            </p>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={accountSettings.allow_direct_messages}
                                                onChange={(e) =>
                                                    setAccountSettings({
                                                        ...accountSettings,
                                                        allow_direct_messages: e.target.checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={handleAccountUpdate}
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "Save Settings"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}
