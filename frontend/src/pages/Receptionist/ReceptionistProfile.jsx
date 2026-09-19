import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave, FaUserCircle } from "react-icons/fa";
import api from "../../services/api";
import "./ReceptionistProfile.css";

export default function ReceptionistProfile() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", profile_visibility: "public", allow_direct_messages: true });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("accounts/settings/").then((response) => {
            setForm((current) => ({ ...current, ...response.data }));
        }).catch(() => setError("Unable to load your profile.")).finally(() => setLoading(false));
    }, []);

    const save = async (event) => {
        event.preventDefault();
        try {
            setSaving(true);
            setError("");
            await api.patch("accounts/settings/", form);
            setMessage("Profile updated successfully.");
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to update your profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="receptionist-profile-state">Loading profile...</div>;

    return <div className="receptionist-profile-page">
        <header className="receptionist-profile-header"><Link to="/receptionist/dashboard"><FaArrowLeft /> Back to dashboard</Link><span>ACCOUNT / FRONT DESK</span><h1>Receptionist profile</h1><p>Keep your contact details and front-desk identity up to date.</p></header>
        <form className="receptionist-profile-card" onSubmit={save}>
            <div className="receptionist-profile-intro"><FaUserCircle /><div><strong>{form.first_name || form.username || "Receptionist"} {form.last_name}</strong><small>Receptionist account · {form.username || ""}</small></div></div>
            {message && <div className="profile-success">{message}</div>}
            {error && <div className="profile-error">{error}</div>}
            <div className="receptionist-profile-grid"><label>First name<input value={form.first_name || ""} onChange={(event) => setForm({ ...form, first_name: event.target.value })} /></label><label>Last name<input value={form.last_name || ""} onChange={(event) => setForm({ ...form, last_name: event.target.value })} /></label><label>Email<input type="email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Phone<input value={form.phone || ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label></div>
            <div className="receptionist-profile-actions"><button type="button" onClick={() => navigate("/receptionist/dashboard")}>Cancel</button><button type="submit" disabled={saving}><FaSave /> {saving ? "Saving..." : "Save changes"}</button></div>
        </form>
    </div>;
}
