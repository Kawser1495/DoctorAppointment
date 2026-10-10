import { useEffect, useState } from "react";

import {
    getAdminPayments,
    deleteAdminPayment,
    getRefundRequests,
    refundPayment,
    updatePaymentStatus,
    updateDiagnosticReportInfo,
    updateRefundRequest,
} from "../../services/paymentService";
import "./AdminPayments.css";

const getPaymentDateKey = (paymentDate) => {
    if (!paymentDate) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(paymentDate)) return paymentDate.slice(0, 10);
    const date = new Date(paymentDate);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getTodayDateKey = () => getPaymentDateKey(new Date().toISOString());

function PaymentTable({ payments, handleStatusChange, handleView, handleDelete, handleRefund, diagnostic = false, allRecords = false }) {
    if (payments.length === 0) {
        return <div className="alert alert-info mb-0">No payments found in this section.</div>;
    }

    return <div className="admin-payment-table-wrap">
        <table className="admin-payment-table">
            <thead>{allRecords ? <tr><th>Patient</th><th>Booked for</th><th>Payment ID</th><th>Type</th><th>Booking</th><th>Doctor</th><th>Payment mode</th><th>Amount</th><th>Due</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr> : diagnostic ? <tr><th>Patient</th><th>Booked for</th><th>Payment ID</th><th>Diagnostic test</th><th>Payment mode</th><th>Paid amount</th><th>Due</th><th>Method</th><th>Status</th><th>Refund</th><th>Date</th><th>Actions</th></tr> : <tr><th>Patient</th><th>Booked for</th><th>Payment ID</th><th>Booking</th><th>Doctor</th><th>Payment type</th><th>Paid amount</th><th>Due</th><th>Method</th><th>Status</th><th>Refund</th><th>Date</th><th>Actions</th></tr>}</thead>
            <tbody>
                {payments.map((payment) => (
                    <tr key={payment.id}>
                        {allRecords ? <><td>{payment.patient_name || "N/A"}</td><td>{payment.booking_person_name || payment.patient_name || "N/A"}</td><td><strong>#{payment.id}</strong></td><td>{payment.payment_type || (payment.test_booking ? "Diagnostic Test" : "Doctor Appointment")}</td><td>{payment.appointment_booking || payment.diagnostic_booking_number || "N/A"}</td><td>{payment.doctor_name || "Diagnostic booking"}</td><td>{payment.payment_mode || "N/A"}</td><td><strong className="text-success">৳ {payment.net_amount ?? payment.amount}</strong></td><td className={Number(payment.remaining_amount || 0) > 0 ? "text-danger" : "text-success"}>৳ {payment.remaining_amount ?? "0"}</td><td>{payment.payment_method || "N/A"}</td><td><span className="badge bg-secondary">{payment.payment_status}</span></td><td>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "N/A"}</td></> : diagnostic ? <><td>{payment.patient_name || "N/A"}</td><td>{payment.booking_person_name || payment.patient_name || "N/A"}</td><td><strong>#{payment.id}</strong></td><td>{payment.diagnostic_test_name || "Diagnostic Test"}</td><td>{payment.payment_mode || "N/A"}</td><td><strong className="text-success">৳ {payment.net_amount ?? payment.amount}</strong></td><td className={Number(payment.remaining_amount || 0) > 0 ? "text-danger" : "text-success"}>৳ {payment.remaining_amount ?? "0"}</td><td>{payment.payment_method || "N/A"}</td><td><span className="badge bg-secondary">{payment.payment_status}</span></td><td>{payment.payment_status === "Refunded" ? `Refunded ৳${payment.refund_amount || 0}` : payment.is_refundable ? "Refund Eligible" : "Non-Refundable"}</td><td>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "N/A"}</td></> : <><td>{payment.patient_name || "N/A"}</td><td>{payment.booking_person_name || payment.patient_name || "N/A"}</td><td><strong>#{payment.id}</strong></td><td>{payment.appointment_booking || "N/A"}</td><td>{payment.doctor_name || "N/A"}</td><td>{payment.payment_mode || "N/A"}</td><td><strong className="text-success">৳ {payment.net_amount ?? payment.amount}</strong></td><td className={Number(payment.remaining_amount || 0) > 0 ? "text-danger" : "text-success"}>৳ {payment.remaining_amount ?? "0"}</td><td>{payment.payment_method || "N/A"}</td><td><span className="badge bg-secondary">{payment.payment_status}</span></td><td>{payment.payment_status === "Refunded" ? `Refunded ৳${payment.refund_amount || 0}` : payment.is_refundable ? "Refund Eligible" : "Non-Refundable"}</td><td>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "N/A"}</td></>}
                        <td className="admin-payment-actions">
                            <button type="button" className="admin-payment-button view" onClick={() => handleView(payment)}>View</button>
                            <select className="admin-payment-status-select" value={payment.payment_status} onChange={(event) => handleStatusChange(payment.id, event.target.value)}>
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Partially Paid">Partially Paid</option>
                                <option value="Failed">Failed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Refunded">Refunded</option>
                            </select>
                            {payment.payment_status === "Paid" && payment.payment_mode === "Full" && payment.is_refundable && <button type="button" className="admin-payment-button refund" onClick={() => handleRefund(payment)}>Refund</button>}
                            <button type="button" className="admin-payment-button delete" onClick={() => handleDelete(payment)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>;
}

function RecentPaymentRecords({ title, description, payments, getSuccessfulAmount, handleStatusChange, handleView, handleDelete }) {
    return <div className="admin-recent-payment-column">
        <div className="admin-recent-payment-heading">
            <div>
                <h5>{title}</h5>
                <p>{description}</p>
            </div>
            <span>{payments.length} records</span>
        </div>
        {payments.length === 0 ? <p className="admin-recent-payment-empty">No payment records found for this period.</p> : <div className="admin-recent-payment-table-wrap">
            <table className="admin-recent-payment-table">
                <thead><tr><th>Patient</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{payments.map((payment) => <tr key={payment.id}>
                    <td><strong>{payment.patient_name || payment.booking_person_name || "N/A"}</strong><small>{payment.payment_type || (payment.test_booking ? "Diagnostic Test" : "Doctor Appointment")}</small></td>
                    <td>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "N/A"}</td>
                    <td>৳ {getSuccessfulAmount(payment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td><span className="admin-recent-payment-status">{payment.payment_status}</span></td>
                    <td><div className="admin-recent-payment-actions">
                        <button type="button" className="admin-payment-button view" onClick={() => handleView(payment)}>View</button>
                        <select className="admin-payment-status-select" value={payment.payment_status} onChange={(event) => handleStatusChange(payment.id, event.target.value)} aria-label={`Update payment status for ${payment.patient_name || "patient"}`}>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Failed">Failed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Refunded">Refunded</option>
                        </select>
                        <button type="button" className="admin-payment-button delete" onClick={() => handleDelete(payment)}>Delete</button>
                    </div></td>
                </tr>)}</tbody>
            </table>
        </div>}
    </div>;
}

function AdminPayments() {

    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [refundRequests, setRefundRequests] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedMode, setSelectedMode] = useState("all");
    const [selectedPaymentPeriod, setSelectedPaymentPeriod] = useState("all");
    const [paymentSearch, setPaymentSearch] = useState("");
    const [paymentDateFilter, setPaymentDateFilter] = useState("");
    const [reportForm, setReportForm] = useState({ report_available_at: "", report_available_note: "" });


    // ==========================================================
    // Load All Payments
    // ==========================================================

    const loadPayments = async () => {

        try {

            setLoading(true);

            setError("");

            const [response, refundResponse] = await Promise.all([
                getAdminPayments(),
                getRefundRequests(),
            ]);

            const data =
                response.data.results ||
                response.data.data ||
                response.data;

            setPayments(data || []);
            const refundData = refundResponse.data?.results || refundResponse.data?.data || refundResponse.data || [];
            setRefundRequests(Array.isArray(refundData) ? refundData : []);

        }

        catch (error) {

            console.error(error);

            if (error.response?.status === 403) {

                setError(
                    "Admin access required."
                );

            }

            else {

                setError(
                    "Failed to load payments."
                );

            }

        }

        finally {

            setLoading(false);

        }

    };

    const handleRefundDecision = async (refundRequest, refundStatus) => {
        try {
            await updateRefundRequest(refundRequest.id, refundStatus, refundStatus === "Rejected" ? "Refund request rejected by admin." : "");
            setRefundRequests((current) => current.map((item) => item.id === refundRequest.id
                ? { ...item, refund_status: refundStatus === "Approved" ? "Completed" : refundStatus }
                : item));
        } catch (decisionError) {
            alert(decisionError.response?.data?.detail || "Unable to process refund request.");
        }
    };


    // ==========================================================
    // Load Payments on Page Load
    // ==========================================================

    useEffect(() => {

        loadPayments();

    }, []);

    const openPayment = (payment) => {
        setSelectedPayment(payment);
        setReportForm({
            report_available_at: payment.report_available_at ? new Date(payment.report_available_at).toISOString().slice(0, 16) : "",
            report_available_note: payment.report_available_note || "",
        });
    };

    const saveReportInfo = async () => {
        if (!selectedPayment?.test_booking) return;
        try {
            const response = await updateDiagnosticReportInfo(selectedPayment.id, reportForm);
            setPayments((current) => current.map((item) => item.id === selectedPayment.id ? { ...item, ...response.data } : item));
            setSelectedPayment((current) => ({ ...current, ...response.data }));
            alert("Report availability information saved.");
        } catch (saveError) {
            alert(saveError.response?.data?.detail || saveError.response?.data?.report_available_at || "Unable to save report information.");
        }
    };


    // ==========================================================
    // Update Payment Status
    // ==========================================================

    const handleStatusChange = async (
        paymentId,
        newStatus
    ) => {

        try {

            await updatePaymentStatus(
                paymentId,
                newStatus
            );

            // Update UI immediately
            setPayments(
                (previousPayments) =>
                    previousPayments.map(
                        (payment) =>
                            payment.id === paymentId
                                ? {
                                    ...payment,
                                    payment_status:
                                        newStatus,
                                }
                                : payment
                    )
            );

            alert(
                "Payment status updated successfully."
            );

        }

        catch (error) {

            console.error(error);

            if (error.response?.status === 403) {

                alert(
                    "Admin access required."
                );

            }

            else {

                alert(
                    "Failed to update payment status."
                );

            }

        }

    };

    const handleDelete = async (payment) => {
        if (!window.confirm(`Delete payment transaction ${payment.transaction_id || payment.id}?`)) return;
        try {
            await deleteAdminPayment(payment.id);
            setPayments((current) => current.filter((item) => item.id !== payment.id));
            setSelectedPayment(null);
        } catch (deleteError) {
            alert(deleteError.response?.data?.detail || "Failed to delete payment.");
        }
    };

    const handleRefund = async (payment) => {
        if (!window.confirm(`Refund 80% of ৳${payment.amount} for ${payment.patient_name || "this patient"}?`)) return;
        try {
            await refundPayment(payment.id);
            setPayments((current) => current.map((item) => item.id === payment.id
                ? { ...item, payment_status: "Refunded", can_request_refund: false }
                : item));
        } catch (refundError) {
            alert(refundError.response?.data?.message || refundError.response?.data?.detail || "Unable to refund this payment.");
        }
    };

    const doctorNames = [...new Set(payments.filter((payment) => payment.payment_type === "Appointment" || !payment.test_booking).map((payment) => payment.doctor_name).filter(Boolean))].sort();
    const filteredPayments = payments.filter((payment) => {
        const matchesStatus = selectedStatus === "all" || payment.payment_status === selectedStatus;
        const matchesMode = selectedMode === "all" || payment.payment_mode === selectedMode;
        const matchesDoctor = selectedDoctor === "all" || payment.doctor_name === selectedDoctor;
        return matchesStatus && matchesMode && matchesDoctor;
    });
    const activePayments = filteredPayments.filter((payment) => !["Cancelled", "Failed"].includes(payment.payment_status));
    const appointmentPayments = activePayments.filter((payment) => payment.payment_type === "Appointment" || !payment.test_booking);
    const diagnosticPayments = activePayments.filter((payment) => payment.payment_type === "Diagnostic Test" || payment.test_booking);
    const paymentSummary = {
        total: payments.filter((payment) => !["Cancelled", "Failed"].includes(payment.payment_status)).length,
        paid: payments.filter((payment) => payment.payment_status === "Paid").length,
        pending: payments.filter((payment) => payment.payment_status === "Pending").length,
            refunded: payments.filter((payment) => payment.payment_status === "Refunded").length,
        cancelled: payments.filter((payment) => payment.payment_status === "Cancelled").length,
        refundable: payments.filter((payment) => payment.payment_status === "Paid" && payment.is_refundable).length,
    };
    const getSuccessfulAmount = (payment) => {
        if (!["Paid", "Partially Paid", "Refunded"].includes(payment.payment_status)) return 0;
        return Number(payment.net_amount ?? payment.amount ?? 0);
    };
    const todayDateKey = getTodayDateKey();
    const firstDateOfLastSevenDays = new Date();
    firstDateOfLastSevenDays.setHours(0, 0, 0, 0);
    firstDateOfLastSevenDays.setDate(firstDateOfLastSevenDays.getDate() - 6);
    const firstDateKey = getPaymentDateKey(firstDateOfLastSevenDays.toISOString());
    const recentPayments = payments.filter((payment) => {
        const paymentDateKey = getPaymentDateKey(payment.payment_date);
        return !["Cancelled", "Failed"].includes(payment.payment_status) && paymentDateKey >= firstDateKey && paymentDateKey <= todayDateKey;
    });
    const todayPayments = recentPayments.filter((payment) => getPaymentDateKey(payment.payment_date) === todayDateKey);
    const filterRecentPayments = (records) => records.filter((payment) => {
        const query = paymentSearch.trim().toLowerCase();
        const matchesSearch = !query || [payment.patient_name, payment.booking_person_name, payment.booking_number, payment.transaction_id, payment.payment_type].some((value) => String(value || "").toLowerCase().includes(query));
        const matchesDate = !paymentDateFilter || getPaymentDateKey(payment.payment_date) === paymentDateFilter;
        return matchesSearch && matchesDate;
    });
    const filteredTodayPayments = filterRecentPayments(todayPayments);
    const filteredRecentPayments = filterRecentPayments(recentPayments);
    const periodFilteredPayments = selectedPaymentPeriod === "today" ? filteredTodayPayments : filteredRecentPayments;
    const paymentPeriodSummary = [
        {
            label: "Today's payments",
            count: todayPayments.length,
            amount: todayPayments.reduce((sum, payment) => sum + getSuccessfulAmount(payment), 0),
        },
        {
            label: "Last 7 days",
            count: recentPayments.length,
            amount: recentPayments.reduce((sum, payment) => sum + getSuccessfulAmount(payment), 0),
        },
    ];
    const diagnosticPaidAmount = diagnosticPayments.reduce(
        (sum, payment) => sum + getSuccessfulAmount(payment),
        0
    );
    const appointmentPaidAmount = appointmentPayments.reduce(
        (sum, payment) => sum + getSuccessfulAmount(payment),
        0
    );


    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (

            <div className="admin-payment-page admin-payment-state">

                <h3>
                    Loading Payments...
                </h3>

            </div>

        );

    }


    // ==========================================================
    // Error
    // ==========================================================

    if (error) {

        return (

            <div className="admin-payment-page admin-payment-state">

                <div className="alert alert-danger">

                    {error}

                </div>

            </div>

        );

    }


    // ==========================================================
    // UI
    // ==========================================================

    return (

        <div className="admin-payment-page">

            <div className="admin-payment-header">
                <div className="admin-payment-heading-row">
                    <div>
                        <span className="admin-payment-eyebrow">ALL PATIENTS / FINANCIAL RECORDS</span>
                        <h1>Payment History</h1>
                        <p>Manage patient payment transactions and update payment status.</p>
                    </div>
                    <div className="admin-payment-period-summary" aria-label="Recent payment summary">
                        {paymentPeriodSummary.map((period) => <div className="admin-payment-period-card" key={period.label}>
                            <span>{period.label}</span>
                            <strong>{period.count}</strong>
                            <small>৳ {period.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</small>
                        </div>)}
                    </div>
                </div>
            </div>

            <div className="admin-payment-summary row g-3 mb-4">
                 {[["All payments", paymentSummary.total, "primary"], ["Paid", paymentSummary.paid, "success"], ["Pending", paymentSummary.pending, "warning"], ["Refunded", paymentSummary.refunded, "danger"], ["Refundable (Paid subset)", paymentSummary.refundable, "info"]].map(([label, value, color]) => <div className="col-6 col-lg" key={label}><div className={`card border-${color} h-100`}><div className="card-body"><small className="text-muted">{label}</small><h4 className="mb-0">{value}</h4></div></div></div>)}
            </div>

            <section className="admin-payment-search-toolbar">
                <label className="admin-payment-search-field"><span aria-hidden="true">⌕</span><input type="search" value={paymentSearch} onChange={(event) => setPaymentSearch(event.target.value)} placeholder="Search patient, booking, transaction..." /></label>
                <label className="admin-payment-day-field"><span>Day</span><input type="date" value={paymentDateFilter} onChange={(event) => { setPaymentDateFilter(event.target.value); setSelectedPaymentPeriod("all"); }} /></label>
                <button type="button" className={selectedPaymentPeriod === "last7" ? "active" : ""} onClick={() => { setSelectedPaymentPeriod("last7"); setPaymentDateFilter(""); }}>Last 7 days</button>
                {(paymentSearch || paymentDateFilter || selectedPaymentPeriod !== "all") && <button type="button" className="clear" onClick={() => { setPaymentSearch(""); setPaymentDateFilter(""); setSelectedPaymentPeriod("all"); }}>Clear</button>}
            </section>

            <section className="admin-payment-panel admin-recent-payment-panel card shadow-sm mb-4">
                <div className="card-body">
                    <div className="admin-recent-payment-title">
                        <div><h4>Recent Payment Patients</h4><p>Filter patient payment records by day or by the last 7 days.</p></div>
                    </div>
                    {selectedPaymentPeriod === "all" ? <div className="admin-recent-payment-grid">
                        <RecentPaymentRecords title="Today's payments" description="Day-wise patient records" payments={filteredTodayPayments} getSuccessfulAmount={getSuccessfulAmount} handleStatusChange={handleStatusChange} handleView={openPayment} handleDelete={handleDelete} />
                        <RecentPaymentRecords title="Last 7 days" description="Patient records from the recent 7-day period" payments={filteredRecentPayments} getSuccessfulAmount={getSuccessfulAmount} handleStatusChange={handleStatusChange} handleView={openPayment} handleDelete={handleDelete} />
                    </div> : <div className="admin-recent-payment-filtered-records">
                        <RecentPaymentRecords title={selectedPaymentPeriod === "today" ? "Today's payments" : "Last 7 days"} description={selectedPaymentPeriod === "today" ? "Day-wise patient records" : "Patient records from the recent 7-day period"} payments={periodFilteredPayments} getSuccessfulAmount={getSuccessfulAmount} handleStatusChange={handleStatusChange} handleView={openPayment} handleDelete={handleDelete} />
                    </div>}
                </div>
            </section>

            <section className="admin-payment-filter card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4"><label className="form-label">Doctor-wise history</label><select className="form-select" value={selectedDoctor} onChange={(event) => setSelectedDoctor(event.target.value)}><option value="all">All doctors</option>{doctorNames.map((doctor) => <option key={doctor} value={doctor}>{doctor}</option>)}</select></div>
                        <div className="col-md-3"><label className="form-label">Payment status</label><select className="form-select" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}><option value="all">All statuses</option><option>Paid</option><option>Pending</option><option>Partially Paid</option><option>Refunded</option><option>Failed</option><option>Cancelled</option></select></div>
                        <div className="col-md-3"><label className="form-label">Payment mode</label><select className="form-select" value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)}><option value="all">All modes</option><option value="Full">Full payment</option><option value="Partial">Partial payment</option></select></div>
                        <div className="col-md-2"><small className="text-muted d-block">All services total</small><strong>৳ {payments.reduce((sum, payment) => sum + getSuccessfulAmount(payment), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><small className="text-muted d-block">Cancelled excluded</small></div>
                    </div>
                </div>
            </section>

            <section className="admin-payment-panel card shadow-sm mb-4 admin-refund-panel">
                <div className="card-body">
                    <h4>Refund Requests</h4>
                    {refundRequests.filter((item) => item.refund_status === "Pending").length === 0 ? <p className="text-muted mb-0">No pending refund requests.</p> : refundRequests.filter((item) => item.refund_status === "Pending").map((refundRequest) => (
                        <div className="d-flex justify-content-between align-items-center border-bottom py-3" key={refundRequest.id}>
                            <div><strong>{refundRequest.patient_name || "Patient"}</strong><div>Booking: {refundRequest.booking_number || "Appointment"}</div><div>Doctor: {refundRequest.doctor_name || "N/A"} · Requested ৳{refundRequest.refund_amount}</div><small className="text-muted d-block">Reason: {refundRequest.reason}</small><small className="text-muted">Requested: {refundRequest.requested_at ? new Date(refundRequest.requested_at).toLocaleString() : "Just now"}</small></div>
                            <div><button type="button" className="btn btn-success btn-sm me-2" onClick={() => handleRefundDecision(refundRequest, "Approved")}>Approve</button><button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRefundDecision(refundRequest, "Rejected")}>Reject</button></div>
                        </div>
                    ))}
                </div>
            </section>


            <section className="admin-payment-panel card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div><h4 className="mb-1">Doctor Appointment Payments</h4><p className="text-muted mb-0">Payments made for doctor appointment bookings.</p></div>
                        <div className="d-flex align-items-center gap-3">
                            <div className="border border-success rounded px-3 py-2 text-end">
                                <small className="d-block text-muted">Successful payments total</small>
                                <strong className="text-success">৳ {appointmentPaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </div>
                            <span className="badge bg-primary">{appointmentPayments.length} transactions</span>
                        </div>
                    </div>
                    <PaymentTable payments={appointmentPayments} handleStatusChange={handleStatusChange} handleView={openPayment} handleDelete={handleDelete} handleRefund={handleRefund} />
                </div>
            </section>

            <section className="admin-payment-panel card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div><h4 className="mb-1">Diagnostic Test Payments</h4><p className="text-muted mb-0">Payments made for diagnostic test bookings.</p></div>
                        <div className="d-flex align-items-center gap-3">
                            <div className="border border-success rounded px-3 py-2 text-end">
                                <small className="d-block text-muted">Successful payments total</small>
                                <strong className="text-success">৳ {diagnosticPaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </div>
                            <span className="badge bg-info text-dark">{diagnosticPayments.length} transactions</span>
                        </div>
                    </div>
                    <PaymentTable diagnostic payments={diagnosticPayments} handleStatusChange={handleStatusChange} handleView={openPayment} handleDelete={handleDelete} handleRefund={handleRefund} />
                </div>
            </section>

            <section className="admin-payment-panel card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div><h4 className="mb-1">Complete Payment Records</h4><p className="text-muted mb-0">All appointment and diagnostic transactions, including cancelled and failed payments.</p></div>
                        <span className="badge bg-dark">{payments.length} records</span>
                    </div>
                    <PaymentTable allRecords payments={payments} handleStatusChange={handleStatusChange} handleView={openPayment} handleDelete={handleDelete} handleRefund={handleRefund} />
                </div>
            </section>

            {selectedPayment && <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0, 0, 0, 0.45)" }}>
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header"><h5 className="modal-title">Payment Details</h5><button type="button" className="btn-close" onClick={() => setSelectedPayment(null)} aria-label="Close" /></div>
                        <div className="modal-body">
                            <p><strong>Patient:</strong> {selectedPayment.patient_name || "N/A"}</p>
                            <p><strong>Type:</strong> {selectedPayment.payment_type === "Diagnostic Test" || selectedPayment.test_booking ? "Diagnostic Test" : "Doctor Appointment"}</p>
                            <p><strong>Booked for:</strong> {selectedPayment.booking_person_name || selectedPayment.patient_name || "N/A"}</p>
                            <p><strong>Booking:</strong> {selectedPayment.appointment_booking || selectedPayment.diagnostic_booking_number || "N/A"}</p>
                            <p><strong>Diagnostic test:</strong> {selectedPayment.diagnostic_test_name || "Doctor appointment"}</p>
                            <p><strong>Doctor:</strong> {selectedPayment.doctor_name || "Diagnostic booking"}</p>
                            <p><strong>Amount:</strong> ৳ {selectedPayment.amount}</p>
                            <p><strong>Method:</strong> {selectedPayment.payment_method || "N/A"}</p>
                            <p><strong>Transaction:</strong> {selectedPayment.transaction_id || "N/A"}</p>
                            <p className="mb-0"><strong>Status:</strong> {selectedPayment.payment_status}</p>
                            {selectedPayment.test_booking && <div className="border-top pt-3 mt-3">
                                <h6>Diagnostic report availability</h6>
                                <label className="form-label">When will the report be ready?</label>
                                <input type="datetime-local" className="form-control mb-2" value={reportForm.report_available_at} onChange={(event) => setReportForm({ ...reportForm, report_available_at: event.target.value })} />
                                <label className="form-label">Message for patient</label>
                                <textarea className="form-control mb-2" rows="3" value={reportForm.report_available_note} onChange={(event) => setReportForm({ ...reportForm, report_available_note: event.target.value })} placeholder="Your report will be available after laboratory review." />
                                <button type="button" className="btn btn-primary" onClick={saveReportInfo}>Save report information</button>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>}

        </div>

    );

}


export default AdminPayments;