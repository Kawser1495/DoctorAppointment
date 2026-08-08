import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { createPayment } from "../../services/paymentService";

function PaymentPage() {

    const navigate = useNavigate();

    const location = useLocation();

    const appointment = location.state;

    const [paymentMethod, setPaymentMethod] = useState("Bkash");

    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {

        try {

            setLoading(true);

            const payload = {

                patient: appointment.patient,

                appointment: appointment.id,

                amount: appointment.consultation_fee,

                payment_method: paymentMethod,

                transaction_id:
                    "TXN-" +
                    Date.now(),

            };

            await createPayment(payload);

            navigate("/payment-success");

        }

        catch (error) {

            console.error(error);

            alert("Payment Failed");

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="container mt-5">

            <h2>Payment</h2>

            <hr/>

            <p>

                Doctor :
                <strong>
                    {appointment.doctor_name}
                </strong>

            </p>

            <p>

                Amount :

                <strong>

                    ৳{appointment.consultation_fee}

                </strong>

            </p>

            <select

                value={paymentMethod}

                onChange={(e)=>

                    setPaymentMethod(
                        e.target.value
                    )

                }

            >

                <option>Bkash</option>

                <option>Nagad</option>

                <option>Rocket</option>

                <option>Card</option>

                <option>Cash</option>

            </select>

            <br/><br/>

            <button

                onClick={handlePayment}

                disabled={loading}

            >

                {

                    loading

                    ?

                    "Processing..."

                    :

                    "Pay Now"

                }

            </button>

        </div>

    );

}

export default PaymentPage;