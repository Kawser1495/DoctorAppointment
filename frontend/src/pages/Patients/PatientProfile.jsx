import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaSave, FaUserCircle } from "react-icons/fa";
import { fetchPatientProfile, updateProfile } from "../../services/patientService";
import "./PatientProfile.css";

const initialForm = {
    phone: "",
    email: "",
    gender: "",
    date_of_birth: "",
    blood_group: "",
    address: "",
    emergency_contact: "",
};

export default function PatientProfile() {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetchPatientProfile();
            const data = response.data;
            setProfile(data);
            setImagePreview(data.profile_image || "");
            setFormData({
                phone: data.phone || "",
                email: data.email || "",
                gender: data.gender || "",
                date_of_birth: data.date_of_birth || "",
                blood_group: data.blood_group || "",
                address: data.address || "",
                emergency_contact: data.emergency_contact || "",
            });
        } catch (loadError) {
            setError(loadError.response?.data?.detail || "Unable to load your profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Profile picture must be smaller than 5 MB.");
            return;
        }
        setError("");
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setSaving(true);
            setError("");
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => payload.append(key, value || ""));
            if (selectedImage) payload.append("profile_image", selectedImage);
            const response = await updateProfile(payload);
            setProfile(response.data);
            setSelectedImage(null);
            setImagePreview(response.data.profile_image || "");
            setFormData((current) => ({
                ...current,
                phone: response.data.phone || "",
            }));
            setEditing(false);
            setSuccess("Profile updated successfully.");
        } catch (saveError) {
            const responseData = saveError.response?.data;
            setError(responseData?.detail || Object.values(responseData || {}).flat().join(" ") || "Unable to update your profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <main className="patient-profile-page"><div className="patient-profile-state">Loading profile...</div></main>;
    }

    return (
        <main className="patient-profile-page">
            <div className="patient-profile-container">
                <div className="patient-profile-topbar">
                    <div>
                        <span className="patient-profile-kicker">Patient portal</span>
                        <h1>My Profile</h1>
                        <p>Keep your personal and emergency information up to date.</p>
                    </div>
                    <Link to="/patient/dashboard" className="patient-profile-back"><FaArrowLeft /> Dashboard</Link>
                </div>

                {error && <div className="patient-profile-alert patient-profile-alert-error">{error}</div>}
                {success && <div className="patient-profile-alert patient-profile-alert-success">{success}</div>}

                <section className="patient-profile-card">
                    <div className="patient-profile-card-header">
                        <div className="patient-profile-avatar">
                            {imagePreview ? <img src={imagePreview} alt="Profile" /> : <FaUserCircle />}
                        </div>
                        <div>
                            <h2>{profile?.full_name || profile?.username || "Patient"}</h2>
                            <p>{profile?.email || "No email added"}</p>
                            {editing && <label className="patient-profile-photo-picker" htmlFor="profile-image">
                                <span>Profile picture</span>
                                <input id="profile-image" type="file" accept="image/*" onChange={handleImageChange} />
                            </label>}
                        </div>
                        {!editing && <button type="button" className="patient-profile-edit" onClick={() => { setSuccess(""); setEditing(true); }}><FaEdit /> Edit Profile</button>}
                    </div>

                    <form className="patient-profile-form" onSubmit={handleSubmit}>
                        <div className="patient-profile-readonly">
                            <span>Username</span><span className="patient-profile-value">{profile?.username || "-"}</span>
                        </div>
                        <label>Email<input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!editing} /></label>
                        <label>Phone<input name="phone" value={formData.phone} onChange={handleChange} disabled={!editing} /></label>
                        <label>Gender<select name="gender" value={formData.gender} onChange={handleChange} disabled={!editing}><option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></label>
                        <label>Date of birth<input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} disabled={!editing} /></label>
                        <label>Blood group<input name="blood_group" value={formData.blood_group} onChange={handleChange} disabled={!editing} placeholder="e.g. O+" /></label>
                        <label className="patient-profile-wide">Address<textarea name="address" value={formData.address} onChange={handleChange} disabled={!editing} rows="3" /></label>
                        <label>Emergency contact<input name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} disabled={!editing} /></label>
                        {editing && <div className="patient-profile-form-actions"><button type="button" className="patient-profile-cancel" onClick={() => { setEditing(false); setSelectedImage(null); setImagePreview(profile?.profile_image || ""); setError(""); }}>Cancel</button><button type="submit" className="patient-profile-save" disabled={saving}><FaSave /> {saving ? "Saving..." : "Save Changes"}</button></div>}
                    </form>
                </section>
            </div>
        </main>
    );
}
