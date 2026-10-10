import {
    useRef,
    useState,
} from "react";


import {
    createMedicalReport,
} from "../../services/reportService";

import "./AddMedicalReport.css";
import "./AddMedicalReportPrint.css";

const FREQUENCY_OPTIONS = [
    "1 + 0 + 1",
    "1 + 1 + 1",
    "0 + 0 + 1",
];


export default function AddMedicalReport({

    appointmentId,

    appointment,

    onSuccess,

}) {


    const [

        reportTitle,

        setReportTitle,

    ] = useState(
        "Prescription"
    );

    const [reportMode, setReportMode] = useState("prescription");

    const [showPreview, setShowPreview] = useState(false);

    const [clinicalHistory, setClinicalHistory] = useState("");

    const [vitals, setVitals] = useState({
        blood_pressure: "",
        pulse: "",
        temperature: "",
        weight: "",
        oxygen_saturation: "",
    });

    const [diagnosticTests, setDiagnosticTests] = useState([
        { name: "", instructions: "", urgency: "Routine" },
    ]);

    const [diagnosticResult, setDiagnosticResult] = useState("");

    const [medicines, setMedicines] = useState([
        {
            name: "",
            dosage: "",
            frequency: "1 + 0 + 1",
            timing: "After Food",
            duration: "",
            instructions: "",
        },
    ]);


    const [

        prescription,

        setPrescription,

    ] = useState(
        ""
    );

    const [
        symptoms,
        setSymptoms,
    ] = useState("");

    const [
        advice,
        setAdvice,
    ] = useState("");

    const [
        followUpDate,
        setFollowUpDate,
    ] = useState("");


    const [

        remarks,

        setRemarks,

    ] = useState(
        ""
    );


    const [

        reportFile,

        setReportFile,

    ] = useState(
        null
    );


    const [

        loading,

        setLoading,

    ] = useState(
        false
    );


    const [

        error,

        setError,

    ] = useState(
        ""
    );


    const fileInputRef =
        useRef(
            null
        );

    const updateMedicine = (index, field, value) => {
        setMedicines((current) => current.map((medicine, medicineIndex) => (
            medicineIndex === index
                ? { ...medicine, [field]: value }
                : medicine
        )));
    };

    const addMedicine = () => {
        setMedicines((current) => ([
            ...current,
            {
                name: "",
                dosage: "",
                frequency: "1 + 0 + 1",
                timing: "After Food",
                duration: "",
                instructions: "",
            },
        ]));
    };

    const updateVital = (field, value) => {
        setVitals((current) => ({ ...current, [field]: value }));
    };

    const updateDiagnosticTest = (index, field, value) => {
        setDiagnosticTests((current) => current.map((test, testIndex) => (
            testIndex === index ? { ...test, [field]: value } : test
        )));
    };

    const addDiagnosticTest = () => {
        setDiagnosticTests((current) => ([
            ...current,
            { name: "", instructions: "", urgency: "Routine" },
        ]));
    };

    const removeDiagnosticTest = (index) => {
        setDiagnosticTests((current) => current.length === 1
            ? current
            : current.filter((_, testIndex) => testIndex !== index));
    };

    const removeMedicine = (index) => {
        setMedicines((current) => current.length === 1
            ? current
            : current.filter((_, medicineIndex) => medicineIndex !== index));
    };


    // ======================================================
    // Error Message
    // ======================================================

    const getErrorMessage =
        (
            errorData
        ) => {

            if (!errorData) {

                return (
                    "Unable to create medical report."
                );

            }


            if (

                typeof errorData
                ===
                "string"

            ) {

                return (
                    errorData
                );

            }


            if (

                errorData.detail

            ) {

                return (
                    errorData.detail
                );

            }


            if (

                typeof errorData
                ===
                "object"

            ) {

                return Object.entries(

                    errorData

                )

                    .map(

                        (

                            [
                                field,
                                messages,
                            ]

                        ) => {

                            const message =

                                Array.isArray(
                                    messages
                                )

                                    ?

                                    messages.join(
                                        ", "
                                    )

                                    :

                                    String(
                                        messages
                                    );


                            return (

                                `${field}: ${message}`

                            );

                        }

                    )

                    .join(
                        " | "
                    );

            }


            return (
                "Unable to create medical report."
            );

        };


    // ======================================================
    // Submit
    // ======================================================

    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();


            if (

                !appointmentId

            ) {

                setError(

                    "Appointment ID is missing."

                );

                return;

            }


            if (

                !reportTitle.trim()

            ) {

                setError(

                    "Report title is required."

                );

                return;

            }



                const hasReportFile = Boolean(reportFile);
                const completedMedicines = medicines.filter((medicine) => medicine.name.trim());
                const completedDiagnosticTests = diagnosticTests.filter((test) => test.name.trim());

                if (!hasReportFile && reportMode === "prescription" && medicines.some((medicine) => !medicine.name.trim())) {
                    setError("Add a medicine name for every medicine row, or remove the empty row.");
                    return;
                }

                if (!hasReportFile && reportMode === "prescription" && medicines.some((medicine) => !medicine.frequency.trim())) {
                    setError("Enter a custom frequency for every medicine row.");
                    return;
                }

                if (!hasReportFile && reportMode === "diagnostic" && diagnosticTests.some((test) => !test.name.trim())) {
                    setError("Add a diagnostic test name for every test row, or remove the empty row.");
                    return;
                }

                if (!reportTitle.trim()) {
                    setError("Write a title for this prescription or diagnostic report.");
                    return;
                }
            try {

                setLoading(
                    true
                );


                setError(
                    ""
                );


                const formData =
                    new FormData();


                // --------------------------------------------------
                // Report Type
                // --------------------------------------------------

                formData.append(
                    "report_type",
                    reportMode === "diagnostic" ? "Diagnostic" : "Medical"
                );


                // --------------------------------------------------
                // Report Title
                // --------------------------------------------------

                formData.append(

                    "report_title",

                    reportTitle.trim()

                );


                // --------------------------------------------------
                // Appointment
                // --------------------------------------------------

                formData.append(

                    "appointment",

                    String(
                        appointmentId
                    )

                );


                // --------------------------------------------------
                // Prescription
                // --------------------------------------------------

                if (

                    prescription.trim()

                ) {

                    formData.append(

                        "prescription",

                        prescription.trim()

                    );

                }

                if (symptoms.trim()) {
                    formData.append("symptoms", symptoms.trim());
                }

                formData.append("clinical_history", clinicalHistory.trim());
                formData.append("vitals", JSON.stringify(vitals));

                if (diagnosticResult.trim()) {
                    formData.append("diagnostic_result", diagnosticResult.trim());
                }

                if (advice.trim()) {
                    formData.append("advice", advice.trim());
                }

                if (followUpDate) {
                    formData.append("follow_up_date", followUpDate);
                }

                if (reportMode === "prescription") {
                    formData.append(
                        "medicines",
                        JSON.stringify(completedMedicines.map((medicine) => ({
                            ...medicine,
                            name: medicine.name.trim(),
                        })))
                    );
                }

                if (reportMode === "diagnostic") {
                    formData.append(
                        "diagnostic_tests",
                        JSON.stringify(completedDiagnosticTests.map((test) => ({
                            ...test,
                            name: test.name.trim(),
                            instructions: test.instructions.trim(),
                        })))
                    );
                }


                // --------------------------------------------------
                // Remarks
                // --------------------------------------------------

                if (

                    remarks.trim()

                ) {

                    formData.append(

                        "remarks",

                        remarks.trim()

                    );

                }


                // --------------------------------------------------
                // File
                // --------------------------------------------------

                if (

                    reportFile

                ) {

                    formData.append(

                        "report_file",

                        reportFile

                    );

                }


                // --------------------------------------------------
                // Debug
                // --------------------------------------------------

                console.log(

                    "Creating report for appointment:",

                    appointmentId

                );


                const response =

                    await createMedicalReport(

                        formData

                    );


                console.log(

                    "Create Report Response:",

                    response?.data

                );


                const newReport =

                    response?.data?.data

                    ||

                    response?.data;


                alert(
                    `${reportMode === "diagnostic" ? "Diagnostic report" : reportMode === "prescription" ? "Prescription" : "Medical report"} saved successfully.`
                );


                // --------------------------------------------------
                // Parent Callback
                // --------------------------------------------------

                if (

                    onSuccess

                ) {

                    await onSuccess(

                        newReport

                    );
                }


                // --------------------------------------------------
                // Reset
                // --------------------------------------------------

                setReportTitle(

                    "Prescription"

                );

                setReportMode("prescription");
                setDiagnosticResult("");
                setClinicalHistory("");
                setVitals({ blood_pressure: "", pulse: "", temperature: "", weight: "", oxygen_saturation: "" });
                setDiagnosticTests([{ name: "", instructions: "", urgency: "Routine" }]);
                setMedicines([{
                    name: "",
                    dosage: "",
                    frequency: "1 + 0 + 1",
                    timing: "After Food",
                    duration: "",
                    instructions: "",
                }]);


                setPrescription(
                    ""
                );

                setSymptoms("");
                setAdvice("");
                setFollowUpDate("");


                setRemarks(
                    ""
                );


                setReportFile(
                    null
                );


                if (

                    fileInputRef.current

                ) {

                    fileInputRef.current.value =
                        "";

                }


            }

            catch (

                err

            ) {

                console.error(

                    "Create medical report error:",

                    err?.response?.data

                    ||

                    err

                );


                setError(

                    getErrorMessage(

                        err?.response?.data

                    )

                );

            }

            finally {

                setLoading(
                    false
                );

            }

        };


    return (

        <div className="card border-0 shadow-sm mt-4">

            <div className="card-body p-4">


                <h4 className="mb-1">

                    🩺 Create Clinical Record

                </h4>


                <p className="text-muted mb-4">

                    Prepare a professional prescription or diagnostic test advice for this appointment.

                </p>


                {

                    error && (

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    )

                }


                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Record Type</label>
                        <select
                            className="form-select"
                            value={reportMode}
                            onChange={(event) => {
                                const mode = event.target.value;
                                setReportMode(mode);
                            }}
                        >
                            <option value="prescription">Medical Prescription</option>
                            <option value="diagnostic">Diagnostic Test Advice / Report</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold" htmlFor="clinical-report-title">Report Title</label>
                        <input
                            id="clinical-report-title"
                            className="form-control"
                            value={reportTitle}
                            onChange={(event) => setReportTitle(event.target.value)}
                            placeholder={reportMode === "diagnostic" ? "e.g. CBC Test Advice" : "e.g. Fever Prescription"}
                            maxLength={150}
                            required
                        />
                        <div className="form-text">This title will be shown to the patient in their reports.</div>
                    </div>

                    <div className="add-report-patient-header">
                        <div><span>Patient</span><strong>{appointment?.family_member_details?.name || appointment?.patient_profile?.full_name || appointment?.patient_name || "N/A"}</strong></div>
                        <div><span>Age / Gender</span><strong>{appointment?.family_member_details?.age || appointment?.patient_profile?.age || "N/A"} / {appointment?.family_member_details?.gender || appointment?.patient_profile?.gender || "N/A"}</strong></div>
                        <div><span>Appointment No.</span><strong>{appointment?.booking_number || appointmentId}</strong></div>
                        <div><span>Date</span><strong>{appointment?.appointment_date || new Date().toISOString().slice(0, 10)}</strong></div>
                    </div>

                    {reportMode === "prescription" && (
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Chief Complaints / Symptoms</label>
                                <textarea className="form-control" rows="3" value={symptoms} onChange={(event) => setSymptoms(event.target.value)} placeholder="Fever, headache, cough..." />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Clinical Diagnosis / History</label>
                                <textarea className="form-control" rows="3" value={clinicalHistory} onChange={(event) => setClinicalHistory(event.target.value)} placeholder="Clinical findings and relevant history..." />
                            </div>
                        </div>
                    )}

                    {reportMode === "prescription" && (
                        <div className="add-report-vitals mb-3">
                            <label className="form-label fw-semibold">Vital Signs</label>
                            <div className="row g-2">
                                {[
                                    ["blood_pressure", "BP", "120/80 mmHg"],
                                    ["pulse", "Pulse", "72 bpm"],
                                    ["temperature", "Temperature", "98.6 F"],
                                    ["weight", "Weight", "65 kg"],
                                    ["oxygen_saturation", "SpO2", "98%"],
                                ].map(([field, label, placeholder]) => (
                                    <div className="col-sm" key={field}>
                                        <input className="form-control form-control-sm" value={vitals[field]} onChange={(event) => updateVital(field, event.target.value)} placeholder={`${label}: ${placeholder}`} aria-label={label} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {reportMode === "diagnostic" && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Diagnostic Tests Required</label>
                            <div className="add-report-test-list">
                                {diagnosticTests.map((test, index) => (
                                    <div className="add-report-test-row" key={`test-${index}`}>
                                        <input className="form-control" value={test.name} placeholder="e.g. CBC, ECG, Chest X-Ray" onChange={(event) => updateDiagnosticTest(index, "name", event.target.value)} />
                                        <input className="form-control" value={test.instructions} placeholder="Instructions / preparation" onChange={(event) => updateDiagnosticTest(index, "instructions", event.target.value)} />
                                        <select className="form-select" value={test.urgency} onChange={(event) => updateDiagnosticTest(index, "urgency", event.target.value)}><option>Routine</option><option>Urgent</option><option>Fasting</option></select>
                                        <button type="button" className="btn btn-outline-danger" onClick={() => removeDiagnosticTest(index)} disabled={diagnosticTests.length === 1}>×</button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={addDiagnosticTest}>+ Add diagnostic test</button>
                            <label className="form-label fw-semibold mt-3">Clinical Notes / Result</label>
                            <textarea
                                className="form-control"
                                rows="5"
                                placeholder="Write clinical indication, interpretation, or findings..."
                                value={diagnosticResult}
                                onChange={(event) => setDiagnosticResult(event.target.value)}
                            />
                        </div>
                    )}

                    {reportMode === "prescription" && (
                        <div className="mb-4 rounded border p-3 bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <label className="form-label fw-semibold mb-0">Medication Plan</label>
                                    <div className="text-muted small">Add medicines for this appointment patient.</div>
                                </div>
                                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addMedicine}>Add medicine</button>
                            </div>
                            {medicines.map((medicine, index) => (
                                <div className="row g-2 align-items-end mb-2" key={`medicine-${index}`}>
                                    <div className="col-lg-3">
                                        <label className="form-label small">Medicine name</label>
                                        <input className="form-control form-control-sm" value={medicine.name} placeholder="e.g. Paracetamol" onChange={(event) => updateMedicine(index, "name", event.target.value)} />
                                    </div>
                                    <div className="col-lg-2">
                                        <label className="form-label small">Dosage</label>
                                        <input className="form-control form-control-sm" value={medicine.dosage} placeholder="500mg" onChange={(event) => updateMedicine(index, "dosage", event.target.value)} />
                                    </div>
                                    <div className="col-lg-2">
                                        <label className="form-label small">Frequency</label>
                                        <select className="form-select form-select-sm" value={FREQUENCY_OPTIONS.includes(medicine.frequency) ? medicine.frequency : "Customize"} onChange={(event) => updateMedicine(index, "frequency", event.target.value === "Customize" ? "" : event.target.value)}>
                                            {FREQUENCY_OPTIONS.map((frequency) => <option key={frequency}>{frequency}</option>)}
                                            <option value="Customize">Customize</option>
                                        </select>
                                        {!FREQUENCY_OPTIONS.includes(medicine.frequency) && <input className="form-control form-control-sm mt-2" value={medicine.frequency} onChange={(event) => updateMedicine(index, "frequency", event.target.value)} placeholder="e.g. 1 + 1 + 0" aria-label="Custom frequency" />}
                                    </div>
                                    <div className="col-lg-2">
                                        <label className="form-label small">Timing</label>
                                        <select className="form-select form-select-sm" value={medicine.timing} onChange={(event) => updateMedicine(index, "timing", event.target.value)}>
                                            <option>After Food</option><option>Before Food</option><option>With Food</option><option>Any time</option>
                                        </select>
                                    </div>
                                    <div className="col-lg-2">
                                        <label className="form-label small">Duration</label>
                                        <input className="form-control form-control-sm" value={medicine.duration} placeholder="5 days" onChange={(event) => updateMedicine(index, "duration", event.target.value)} />
                                    </div>
                                    <div className="col-lg-1">
                                        <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => removeMedicine(index)} disabled={medicines.length === 1} aria-label={`Remove medicine ${index + 1}`}>×</button>
                                    </div>
                                    <div className="col-12">
                                        <input className="form-control form-control-sm" value={medicine.instructions} placeholder="Instructions, e.g. drink water" onChange={(event) => updateMedicine(index, "instructions", event.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}


                    {reportMode === "prescription" && (
                        <div className="row g-3 mb-4">
                            <div className="col-md-8">
                                <label className="form-label fw-semibold">Advice</label>
                                <textarea className="form-control" rows="3" placeholder="Rest, hydration, lifestyle advice..." value={advice} onChange={(event) => setAdvice(event.target.value)} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Follow-up date</label>
                                <input type="date" className="form-control" min={new Date().toISOString().slice(0, 10)} value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="form-label fw-semibold">Attach report file (optional)</label>
                        <input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setReportFile(event.target.files?.[0] || null)} />
                        <small className="text-muted">Upload a prescription, diagnostic result, or supporting medical document.</small>
                    </div>


                    <div className="add-report-actions">
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowPreview(true)}>
                            <i className="fas fa-eye me-2" />Live Preview
                        </button>
                        <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                            {loading ? "Saving..." : reportMode === "diagnostic" ? "Save Diagnostic Advice" : "Save Prescription"}
                        </button>
                    </div>

                </form>

                {showPreview && (
                    <div className="add-report-preview-backdrop" role="dialog" aria-modal="true" aria-label="Medical record preview">
                        <div className="add-report-preview-toolbar">
                            <strong>Clinical Record Preview</strong>
                            <div><button type="button" className="btn btn-light btn-sm me-2" onClick={() => window.print()}>Print</button><button type="button" className="btn btn-outline-light btn-sm" onClick={() => setShowPreview(false)}>Close</button></div>
                        </div>
                        <article className="add-report-a4-sheet">
                            <header className="add-report-a4-header">
                                <div><h2>{appointment?.doctor_profile?.clinic_name || "MediCare Connect Clinic"}</h2><p>{appointment?.doctor_profile?.department || "Specialist Clinic"}</p></div>
                                <div className="text-end"><strong>{appointment?.doctor_profile?.name || "Dr. Attending Physician"}</strong><p>{appointment?.doctor_profile?.qualification || "Medical Consultant"}<br />{appointment?.doctor_profile?.designation || "Consultant"}</p></div>
                            </header>
                            <div className="add-report-a4-contact">Phone: {appointment?.doctor_profile?.phone || "N/A"} | Email: {appointment?.doctor_profile?.email || "N/A"} | Reg. No: {appointment?.doctor_profile?.registration_no || "N/A"}</div>
                            <div className="add-report-a4-patient"><div><b>Patient:</b> {appointment?.family_member_details?.name || appointment?.patient_profile?.full_name || appointment?.patient_name || "N/A"}</div><div><b>Age/Gender:</b> {appointment?.family_member_details?.age || appointment?.patient_profile?.age || "N/A"} / {appointment?.family_member_details?.gender || appointment?.patient_profile?.gender || "N/A"}</div><div><b>Date:</b> {appointment?.appointment_date || new Date().toISOString().slice(0, 10)}</div><div><b>OPD No:</b> {appointment?.booking_number || appointmentId}</div></div>
                            {reportMode === "prescription" ? (
                                <div className="add-report-a4-content"><aside><h4>Clinical Notes</h4><b>Complaints</b><p>{symptoms || "Not provided"}</p><b>History / Diagnosis</b><p>{clinicalHistory || "Not provided"}</p><b>Vitals</b><p>{Object.entries(vitals).filter(([, value]) => value).map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`).join(" | ") || "Not recorded"}</p></aside><main><div className="add-report-rx">Rx</div>{medicines.filter((medicine) => medicine.name.trim()).map((medicine, index) => <div className="add-report-a4-medicine" key={`${medicine.name}-${index}`}><strong>{index + 1}. {medicine.name}</strong><span>{medicine.dosage} | {medicine.frequency} | {medicine.timing} | {medicine.duration}</span><small>{medicine.instructions}</small></div>)}<h4>Advice</h4><p>{advice || "As directed by physician."}</p>{followUpDate && <p><b>Follow-up:</b> {followUpDate}</p>}</main></div>
                            ) : (
                                <div className="add-report-a4-diagnostic"><h3>Laboratory & Radiology Advice</h3><p>{diagnosticResult || "Investigations requested for clinical evaluation."}</p>{diagnosticTests.filter((test) => test.name.trim()).map((test, index) => <div className="add-report-a4-test" key={`${test.name}-${index}`}><strong>{index + 1}. {test.name}</strong><span>{test.urgency}{test.instructions ? ` | ${test.instructions}` : ""}</span></div>)}</div>
                            )}
                            <footer className="add-report-a4-footer"><div>Valid for 30 days<br />Powered by MediCare</div><div className="add-report-signature">Doctor's Signature<br /><strong>{appointment?.doctor_profile?.name || "Attending Doctor"}</strong></div></footer>
                        </article>
                    </div>
                )}

            </div>

        </div>

    );

}