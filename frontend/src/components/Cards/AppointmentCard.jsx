import "./AppointmentCard.css";

function AppointmentCard({ appointment }) {

    if (!appointment) {

        return null;

    }

    return (

        <div className="appointment-card">

            <div className="appointment-card-header">

                <h2>Appointment Details</h2>

                <span
                    className={`status-badge ${appointment.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                >
                    {appointment.status}
                </span>

            </div>

            <div className="appointment-card-body">

                <div className="appointment-item">

                    <label>Booking Number</label>

                    <p>{appointment.booking_number}</p>

                </div>

                <div className="appointment-item">

                    <label>Patient</label>

                    <p>{appointment.patient_name}</p>

                </div>

                <div className="appointment-item">

                    <label>Doctor</label>

                    <p>{appointment.doctor_name}</p>

                </div>

                <div className="appointment-item">

                    <label>Department</label>

                    <p>{appointment.department}</p>

                </div>

                <div className="appointment-item">

                    <label>Appointment Date</label>

                    <p>{appointment.appointment_date}</p>

                </div>

                <div className="appointment-item">

                    <label>Time Slot</label>

                    <p>{appointment.slot_time}</p>

                </div>

                <div className="appointment-item">

                    <label>Reason</label>

                    <p>{appointment.reason}</p>

                </div>

                <div className="appointment-item">

                    <label>Symptoms</label>

                    <p>
                        {appointment.symptoms || "Not Provided"}
                    </p>

                </div>

            </div>

        </div>

    );

}

export default AppointmentCard;