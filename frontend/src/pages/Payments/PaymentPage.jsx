import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { createPayment } from "../../services/paymentService";

import "../../styles/payment.css";

function PaymentPage() {

    const navigate = useNavigate();

    const location = useLocation();

    // Appointment data passed from previous page
    const appointment = location.state;

    const [paymentMethod, setPaymentMethod] = useState("Bkash");

    const [transactionId, setTransactionId] = useState("");

    const [loading, setLoading] = useState(false);

    if (!appointment) {

        return (

            <div className="container mt-5">

                <div className="alert alert-danger">

                    Invalid payment request.

                </div>

            </div>

        );

    }

    const handlePayment = async () => {

        if (!transactionId.trim()) {

            alert("Transaction ID is required.");

            return;

        }

        const payload = {

            appointment: appointment.id,

            amount: Number(appointment.consultation_fee),

            payment_method: paymentMethod,

            transaction_id: transactionId.trim(),

        };
        try {

            setLoading(true);

            const response = await createPayment(payload);

            navigate("/payment-success", {

                state: {

                    payment: response.data,

                    appointment: appointment,

                },

            });
        }

        catch (error) {

            console.error(error);

            if (error.response) {

                const data = error.response.data;

                if (data.appointment) {

                    alert(data.appointment[0]);

                } else {

                    alert(
                        "Payment failed. Please try again."
                    );

                }

            } else {

                alert(
                    "Cannot connect to the server."
                );

            }

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="container mt-5">

            <div className="card shadow">

                <div className="card-header bg-primary text-white">

                    <h3>

                        Appointment Payment

                    </h3>

                </div>

                <div className="card-body">

                    <h5>

                        Appointment Information

                    </h5>

                    <hr/>

                    <p>

                        <strong>

                            Booking Number :

                        </strong>

                        {" "}

                        {appointment.booking_number}

                    </p>

                    <p>

                        <strong>

                            Doctor :

                        </strong>

                        {" "}

                        {appointment.doctor_name}

                    </p>

                    <p>

                        <strong>

                            Department :

                        </strong>

                        {" "}

                        {appointment.department}

                    </p>

                    <p>

                        <strong>

                            Date :

                        </strong>

                        {" "}

                        {appointment.appointment_date}

                    </p>

                    <p>

                        <strong>

                            Time :

                        </strong>

                        {" "}

                        {appointment.slot_time}

                    </p>

                    <hr/>

                    <h4>

                        Total Amount

                    </h4>

                    <h2 className="text-success">

                        ৳ {appointment.consultation_fee}

                    </h2>

                    <hr/>

                    <div className="mb-3">

                        <label>

                            Payment Method

                        </label>

                        <select

                            className="form-select"

                            value={paymentMethod}

                            onChange={(e)=>

                                setPaymentMethod(

                                    e.target.value

                                )

                            }

                        >

                            <option>

                                Bkash

                            </option>

                            <option>

                                Nagad

                            </option>

                            <option>

                                Rocket

                            </option>

                            <option>

                                Card

                            </option>

                            <option>

                                Cash

                            </option>

                        </select>

                    </div>

                    <div className="mb-3">

                        <label>

                            Transaction ID

                        </label>

                        <input

                            type="text"

                            className="form-control"
                            
                            required

                            placeholder="Enter Transaction ID"

                            value={transactionId}

                            onChange={(e)=>

                                setTransactionId(

                                    e.target.value

                                )

                            }

                        />

                    </div>

                    <button

                        className="btn btn-success w-100"

                        onClick={handlePayment}

                        disabled={loading}

                    >

                        {

                            loading

                            ?

                            "Processing Payment..."

                            :

                            "Confirm Payment"

                        }

                    </button>

                </div>

            </div>

        </div>

    );

}

export default PaymentPage;