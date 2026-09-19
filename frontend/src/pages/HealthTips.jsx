import { useContext, useEffect, useState } from "react";
import { FaArrowLeft, FaBookMedical, FaEdit, FaPlus, FaSearch, FaStethoscope, FaSyncAlt, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api/axios";
import "./HealthTips.css";

const categories = ["General Health", "Diet & Nutrition", "Fitness", "Sleep", "Mental Wellness", "Heart Health", "Child Health"];
const normalize = (data) => Array.isArray(data) ? data : data?.results || [];

export default function HealthTips() {
    const { user } = useContext(AuthContext);
    const isDoctor = String(user?.role || "").toLowerCase() === "doctor";
    const [tips, setTips] = useState([]);
    const [form, setForm] = useState({ title: "", category: categories[0], content: "" });
    const [editingTip, setEditingTip] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const loadTips = async () => {
        setLoading(true);
        try { const response = await api.get("doctors/health-tips/"); setTips(normalize(response.data)); } catch { setTips([]); } finally { setLoading(false); }
    };

    useEffect(() => { loadTips(); }, []);

    const visibleTips = tips.filter((tip) => (
        (category === "All" || tip.category === category) &&
        `${tip.title} ${tip.content} ${tip.category}`.toLowerCase().includes(search.toLowerCase())
    ));

    const submitTip = async (event) => {
        event.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return;
        try {
            if (editingTip) await api.patch(`doctors/health-tips/${editingTip.id}/`, form);
            else await api.post("doctors/health-tips/", form);
            setForm({ title: "", category: categories[0], content: "" });
            setEditingTip(null);
            setShowForm(false);
            setMessage(editingTip ? "Health tip updated successfully." : "Health tip published for all patients.");
            loadTips();
        } catch (error) { setMessage(error?.response?.data?.detail || "Unable to save health tip."); }
    };

    const editTip = (tip) => {
        setEditingTip(tip);
        setForm({ title: tip.title, category: tip.category, content: tip.content });
        setShowForm(true);
    };

    const deleteTip = async (tip) => {
        if (!window.confirm(`Delete "${tip.title}"?`)) return;
        try { await api.delete(`doctors/health-tips/${tip.id}/`); setMessage("Health tip deleted."); loadTips(); }
        catch (error) { setMessage(error?.response?.data?.detail || "Unable to delete health tip."); }
    };

    return (
        <main className="health-tips-page">
            <div className="health-tips-shell">
                <Link className="health-tips-back" to={isDoctor ? "/doctor/dashboard" : "/patient/dashboard"}><FaArrowLeft /> Back to dashboard</Link>
                <header className="health-tips-hero"><div><span>EVERYDAY CARE</span><h1>Health Tips</h1><p>{isDoctor ? "Write practical guidance here. Every published tip is visible to all patients." : "Small, practical guidance from our doctors to help you care for yourself every day."}</p></div><FaStethoscope /></header>
                {isDoctor && <section className="health-tips-doctor-tools"><div><strong>Doctor publishing desk</strong><p>{tips.length} / 10 tips used · Published tips are shared with all patients.</p></div><button onClick={() => { setEditingTip(null); setForm({ title: "", category: categories[0], content: "" }); setShowForm((visible) => !visible); }}><FaPlus /> {showForm ? "Close editor" : "Add health tip"}</button>{showForm && <form onSubmit={submitTip}><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Tip title" required /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select><textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Write a helpful, safe health tip..." rows="4" required /><button type="submit">{editingTip ? "Update tip" : "Publish for all patients"}</button></form>}</section>}
                {message && <p className="health-tips-message">{message}</p>}
                <section className="health-tips-toolbar"><label><FaSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search health tips" /></label><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><button onClick={loadTips} title="Refresh health tips"><FaSyncAlt /> Refresh</button></section>
                <div className="health-tips-context"><FaBookMedical /><div><strong>{category === "All" ? "Everyday wellness library" : category}</strong><p>Practical guidance from our doctors for everyday wellbeing.</p></div></div>
                <section className="health-tips-list">{loading ? <p>Loading health tips...</p> : visibleTips.length ? visibleTips.map((tip, index) => <article className={visibleTips.length === 1 ? "health-tip-featured" : ""} style={{ "--tip-delay": `${index * 70}ms` }} key={tip.id}><div className="health-tip-icon"><FaBookMedical /></div><div><span className="health-tip-category">{tip.category}</span><h2>{tip.title}</h2><p>{tip.content}</p><small>By Dr. {tip.doctor_name || "Care team"} · {new Date(tip.updated_at).toLocaleDateString()} · 2 min read</small></div>{isDoctor && <div className="health-tip-actions"><button onClick={() => editTip(tip)} aria-label="Edit health tip"><FaEdit /></button><button onClick={() => deleteTip(tip)} aria-label="Delete health tip"><FaTrash /></button></div>}</article>) : <p className="health-tips-empty">No health tips match your search.</p>}</section>
            </div>
        </main>
    );
}
