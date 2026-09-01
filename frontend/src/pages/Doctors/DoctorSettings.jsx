import { useContext, useState } from "react";
import DoctorLayout from "../../layouts/DoctorLayout";
import AuthContext from "../../context/AuthContext";
import api from "../../services/api";
import "./DoctorSettings.css";

export default function DoctorSettings() {
    const { user } = useContext(AuthContext);
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
            await api.patch("/accounts/notification-settings/", notificationSettings);
            setMessage({ type: "success", text: "Notification settings updated!" });
        } catch (err) {
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
            await api.patch("/accounts/account-settings/", accountSettings);
            setMessage({ type: "success", text: "Account settings updated!" });
        } catch (err) {
            setMessage({
                type: "error",
                text: "Failed to update account settings",
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

                                    <div className="doctor-settings__switch-item mb-4">
                                        <div>
                                            <h6 className="mb-1">Two-Factor Authentication</h6>
                                            <p className="text-muted small mb-0">
                                                Add extra security to your account
                                            </p>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={accountSettings.two_factor_auth}
                                                onChange={(e) =>
                                                    setAccountSettings({
                                                        ...accountSettings,
                                                        two_factor_auth: e.target.checked,
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
