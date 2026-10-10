import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarCheck, FaSearch, FaTimes, FaUserMd, FaUsers } from "react-icons/fa";
import { deleteAdminPatient, getAdminDoctorPatientSummary, getAdminPatientDetails, getAdminPatients } from "../../services/adminService";
import "./AdminManagement.css";

const getList = (response) => {
    const data = response?.data;
    return Array.isArray(data) ? data : data?.results || [];
};

export default function AdminPatients() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [doctorSummary, setDoctorSummary] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("all");
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const loadData = async () => {
        const [patientResponse, doctorResponse] = await Promise.all([
            getAdminPatients(),
            getAdminDoctorPatientSummary(),
        ]);
        setPatients(getList(patientResponse));
        setDoctorSummary(getList(doctorResponse));
    };

    useEffect(() => {
        loadData().catch((requestError) => setError(requestError?.response?.data?.detail || "Unable to load patient management data.")).finally(() => setLoading(false));
    }, []);

    const filteredPatients = useMemo(() => {
        const query = search.trim().toLowerCase();
        const ownerById = new Map(patients.map((patient) => [String(patient.id), patient]));
        const people = new Map();
        patients.forEach((patient) => {
            const doctors = patient.doctors || [];
            if (selectedDoctor !== "all" && !doctors.some((doctor) => String(doctor.id) === selectedDoctor)) return;
            people.set(`patient:${patient.id}`, { ...patient, person_id: `patient:${patient.id}`, person_type: "Patient", display_name: patient.full_name || patient.username, appointment_count: patient.active_appointment_count || 0, assigned_doctors: doctors.map((doctor) => doctor.name) });
        });
        doctorSummary.forEach((doctor) => {
            if (selectedDoctor !== "all" && String(doctor.id) !== selectedDoctor) return;
            (doctor.people || []).filter((person) => person.person_type === "Family member").forEach((person) => {
                const owner = ownerById.get(String(person.patient_id));
                people.set(person.id, { ...person, person_id: person.id, display_name: person.name, username: owner ? `Family of @${owner.username}` : "Family member", email: owner?.email || "-", phone: owner?.phone || "Owner contact unavailable", is_active: owner?.is_active ?? true, assigned_doctors: [doctor.name], family_member: true });
            });
        });
        return Array.from(people.values()).filter((person) => [person.display_name, person.username, person.email, person.phone, ...(person.assigned_doctors || [])].some((value) => !query || String(value || "").toLowerCase().includes(query)));
    }, [doctorSummary, patients, search, selectedDoctor]);

    const openPatient = async (patient) => {
        try { setSelected((await getAdminPatientDetails(patient.id))?.data); } catch (requestError) { setError(requestError?.response?.data?.detail || "Unable to load patient details."); }
    };

    const deletePatient = async () => {
        if (!selected || deleting) return;
        if (!window.confirm(`Are you sure you want to delete this patient?\n\n${selected.full_name}\n\nAll family members, appointments, payments, reports, and related records will be permanently deleted.`)) return;
        try {
            setDeleting(true);
            await deleteAdminPatient(selected.id);
            localStorage.setItem("admin-appointments-updated", String(Date.now()));
            window.dispatchEvent(new Event("admin-appointments-updated"));
            await loadData();
            setSelected(null);
            setSelectedPerson(null);
        } catch (requestError) {
            setError(requestError?.response?.data?.detail || "Unable to delete patient.");
        } finally { setDeleting(false); }
    };

    const activeDoctor = doctorSummary.find((doctor) => String(doctor.id) === selectedDoctor);
    const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/admin/dashboard"));

    return <div className="admin-management-page">
        <header className="management-header"><div><button type="button" className="management-back management-back-button" onClick={goBack}><FaArrowLeft /> Back</button><span className="management-kicker">PEOPLE / CARE RECIPIENTS</span><h1>Patient Management</h1><p>Search patients, review profiles, and see doctor-wise care coverage.</p></div><div className="management-total"><strong>{patients.length}</strong><span>total patients</span></div></header>
        {error && <div className="management-alert"><FaTimes /> {error}</div>}
        <section className="patient-management-toolbar"><label className="patient-search"><FaSearch /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patient, username, phone, email, or doctor..." /></label><label className="doctor-filter"><span>Doctor</span><select value={selectedDoctor} onChange={(event) => { setSelectedDoctor(event.target.value); setSelectedPerson(null); }}><option value="all">All doctors</option>{doctorSummary.map((doctor) => <option value={doctor.id} key={doctor.id}>{doctor.name}</option>)}</select></label>{(search || selectedDoctor !== "all") && <button type="button" className="clear-filter" onClick={() => { setSearch(""); setSelectedDoctor("all"); setSelectedPerson(null); }}>Clear filters</button>}</section>
        <section className="doctor-summary-section"><div className="section-heading"><div><span className="management-kicker">CARE NETWORK</span><h2>Doctor-wise patient coverage</h2></div><span>{doctorSummary.length} doctors</span></div><div className="doctor-summary-grid">{doctorSummary.map((doctor) => <button type="button" className={`doctor-summary-card ${selectedDoctor === String(doctor.id) ? "selected" : ""}`} key={doctor.id} onClick={() => { setSelectedDoctor(String(doctor.id)); setSelectedPerson(null); }}><span className="doctor-summary-icon"><FaUserMd /></span><span className="doctor-summary-copy"><strong>{doctor.name}</strong><small>{doctor.department}</small></span><span className="doctor-summary-count"><strong>{doctor.person_count}</strong><small>unique people</small></span></button>)}</div>{activeDoctor && <div className="doctor-people-panel"><div className="section-heading"><div><span className="management-kicker">{activeDoctor.name}</span><h2>Unique patients and family members</h2></div><span>{activeDoctor.appointment_count} appointments</span></div><div className="doctor-people-list">{activeDoctor.people.map((person) => <button type="button" className={`doctor-person-row ${selectedPerson?.id === person.id ? "selected" : ""}`} key={person.id} onClick={() => setSelectedPerson(person)}><span className="doctor-person-avatar">{person.name.charAt(0).toUpperCase()}</span><span className="doctor-person-copy"><strong>{person.name}</strong><small>{person.person_type} · {person.relation}</small></span><span className="doctor-person-count"><strong>{person.appointment_count}</strong><small>appointments</small></span></button>)}</div>{selectedPerson && <div className="doctor-person-detail"><div><span className="management-kicker">APPOINTMENT DETAILS</span><h3>{selectedPerson.name}</h3><p>{selectedPerson.person_type} · {selectedPerson.relation}</p></div><div className="doctor-person-appointments">{selectedPerson.appointments.map((appointment) => <div className="doctor-person-appointment" key={appointment.id}><strong>{appointment.booking_number}</strong><span>{appointment.appointment_date}</span><span>{appointment.time_range || appointment.slot_time}</span><span className="status-chip">{appointment.status}</span></div>)}</div></div>}</div>}</section>
        {loading ? <div className="management-empty">Loading patient management...</div> : filteredPatients.length === 0 ? <div className="management-empty"><FaUsers /><h2>No patients found</h2></div> : <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Patient</th><th>Contact</th><th>Type</th><th>Assigned doctors</th><th>Care activity</th><th>Account</th><th>Action</th></tr></thead><tbody>{filteredPatients.map((person) => <tr key={person.person_id}><td><strong>{person.display_name}</strong><small>{person.username}</small></td><td>{person.email || "-"}<small>{person.phone || "No phone"}</small></td><td><span className="status-chip">{person.person_type}</span></td><td><div className="doctor-list-cell">{person.assigned_doctors?.map((doctor) => <span key={doctor}>{doctor}</span>)}</div></td><td>{person.appointment_count || 0}<small>active appointments</small></td><td><span className={`status-chip ${person.is_active ? "approved" : "rejected"}`}>{person.is_active ? "Active" : "Inactive"}</span></td><td><button type="button" className="view-record" onClick={() => openPatient(person.family_member ? { id: person.patient_id } : person)}>View profile</button></td></tr>)}</tbody></table></div>}
        {selected && <div className="management-modal" role="dialog" aria-modal="true" aria-label="Patient profile"><div className="management-modal-card patient-card"><button type="button" className="modal-close" onClick={() => setSelected(null)} aria-label="Close patient profile"><FaTimes /></button><span className="management-kicker">PATIENT PROFILE</span><h2>{selected.full_name}</h2><p>{selected.email} · {selected.phone || "No phone"}</p><div className="patient-metrics"><div><FaUsers /><strong>{selected.family_members?.length || 0}</strong><span>Family members</span></div><div><FaCalendarCheck /><strong>{selected.active_appointment_count || 0}</strong><span>Active appointments</span></div><div><FaUserMd /><strong>{selected.doctors?.length || 0}</strong><span>Doctors</span></div><div><strong>{selected.payment_count || 0}</strong><span>Payments</span></div><div><strong>BDT {selected.total_payment_amount || 0}</strong><span>Total paid</span></div></div><div className="patient-detail-columns"><div><h3>Profile</h3><p><strong>Gender</strong>{selected.gender || "Not provided"}</p><p><strong>Date of birth</strong>{selected.date_of_birth || "Not provided"}</p><p><strong>Blood group</strong>{selected.blood_group || "Not provided"}</p><p><strong>Address</strong>{selected.address || "Not provided"}</p></div><div><h3>Care team</h3>{selected.doctors?.length ? selected.doctors.map((doctor) => <p key={doctor.id}><strong>{doctor.name}</strong>{doctor.department} · {doctor.appointment_count} active appointments</p>) : <p>No active doctor history found.</p>}</div></div><div className="patient-delete-footer"><button type="button" className="delete-patient-button" onClick={deletePatient} disabled={deleting}>{deleting ? "Deleting..." : "Delete patient"}</button></div></div></div>}
    </div>;
}
