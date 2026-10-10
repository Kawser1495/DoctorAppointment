import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getAppointmentDetails } from "../../services/appointmentService";
import { getAppointmentReports } from "../../services/reportService";
import AppointmentCard from "../../components/Cards/AppointmentCard";
import "./AppointmentDetails.css";

function AppointmentDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);

    const [loading, setLoading] = useState(true);

    const [reports, setReports] = useState([]);

    const [reportsLoading, setReportsLoading] = useState(true);

    useEffect(() => {

        const fetchAppointment = async () => {

            try {

                const response =
                    await getAppointmentDetails(id);

                const data =
                    response.data.data || response.data;

                setAppointment(data);

                const appointmentReports = await getAppointmentReports(id);
                setReports(appointmentReports);

            }

            catch (error) {

                console.error(error);

                alert("Failed to load appointment details.");

            }

            finally {

                setLoading(false);
                setReportsLoading(false);

            }

        };

        fetchAppointment();

    }, [id]);

    if (loading) {

        return <h2>Loading Appointment...</h2>;

    }

    if (!appointment) {

        return <h2>Appointment Not Found</h2>;

    }

    const medicalReports = reports.filter(
        (report) => report.report_type === "Medical"
    );
    const diagnosticReports = reports.filter(
        (report) => report.report_type === "Diagnostic"
    );

    const renderReport = (report) => (
        <article className="appointment-report-card" key={report.id}>
            <div className="appointment-report-card__heading">
                <div>
                    <strong>{report.report_title || "Clinical report"}</strong>
                    <small>{report.doctor_name || "Doctor"} · {new Date(report.uploaded_at).toLocaleDateString()}</small>
                </div>
                <span>{report.report_status}</span>
            </div>
            {report.report_type === "Medical" ? (
                <>
                    {report.medicines?.length > 0 && <div><small className="appointment-report-label">Medicines</small><p>{report.medicines.map((medicine) => medicine.name || medicine.medicine_name || JSON.stringify(medicine)).join(", ")}</p></div>}
                    {report.advice && <div><small className="appointment-report-label">Advice</small><p>{report.advice}</p></div>}
                    {report.prescription && <div><small className="appointment-report-label">Prescription</small><p>{report.prescription}</p></div>}
                </>
            ) : (
                <div><small className="appointment-report-label">Diagnostic result</small><p>{report.diagnostic_result || "Result not added yet."}</p></div>
            )}
            {report.report_file_url && <a className="appointment-report-link" href={report.report_file_url} target="_blank" rel="noreferrer">Open report file</a>}
        </article>
    );

    return (

        <div className="appointment-page">

            <AppointmentCard
                appointment={appointment}
            />

            <section className="appointment-reports-panel">
                <div className="appointment-reports-panel__heading">
                    <div><span>CLINICAL RECORDS</span><h2>Reports for this appointment</h2></div>
                    <small>Medical prescriptions and diagnostic results shared by your doctor.</small>
                </div>
                {reportsLoading ? <p className="appointment-reports-empty">Loading reports...</p> : (
                    <div className="appointment-report-columns">
                        <div><h3>Medical Report</h3>{medicalReports.length ? medicalReports.map(renderReport) : <p className="appointment-reports-empty">No medical report has been added.</p>}</div>
                        <div><h3>Diagnostic Report</h3>{diagnosticReports.length ? diagnosticReports.map(renderReport) : <p className="appointment-reports-empty">No diagnostic report has been added.</p>}</div>
                    </div>
                )}
            </section>

            {/* ==========================
                Payment Button
            ========================== */}

            {appointment.status === "Pending" && (

                <div
                    style={{
                        marginTop: "20px",
                        textAlign: "center",
                    }}
                >

                    <button
                        className="btn btn-success"
                        onClick={() =>
                            navigate("/payment", {
                                state: appointment,
                            })
                        }
                    >
                        Pay Now
                    </button>

                </div>

            )}

        </div>

    );

}

export default AppointmentDetails;