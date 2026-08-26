import { useParams } from "react-router-dom";


function DiagnosticTestBooking() {

    const { testId } = useParams();


    return (

        <div
            style={{
                padding: "40px",
            }}
        >

            <h1>
                Diagnostic Test Booking
            </h1>

            <p>
                Selected Test ID: {testId}
            </p>

        </div>

    );

}


export default DiagnosticTestBooking;