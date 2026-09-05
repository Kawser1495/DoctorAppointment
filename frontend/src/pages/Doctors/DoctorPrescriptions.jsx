import { useEffect, useState } from "react";
import DoctorLayout from "../../layouts/DoctorLayout";
import api from "../../services/api";
import "./DoctorPrescriptions.css";

export default function DoctorPrescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: "",
        diagnosis: "",
        medicines: [{ name: "", dosage: "", duration: "", instructions: "" }],
        notes: "",
    });

    const loadPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await api.get("/appointments/doctor/prescriptions/");
            setPrescriptions(Array.isArray(response?.data) ? response.data : []);
        } catch (err) {
            console.error("Load prescriptions error:", err);
            setError("Unable to load prescriptions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPrescriptions();
    }, []);

    const handleAddMedicine = () => {
        setFormData({
            ...formData,
            medicines: [...formData.medicines, { name: "", dosage: "", duration: "", instructions: "" }],
        });
    };

    const handleRemoveMedicine = (index) => {
        const updatedMedicines = formData.medicines.filter((_, i) => i !== index);
        setFormData({ ...formData, medicines: updatedMedicines });
    };

    const handleMedicineChange = (index, field, value) => {
        const updatedMedicines = [...formData.medicines];
        updatedMedicines[index][field] = value;
        setFormData({ ...formData, medicines: updatedMedicines });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/appointments/doctor/prescriptions/", formData);
            setFormData({
                patient_id: "",
                diagnosis: "",
                medicines: [{ name: "", dosage: "", duration: "", instructions: "" }],
                notes: "",
            });
            setShowForm(false);
            loadPrescriptions();
            alert("Prescription created successfully!");
        } catch {
            setError("Unable to create prescription.");
        }
    };

    if (loading) {
        return (
            <DoctorLayout>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="mt-3">Loading Prescriptions</h5>
                </div>
            </DoctorLayout>
        );
    }

    return (
        <DoctorLayout>
            <div className="doctor-prescriptions">
                {/* Header */}
                <div className="doctor-prescriptions__header">
                    <div>
                        <h2 className="doctor-prescriptions__title">Prescriptions</h2>
                        <p className="doctor-prescriptions__subtitle">
                            Manage patient prescriptions and medical notes
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <i className={`fas fa-${showForm ? "times" : "plus"} me-2`} />
                        {showForm ? "Cancel" : "New Prescription"}
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Create Prescription Form */}
                {showForm && (
                    <div className="card border-0 mb-4">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Patient *</label>
                                        <select
                                            className="form-select"
                                            value={formData.patient_id}
                                            onChange={(e) =>
                                                setFormData({ ...formData, patient_id: e.target.value })
                                            }
                                            required
                                        >
                                            <option value="">Select Patient</option>
                                            {/* Patients will be fetched from appointments */}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Diagnosis *</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={formData.diagnosis}
                                        onChange={(e) =>
                                            setFormData({ ...formData, diagnosis: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                {/* Medicines */}
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label mb-0">Medicines *</label>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={handleAddMedicine}
                                        >
                                            <i className="fas fa-plus me-1" />
                                            Add Medicine
                                        </button>
                                    </div>

                                    {formData.medicines.map((medicine, index) => (
                                        <div key={index} className="mb-3 p-3 bg-light rounded">
                                            <div className="row g-2 mb-2">
                                                <div className="col-md-4">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Medicine name"
                                                        value={medicine.name}
                                                        onChange={(e) =>
                                                            handleMedicineChange(index, "name", e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Dosage (e.g., 1+1+1)"
                                                        value={medicine.dosage}
                                                        onChange={(e) =>
                                                            handleMedicineChange(index, "dosage", e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Duration (e.g., 5 Days)"
                                                        value={medicine.duration}
                                                        onChange={(e) =>
                                                            handleMedicineChange(index, "duration", e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    {formData.medicines.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger w-100"
                                                            onClick={() => handleRemoveMedicine(index)}
                                                        >
                                                            <i className="fas fa-trash" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Instructions (e.g., After Food)"
                                                value={medicine.instructions}
                                                onChange={(e) =>
                                                    handleMedicineChange(index, "instructions", e.target.value)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Additional notes or advice..."
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData({ ...formData, notes: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary">
                                        <i className="fas fa-save me-2" />
                                        Create Prescription
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Prescriptions List */}
                {prescriptions.length === 0 ? (
                    <div className="card border-0 text-center py-5">
                        <div className="card-body">
                            <i className="fas fa-prescription-bottle fa-3x text-muted mb-3" />
                            <h5>No prescriptions yet</h5>
                            <p className="text-muted mb-0">Create a prescription for your patients.</p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-3">
                        {prescriptions.map((prescription) => (
                            <div key={prescription.id} className="col-md-6">
                                <div className="card border-0 h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <i className="fas fa-user me-2 text-primary" />
                                            {prescription.patient_name}
                                        </h5>
                                        <div className="mb-2">
                                            <strong>Diagnosis:</strong>
                                            <p className="mb-0">{prescription.diagnosis}</p>
                                        </div>
                                        <div>
                                            <strong>Date:</strong>
                                            <p className="mb-0">
                                                {new Date(prescription.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-transparent">
                                        <button className="btn btn-sm btn-outline-primary">
                                            <i className="fas fa-eye me-1" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
}
