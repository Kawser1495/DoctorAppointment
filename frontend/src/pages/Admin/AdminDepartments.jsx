import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaPlus, FaPowerOff, FaTrash, FaTimes } from "react-icons/fa";
import { createDepartment, deleteDepartment, getAdminDepartments, updateDepartment } from "../../services/departmentService";
import "./AdminDepartments.css";

export default function AdminDepartments() {
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({ name: "", description: "", is_active: true });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const load = async () => {
        try {
            const response = await getAdminDepartments();
            const data = response?.data;
            setDepartments(Array.isArray(data) ? data : data?.results || []);
        } catch (requestError) { setError(requestError?.response?.data?.detail || "Unable to load departments."); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const submit = async (event) => {
        event.preventDefault();
        if (!form.name.trim()) return setError("Department name is required.");
        try {
            setError("");
            if (editingId) await updateDepartment(editingId, form);
            else await createDepartment({ ...form, name: form.name.trim() });
            setNotice(editingId ? "Department updated." : "Department created.");
            setForm({ name: "", description: "", is_active: true });
            setEditingId(null);
            load();
        } catch (requestError) { setError(requestError?.response?.data?.name?.[0] || requestError?.response?.data?.detail || "Unable to save department."); }
    };

    const toggle = async (department) => {
        try { await updateDepartment(department.id, { is_active: !department.is_active }); setDepartments((items) => items.map((item) => item.id === department.id ? { ...item, is_active: !department.is_active } : item)); }
        catch (requestError) { setError(requestError?.response?.data?.detail || "Unable to update department."); }
    };

    const remove = async (department) => {
        if (!window.confirm(`Delete ${department.name}?`)) return;
        try { await deleteDepartment(department.id); setDepartments((items) => items.filter((item) => item.id !== department.id)); setNotice("Department deleted."); }
        catch (requestError) { setError(requestError?.response?.data?.detail || "This department cannot be deleted."); }
    };

    return <div className="admin-management-page"><header className="management-header"><div><Link to="/admin/dashboard" className="management-back"><FaArrowLeft /> Dashboard</Link><span className="management-kicker">SETTINGS / ORGANIZATION</span><h1>Departments</h1><p>Keep your clinical catalog organized and ready for patient bookings.</p></div><div className="management-total"><strong>{departments.length}</strong><span>departments</span></div></header>{(error || notice) && <div className={`management-alert ${notice && !error ? "success" : ""}`}>{error || notice}<button type="button" onClick={() => { setError(""); setNotice(""); }}><FaTimes /></button></div>}<div className="department-layout"><form className="department-form" onSubmit={submit}><span className="management-kicker">{editingId ? "EDIT DEPARTMENT" : "ADD DEPARTMENT"}</span><h2>{editingId ? "Update department" : "Create a new department"}</h2><label htmlFor="department-name">Name</label><input id="department-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Cardiology" /><label htmlFor="department-description">Description</label><textarea id="department-description" rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What does this department provide?" /><label className="checkbox-line"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active and visible for bookings</label><div className="department-form-actions"><button className="success-action" type="submit"><FaPlus /> {editingId ? "Save changes" : "Add department"}</button>{editingId && <button className="cancel-action" type="button" onClick={() => { setEditingId(null); setForm({ name: "", description: "", is_active: true }); }}>Cancel</button>}</div></form><section className="department-list"><div className="list-heading"><div><span className="management-kicker">DEPARTMENT DIRECTORY</span><h2>All departments</h2></div></div>{loading ? <div className="management-empty">Loading departments...</div> : departments.map((department) => <article className="department-row" key={department.id}><div><h3>{department.name}</h3><p>{department.description || "No description provided."}</p><small>{department.doctor_count || 0} doctors assigned</small></div><span className={`status-chip ${department.is_active ? "approved" : "rejected"}`}>{department.is_active ? "Active" : "Inactive"}</span><div className="department-actions"><button title="Edit department" type="button" onClick={() => { setEditingId(department.id); setForm({ name: department.name, description: department.description || "", is_active: department.is_active }); }}><FaEdit /></button><button title={department.is_active ? "Deactivate" : "Activate"} type="button" onClick={() => toggle(department)}><FaPowerOff /></button><button title="Delete department" type="button" onClick={() => remove(department)}><FaTrash /></button></div></article>)}</section></div></div>;
}
