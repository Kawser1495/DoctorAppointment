import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaArrowLeft,
    FaCheck,
    FaClock,
    FaEnvelope,
    FaFileMedical,
    FaStethoscope,
    FaTimes,
    FaUserMd,
} from "react-icons/fa";

import {
    approveDoctor,
    getPendingDoctorRequests,
    rejectDoctor,
} from "../../services/doctorService";

import "./AdminDoctorRequests.css";


const getDoctorName = (doctor) => (
    doctor.doctor_name ||
    [doctor.first_name, doctor.last_name]
        .filter(Boolean)
        .join(" ") ||
    doctor.username ||
    "Unnamed doctor"
);


export default function AdminDoctorRequests() {
    const [requests, setRequests] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getPendingDoctorRequests();
            const data = response?.data;

            setRequests(
                Array.isArray(data)
                    ? data
                    : data?.results || []
            );
        } catch (requestError) {
            setError(
                requestError?.response?.data?.detail ||
                "Unable to load doctor requests."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleApprove = async (doctor) => {
        try {
            setProcessingId(doctor.id);
            setError("");
            await approveDoctor(doctor.id);
            setNotice(`${getDoctorName(doctor)} has been approved.`);
            setRequests((previous) => previous.filter(
                (item) => item.id !== doctor.id
            ));
            setSelectedDoctor(null);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.detail ||
                "Unable to approve this doctor."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!selectedDoctor || !rejectionReason.trim()) {
            setError("Please add a reason before rejecting the request.");
            return;
        }

        try {
            setProcessingId(selectedDoctor.id);
            setError("");
            await rejectDoctor(
                selectedDoctor.id,
                rejectionReason.trim()
            );
            setNotice(`${getDoctorName(selectedDoctor)} has been rejected.`);
            setRequests((previous) => previous.filter(
                (item) => item.id !== selectedDoctor.id
            ));
            setSelectedDoctor(null);
            setRejectionReason("");
        } catch (requestError) {
            setError(
                requestError?.response?.data?.detail ||
                "Unable to reject this doctor."
            );
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="doctor-requests-page">
            <header className="requests-header">
                <div>
                    <Link to="/admin/dashboard" className="back-link">
                        <FaArrowLeft /> Back to dashboard
                    </Link>
                    <span className="requests-eyebrow">ADMIN WORKFLOW</span>
                    <h1>Doctor approval requests</h1>
                    <p>Review credentials before doctors join the patient network.</p>
                </div>
                <div className="request-count">
                    <FaClock />
                    <strong>{requests.length}</strong>
                    <span>awaiting review</span>
                </div>
            </header>

            {notice && (
                <div className="request-alert success" role="status">
                    <FaCheck /> {notice}
                    <button type="button" onClick={() => setNotice("")}>
                        <FaTimes />
                    </button>
                </div>
            )}

            {error && (
                <div className="request-alert error" role="alert">
                    <FaTimes /> {error}
                </div>
            )}

            {loading ? (
                <div className="requests-empty">
                    <div className="request-spinner" />
                    <h2>Loading requests</h2>
                    <p>Gathering the latest doctor applications.</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="requests-empty">
                    <div className="empty-icon"><FaCheck /></div>
                    <h2>All caught up</h2>
                    <p>There are no pending doctor applications right now.</p>
                    <Link to="/admin/dashboard" className="empty-action">
                        Return to dashboard
                    </Link>
                </div>
            ) : (
                <div className="requests-layout">
                    <section className="requests-list" aria-label="Pending doctor requests">
                        {requests.map((doctor) => (
                            <article
                                className={`request-row ${selectedDoctor?.id === doctor.id ? "selected" : ""}`}
                                key={doctor.id}
                            >
                                <div className="doctor-avatar"><FaUserMd /></div>
                                <div className="doctor-summary">
                                    <h2>{getDoctorName(doctor)}</h2>
                                    <p>{doctor.specialization || "Specialization not provided"}</p>
                                    <span>{doctor.department_name || "Department not provided"}</span>
                                </div>
                                <div className="row-actions">
                                    <button
                                        type="button"
                                        className="view-button"
                                        onClick={() => {
                                            setSelectedDoctor(doctor);
                                            setRejectionReason("");
                                            setError("");
                                        }}
                                    >
                                        View doctor
                                    </button>
                                    <button
                                        type="button"
                                        className="approve-button"
                                        disabled={processingId === doctor.id}
                                        onClick={() => handleApprove(doctor)}
                                    >
                                        <FaCheck /> Approve
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>

                    <aside className="request-details">
                        {selectedDoctor ? (
                            <>
                                <div className="details-heading">
                                    <span className="details-kicker">APPLICATION DETAILS</span>
                                    <button
                                        type="button"
                                        className="close-details"
                                        aria-label="Close doctor details"
                                        onClick={() => setSelectedDoctor(null)}
                                    >
                                        <FaTimes />
                                    </button>
                                    <h2>{getDoctorName(selectedDoctor)}</h2>
                                    <span className="pending-pill"><FaClock /> Pending review</span>
                                </div>
                                <div className="details-grid">
                                    <div><FaStethoscope /><span>Specialization<strong>{selectedDoctor.specialization || "Not provided"}</strong></span></div>
                                    <div><FaFileMedical /><span>Qualification<strong>{selectedDoctor.qualification || "Not provided"}</strong></span></div>
                                    <div><FaUserMd /><span>Experience<strong>{selectedDoctor.experience || 0} years</strong></span></div>
                                    <div><FaEnvelope /><span>Email<strong>{selectedDoctor.email || "Not provided"}</strong></span></div>
                                </div>
                                <div className="bio-block">
                                    <span>Biography</span>
                                    <p>{selectedDoctor.biography || "No biography was submitted."}</p>
                                </div>
                                <div className="decision-panel">
                                    <label htmlFor="rejection-reason">Rejection reason</label>
                                    <textarea
                                        id="rejection-reason"
                                        value={rejectionReason}
                                        onChange={(event) => setRejectionReason(event.target.value)}
                                        placeholder="Explain what needs to be corrected..."
                                        rows="3"
                                    />
                                    <div className="decision-actions">
                                        <button
                                            type="button"
                                            className="reject-button"
                                            disabled={processingId === selectedDoctor.id}
                                            onClick={handleReject}
                                        >
                                            <FaTimes /> Reject request
                                        </button>
                                        <button
                                            type="button"
                                            className="approve-button large"
                                            disabled={processingId === selectedDoctor.id}
                                            onClick={() => handleApprove(selectedDoctor)}
                                        >
                                            <FaCheck /> Approve doctor
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="details-placeholder">
                                <div className="placeholder-icon"><FaFileMedical /></div>
                                <h2>Select an application</h2>
                                <p>Open a request to review credentials and make a decision.</p>
                            </div>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}
