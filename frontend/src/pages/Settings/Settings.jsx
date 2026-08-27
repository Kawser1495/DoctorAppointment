import {
    useEffect,
    useState,
} from "react";

import {
    getUserSettings,
    updateUserSettings,
} from "../../services/settingsService";


function Settings() {

    const [
        settings,
        setSettings
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        saving,
        setSaving
    ] = useState(false);

    const [
        message,
        setMessage
    ] = useState("");

    const [
        error,
        setError
    ] = useState("");


    // ======================================================
    // Load Settings
    // ======================================================

    const loadSettings = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getUserSettings();

            setSettings(data);

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
                "Unable to load settings."
            );

        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // Initial Load
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
            value
        } = event.target;

        setSettings(
            previous => ({
                ...previous,
                [name]: value,
            })
        );

    };


    // ======================================================
    // Save Settings
    // ======================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        try {

            setSaving(true);
            setMessage("");
            setError("");

            const data =
                await updateUserSettings({

                    first_name:
                        settings.first_name,

                    last_name:
                        settings.last_name,

                    email:
                        settings.email,

                    phone:
                        settings.phone,

                });


            setSettings(data);

            setMessage(
                "Settings updated successfully."
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

            setError(
                error.response?.data?.detail ||
                "Unable to update settings."
            );

        } finally {

            setSaving(false);

        }

    };


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="page-container">

                <h2>Settings</h2>

                <p>
                    Loading settings...
                </p>

            </div>

        );

    }


    // ======================================================
    // Error
    // ======================================================

    if (error && !settings) {

        return (

            <div className="page-container">

                <h2>Settings</h2>

                <div
                    style={{
                        padding: "15px",
                        marginBottom: "15px",
                        borderRadius: "8px",
                        background: "#fee2e2",
                        color: "#991b1b",
                    }}
                >
                    ⚠️ {error}
                </div>

                <button
                    onClick={loadSettings}
                >
                    Try Again
                </button>

            </div>

        );

    }


    // ======================================================
    // Page
    // ======================================================

    return (

        <div
            className="page-container"
            style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "30px",
            }}
        >

            <h2>
                Account Settings
            </h2>

            <p
                style={{
                    color: "#666",
                    marginBottom: "25px",
                }}
            >
                Manage your personal account information.
            </p>


            {/* ==============================================
                Success Message
            ============================================== */}

            {message && (

                <div
                    style={{
                        padding: "12px 15px",
                        marginBottom: "20px",
                        borderRadius: "8px",
                        background: "#dcfce7",
                        color: "#166534",
                    }}
                >
                    ✅ {message}
                </div>

            )}


            {/* ==============================================
                Error Message
            ============================================== */}

            {error && (

                <div
                    style={{
                        padding: "12px 15px",
                        marginBottom: "20px",
                        borderRadius: "8px",
                        background: "#fee2e2",
                        color: "#991b1b",
                    }}
                >
                    ⚠️ {error}
                </div>

            )}


            <form
                onSubmit={handleSubmit}
            >

                {/* ==========================================
                    Username
                ========================================== */}

                <div
                    style={{
                        marginBottom: "18px",
                    }}
                >

                    <label>
                        Username
                    </label>

                    <input
                        type="text"
                        value={
                            settings?.username || ""
                        }
                        disabled
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "6px",
                        }}
                    />

                </div>


                {/* ==========================================
                    First Name
                ========================================== */}

                <div
                    style={{
                        marginBottom: "18px",
                    }}
                >

                    <label>
                        First Name
                    </label>

                    <input
                        type="text"
                        name="first_name"
                        value={
                            settings?.first_name || ""
                        }
                        onChange={
                            handleChange
                        }
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "6px",
                        }}
                    />

                </div>


                {/* ==========================================
                    Last Name
                ========================================== */}

                <div
                    style={{
                        marginBottom: "18px",
                    }}
                >

                    <label>
                        Last Name
                    </label>

                    <input
                        type="text"
                        name="last_name"
                        value={
                            settings?.last_name || ""
                        }
                        onChange={
                            handleChange
                        }
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "6px",
                        }}
                    />

                </div>


                {/* ==========================================
                    Email
                ========================================== */}

                <div
                    style={{
                        marginBottom: "18px",
                    }}
                >

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={
                            settings?.email || ""
                        }
                        onChange={
                            handleChange
                        }
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "6px",
                        }}
                    />

                </div>


                {/* ==========================================
                    Phone
                ========================================== */}

                <div
                    style={{
                        marginBottom: "18px",
                    }}
                >

                    <label>
                        Phone Number
                    </label>

                    <input
                        type="text"
                        name="phone"
                        value={
                            settings?.phone || ""
                        }
                        onChange={
                            handleChange
                        }
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "6px",
                        }}
                    />

                </div>


                {/* ==========================================
                    Role
                ========================================== */}

                <div
                    style={{
                        marginBottom: "18px",
                    }}
                >

                    <label>
                        Role
                    </label>

                    <input
                        type="text"
                        value={
                            settings?.role || ""
                        }
                        disabled
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "6px",
                        }}
                    />

                </div>


                {/* ==========================================
                    Save
                ========================================== */}

                <button
                    type="submit"
                    disabled={saving}
                    style={{
                        padding: "11px 22px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: saving
                            ? "not-allowed"
                            : "pointer",
                    }}
                >

                    {saving
                        ? "Saving..."
                        : "Save Changes"
                    }

                </button>

            </form>

        </div>

    );

}


export default Settings;