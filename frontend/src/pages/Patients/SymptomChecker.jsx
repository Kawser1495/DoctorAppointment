import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarCheck, FaChevronRight, FaClock, FaFileDownload, FaHeartbeat, FaShieldAlt, FaStethoscope } from "react-icons/fa";
import { getDoctors } from "../../services/doctorService";
import {
    analyzeSymptomsWithAI,
    getPatientAIReports,
} from "../../services/appointmentService";
import { createSSLCommerzAIReportPayment } from "../../services/paymentService";
import "./SymptomChecker.css";

const HISTORY_KEY = "doctor-appointment-symptom-reports";

const readHistory = () => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
};

export default function SymptomChecker() {
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState("");
    const [duration, setDuration] = useState("Less than 2 days");
    const [severity, setSeverity] = useState("Mild");
    const [result, setResult] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [history, setHistory] = useState(readHistory);
    const [shareMessage, setShareMessage] = useState("");
    const [shareSaving, setShareSaving] = useState(false);
    const [sharedReports, setSharedReports] = useState([]);
    const [sharedReportsLoading, setSharedReportsLoading] = useState(true);
    const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [shareAppointmentId, setShareAppointmentId] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState("");

    useEffect(() => {
        getDoctors().then((response) => setDoctors(Array.isArray(response?.data) ? response.data : response?.data?.results || [])).catch(() => setDoctors([]));
        getPatientAIReports()
            .then((response) => setSharedReports(Array.isArray(response?.data) ? response.data : response?.data?.results || []))
            .catch(() => setSharedReports([]))
            .finally(() => setSharedReportsLoading(false));
    }, []);

    const recommendedDoctors = useMemo(() => {
        if (Array.isArray(result?.recommendedDoctors)) return result.recommendedDoctors;
        if (!result?.recommendationAllowed || !result.matchPrefixes?.length) return [];
        const matches = doctors.filter((doctor) => {
            const doctorProfile = `${doctor.specialization || ""} ${doctor.department_name || ""}`
                .toLowerCase()
                .replace(/[^a-z]/g, "");
            return result.matchPrefixes.some((prefix) => doctorProfile.startsWith(prefix));
        });
        return matches.slice(0, 3);
    }, [doctors, result]);

    const handleAnalyze = async (event) => {
        event.preventDefault();
        if (!symptoms.trim()) return;
        try {
            setAnalyzing(true);
            setAnalysisError("");
            const response = await analyzeSymptomsWithAI({ symptoms: symptoms.trim(), duration, severity });
            const report = { ...response.data, createdAt: new Date().toISOString() };
            setResult(report);
            const nextHistory = [report, ...history].slice(0, 10);
            setHistory(nextHistory);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
        } catch (error) {
            setAnalysisError(error?.response?.data?.detail || "AI analysis is unavailable right now. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const downloadReport = () => {
        if (!result) return;
        const report = [`AI SYMPTOM CHECKER REPORT`, `Date: ${new Date(result.createdAt).toLocaleString()}`, `Symptoms: ${result.symptoms}`, `Duration: ${result.duration}`, `Severity: ${result.severity}`, `Category: ${result.category}`, `Urgency: ${result.urgency}`, `Recommended specialist: ${result.specialist}`, `Guidance: ${result.guidance}`, ``, `Disclaimer: This is not a diagnosis or prescription. Consult a qualified doctor.`].join("\n");
        const url = URL.createObjectURL(new Blob([report], { type: "text/plain" }));
        const link = document.createElement("a"); link.href = url; link.download = "symptom-report.txt"; link.click(); URL.revokeObjectURL(url);
    };

    const shareReport = async () => {
        const selectedValue = String(shareAppointmentId);
        if (!result || !selectedValue) return;
        try {
            setShareSaving(true);
            setShareMessage("");
            const reportPayload = {
                ...result,
                possible_conditions: result.possibleConditions,
                payment_method: "SSLCOMMERZ",
            };
            if (selectedValue.startsWith("doctor:")) {
                const selectedDoctorId = selectedValue.replace("doctor:", "");
                if (!recommendedDoctors.some((doctor) => String(doctor.id) === selectedDoctorId)) return;
                const paymentResponse = await createSSLCommerzAIReportPayment({
                    doctor: selectedDoctorId,
                    ...reportPayload,
                });
                window.location.assign(paymentResponse.data.gateway_url);
                return;
            }
            setShareMessage("BDT 100 paid. Report shared with your recommended doctor.");
        } catch (error) {
            const responseData = error?.response?.data;
            const message = responseData?.detail
                || (responseData && Object.values(responseData).flat().join(" "))
                || "Unable to complete the BDT 100 payment and share this report.";
            setShareMessage(message);
        } finally {
            setShareSaving(false);
        }
    };

    const legacyFeedbackPanelEnabled = false;

    const feedbackSection = (
        <section className="symptom-feedback-panel symptom-result-card">
            <button type="button" className="symptom-feedback-toggle symptom-history-item" onClick={() => setShowFeedback((visible) => !visible)} aria-expanded={showFeedback}>
                <span><FaStethoscope /> Doctor feedback</span>
                <small>{showFeedback ? "Hide doctor assessments" : "Click to view doctor assessments"}</small>
                <FaChevronRight />
            </button>
            {showFeedback && (sharedReportsLoading ? <p className="symptom-muted">Loading doctor feedback...</p> : sharedReports.length ? <div className="symptom-feedback-list">{sharedReports.map((report) => {
                const isExpanded = expandedFeedbackId === report.id;
                return <article key={report.id} className="symptom-feedback-card">
                    <button type="button" className="symptom-history-item" onClick={() => setExpandedFeedbackId(isExpanded ? null : report.id)} aria-expanded={isExpanded}>
                        <span>{report.doctor_name || "Your doctor"}</span>
                        <small>{report.ai_category || "AI symptom report"} · {new Date(report.updated_at || report.created_at).toLocaleDateString()}</small>
                        <FaChevronRight />
                    </button>
                    {isExpanded && <div className="symptom-feedback-details symptom-guidance"><small>Doctor assessment</small><p>{report.doctor_assessment || "Assessment pending"}</p>{report.doctor_assessment && <small>Last updated {new Date(report.updated_at || report.created_at).toLocaleString()}</small>}</div>}
                </article>;
            })}</div> : <p className="symptom-muted">Share a report with a recommended doctor to receive feedback here.</p>)}
        </section>
    );

    return (
        <main className={`symptom-page ${result?.recommendationAllowed ? "" : "symptom-page-unclear"}`}>
            <style>{`.symptom-page-unclear .symptom-result-card h3,.symptom-page-unclear .symptom-result-card .symptom-doctors,.symptom-page-unclear .symptom-result-card .symptom-share-box,.symptom-page-unclear .symptom-result-card .symptom-result-actions a{display:none}`}</style>
            <div className="symptom-shell">
                <Link className="symptom-back" to="/patient/dashboard"><FaArrowLeft /> Back to dashboard</Link>
                <header className="symptom-hero"><div><span>CARE NAVIGATOR</span><h1>AI Symptom Checker</h1><p>Describe what you are feeling and get a clear first step toward the right specialist.</p></div><FaHeartbeat /></header>
                <div className="symptom-layout">
                    <section className="symptom-form-card">
                        <div className="symptom-section-heading"><FaStethoscope /><div><h2>Tell us about your symptoms</h2><p>This is guidance, not a medical diagnosis.</p></div></div>
                        <form onSubmit={handleAnalyze}>
                            <label>Symptoms<textarea value={symptoms} onChange={(event) => setSymptoms(event.target.value)} placeholder="Example: itchy red rash on my arms" rows="5" required /></label>
                            <div className="symptom-fields"><label>How long?<select value={duration} onChange={(event) => setDuration(event.target.value)}><option>Less than 2 days</option><option>2 to 7 days</option><option>More than 1 week</option><option>More than 1 month</option></select></label><label>Severity<select value={severity} onChange={(event) => setSeverity(event.target.value)}><option>Mild</option><option>Moderate</option><option>Severe</option></select></label></div>
                            <button className="symptom-primary-button" type="submit" disabled={analyzing}>{analyzing ? "Analyzing with AI..." : "Analyze symptoms"} {!analyzing && <FaChevronRight />}</button>
                            {analysisError && <p className="symptom-error" role="alert">{analysisError}</p>}
                        </form>
                        <div className="symptom-safety"><FaShieldAlt /><span><strong>Safety first.</strong> For chest pain, trouble breathing, stroke signs, severe bleeding or loss of consciousness, contact emergency services immediately.</span></div>
                    </section>
                    <aside className="symptom-history-card"><div className="symptom-section-heading"><FaClock /><div><h2>Recent reports</h2><p>Your last 10 checks</p></div></div>{history.length ? history.slice(0, 4).map((item) => <button className="symptom-history-item" key={item.createdAt} onClick={() => setResult(item)}><span>{item.category}</span><small>{new Date(item.createdAt).toLocaleDateString()} · {item.urgency} urgency</small><FaChevronRight /></button>) : <p className="symptom-muted">Your symptom reports will appear here.</p>}</aside>
                </div>
                {result?.urgentWarning && <div className="symptom-safety symptom-urgent-result"><FaShieldAlt /><span><strong>Urgent care:</strong> These symptoms may need immediate medical attention. Contact emergency services or go to the nearest emergency department.</span></div>}
                {result?.followUpQuestion && <div className="symptom-follow-up"><FaStethoscope /><span><strong>More detail needed:</strong> {result.followUpQuestion}</span></div>}
                {result?.detectedSymptoms?.length > 0 && <div className="symptom-detected-patterns"><small>Detected patterns for discussion with a doctor</small><strong>{result.detectedSymptoms.join(", ")}</strong></div>}
                {legacyFeedbackPanelEnabled && <section className="symptom-feedback-panel symptom-result-card">
                    <div className="symptom-section-heading"><FaStethoscope /><div><h2>Doctor feedback</h2><p>Assessments saved by doctors for reports you shared.</p></div></div>
                    {sharedReportsLoading ? <p className="symptom-muted">Loading doctor feedback...</p> : sharedReports.length ? <div className="symptom-feedback-list symptom-doctors">{sharedReports.map((report) => <article key={report.id} className="symptom-feedback-card"><div><strong>{report.doctor_name || "Your doctor"}</strong><small>{report.ai_category || "AI symptom report"} · {new Date(report.updated_at || report.created_at).toLocaleDateString()}</small></div>{report.doctor_assessment ? <p>{report.doctor_assessment}</p> : <span className="symptom-feedback-pending">Assessment pending</span>}</article>)}</div> : <p className="symptom-muted">Share a report with a recommended doctor to receive feedback here.</p>}
                </section>}
                {result && <section className="symptom-result-card"><div className="symptom-result-heading"><div><span>YOUR GUIDANCE REPORT</span><h2>{result.category}</h2></div><strong className={`urgency-${result.urgency.toLowerCase()}`}>{result.urgency} urgency</strong></div><div className="symptom-result-grid"><div><small>Recommended specialist</small><strong>{result.specialist}</strong></div><div><small>Duration</small><strong>{result.duration}</strong></div><div><small>Severity</small><strong>{result.severity}</strong></div></div><p className="symptom-guidance">{result.guidance}</p><h3>Recommended doctors</h3><div className="symptom-doctors">{recommendedDoctors.length ? recommendedDoctors.map((doctor) => <article key={doctor.id}><div><strong>{doctor.doctor_name || "Doctor"}</strong><span>{doctor.specialization}</span></div><button onClick={() => navigate("/doctors")}><FaCalendarCheck /> View & book</button></article>) : <p className="symptom-muted">No matching doctor is available right now. Browse all doctors to find another specialist.</p>}</div><div className="symptom-share-box"><strong>Share this report with a recommended doctor</strong><p>Pay BDT 100 consultation fee to send this report and receive doctor feedback.</p><div><select value={shareAppointmentId} onChange={(event) => { setShareAppointmentId(event.target.value); setShareMessage(""); }}><option value="">Select a recommended doctor</option>{recommendedDoctors.map((doctor) => <option key={`doctor-${doctor.id}`} value={`doctor:${doctor.id}`}>{doctor.doctor_name || "Doctor"} · {doctor.specialization}</option>)}</select><button type="button" className="symptom-primary-button" onClick={shareReport} disabled={!shareAppointmentId || shareSaving}>{shareSaving ? "Processing payment..." : "Pay BDT 100 & share"}</button></div>{shareMessage && <small>{shareMessage}</small>}</div><div className="symptom-result-actions"><button className="symptom-secondary-button" onClick={downloadReport}><FaFileDownload /> Download report</button><Link className="symptom-primary-button" to="/doctors">Search all doctors <FaChevronRight /></Link></div><p className="symptom-disclaimer">AI guidance does not diagnose conditions or prescribe treatment. A qualified doctor must make the final decision.</p></section>}
                {feedbackSection}
            </div>
        </main>
    );
}
