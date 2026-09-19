import { Link, useSearchParams } from "react-router-dom";


function PaymentResult() {
    const [searchParams] = useSearchParams();
    const result = searchParams.get("status");
    const isSuccess = result === "success";
    const title = isSuccess ? "Payment successful" : "Payment not completed";
    const message = isSuccess
        ? "Your SSLCOMMERZ payment was verified and your booking is being confirmed."
        : "The payment was cancelled or could not be verified. No successful payment was recorded.";

    return (
        <div className="container mt-5">
            <div className={`alert ${isSuccess ? "alert-success" : "alert-warning"}`}>
                <h4>{title}</h4>
                <p className="mb-3">{message}</p>
                <Link to="/payments" className="btn btn-primary">
                    Go to payment history
                </Link>
                {isSuccess && (
                    <Link to="/patient/dashboard" className="btn btn-success ms-2">
                        Patient Dashboard
                    </Link>
                )}
            </div>
        </div>
    );
}


export default PaymentResult;