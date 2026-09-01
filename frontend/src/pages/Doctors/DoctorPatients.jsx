import { useEffect, useState } from "react";
import DoctorLayout from "../../layouts/DoctorLayout";
import api from "../../services/api";
import "./DoctorPatients.css";

export default function DoctorPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name");

    const loadPatients = async () => {
        try {
            setLoading(true);
            setError("");

            // Fetch unique patients from doctor's appointments
            const response = await api.get("/appointments/doctor/appointments/");

            const appointmentData = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.results)
                ? response.data.results
                : [];

            // Extract unique patients
            const uniquePatients = [];
            const seenIds = new Set();

            appointmentData.forEach((apt) => {
                if (!seenIds.has(apt.patient_id)) {
                    seenIds.add(apt.patient_id);
                    uniquePatients.push({
                        id: apt.patient_id,
                        name: apt.patient_name,
                        phone: apt.patient_phone || "N/A",
                        email: apt.patient_email || "N/A",
                        gender: apt.patient_gender || "N/A",
                        age: apt.patient_age || "N/A",
                        lastAppointment: apt.appointment_date,
                        status: apt.status,
                    });
                }
            });

            setPatients(uniquePatients);
        } catch (err) {
            console.error("Load patients error:", err);
            setError("Unable to load patients list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    const filteredPatients = patients
        .filter((patient) =>
            patient.name.toLowerCase().includes(search.toLowerCase()) ||
            patient.phone.includes(search) ||
            patient.email.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === "recent") {
                return new Date(b.lastAppointment) - new Date(a.lastAppointment);
            }
            return 0;
        });

    if (loading) {
        return (
            <DoctorLayout>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="mt-3">Loading Patients</h5>
                </div>
            </DoctorLayout>
        );
    }

    return (
        <DoctorLayout>
            <div className="doctor-patients">
                {/* Header */}
                <div className="doctor-patients__header">
                    <div>
                        <h2 className="doctor-patients__title">My Patients</h2>
                        <p className="doctor-patients__subtitle">
                            Manage and view details of your patients
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={loadPatients}
                    >
                        <i className="fas fa-sync-alt me-2" />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="doctor-patients__filters card border-0 mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-8">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name, phone or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="recent">Sort by Recent</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patients Table */}
                {filteredPatients.length === 0 ? (
                    <div className="card border-0 text-center py-5">
                        <div className="card-body">
                            <i className="fas fa-users fa-3x text-muted mb-3" />
                            <h5>No patients found</h5>
                            <p className="text-muted mb-0">You haven't have any appointments yet.</p>
                        </div>
                    </div>
                ) : (
                    <div className="card border-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Age</th>
                                        <th>Gender</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Last Appointment</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient.id}>
                                            <td>
                                                <strong>{patient.name}</strong>
                                            </td>
                                            <td>{patient.age}</td>
                                            <td>
                                                <span className="badge bg-light text-dark">
                                                    {patient.gender}
                                                </span>
                                            </td>
                                            <td>{patient.phone}</td>
                                            <td className="text-muted small">{patient.email}</td>
                                            <td className="text-muted">
                                                {new Date(patient.lastAppointment).toLocaleDateString()}
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => alert("View patient details - Coming soon!")}
                                                >
                                                    <i className="fas fa-eye me-1" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-3 text-muted small">
                    Showing {filteredPatients.length} of {patients.length} patients
                </div>
            </div>
        </DoctorLayout>
    );
}
