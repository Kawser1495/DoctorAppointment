import { useState } from "react";
import DepartmentDropdown from "../../components/DepartmentDropdown";
import "../../styles/appointment.css";
import { bookAppointment } from "../../services/appointmentService";

function BookAppointment() {

    // =========================
    // State Variables
    // =========================

    const [department, setDepartment] = useState("");
    const [doctor, setDoctor] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [reason, setReason] = useState("");

    // Validation Errors
    const [errors, setErrors] = useState({});

    // =========================
    // Submit Form
    // =========================

    const handleSubmit = async (event) => {

        event.preventDefault();

        let validationErrors = {};

        if (!department)
            validationErrors.department = "Department is required.";

        if (!doctor)
            validationErrors.doctor = "Doctor is required.";

        if (!appointmentDate)
            validationErrors.appointmentDate = "Date is required.";

        if (!timeSlot)
            validationErrors.timeSlot = "Time slot is required.";

        if (!reason.trim())
            validationErrors.reason = "Reason is required.";

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0)
            return;

        const data = {

            patient: 1, // Temporary

            doctor: Number(doctor),

            slot: Number(timeSlot),

            appointment_date: appointmentDate,

            reason: reason,

            symptoms: ""

        };

        try {

            const response = await bookAppointment(data);

            alert(response.data.message || "Appointment booked successfully.");

            setDepartment("");
            setDoctor("");
            setAppointmentDate("");
            setTimeSlot("");
            setReason("");
            setErrors({});

        }

        catch (error) {

            console.log(error);

            if (error.response) {

                alert(JSON.stringify(error.response.data));

            }

            else {

                alert("Booking Failed");

            }

        }

    };

    return (

        <div className="appointment-page">

            <div className="appointment-container">

                <h2>Book Appointment</h2>

                <form onSubmit={handleSubmit}>

                    {/* Department */}

                    <DepartmentDropdown
                        selectedDepartment={department}
                        onDepartmentChange={(event) =>
                            setDepartment(event.target.value)
                        }
                    />

                    {errors.department && (
                        <p className="error-text">{errors.department}</p>
                    )}

                    {/* Doctor */}

                    <div className="form-group">

                        <label>Doctor</label>

                        <select
                            value={doctor}
                            onChange={(event) =>
                                setDoctor(event.target.value)
                            }
                        >

                            <option value="">Select Doctor</option>

                        </select>

                        {errors.doctor && (
                            <p className="error-text">{errors.doctor}</p>
                        )}

                    </div>

                    {/* Appointment Date */}

                    <div className="form-group">

                        <label>Appointment Date</label>

                        <input
                            type="date"
                            value={appointmentDate}
                            onChange={(event) =>
                                setAppointmentDate(event.target.value)
                            }
                        />

                        {errors.appointmentDate && (
                            <p className="error-text">
                                {errors.appointmentDate}
                            </p>
                        )}

                    </div>

                    {/* Time Slot */}

                    <div className="form-group">

                        <label>Time Slot</label>

                        <select
                            value={timeSlot}
                            onChange={(event) =>
                                setTimeSlot(event.target.value)
                            }
                        >

                            <option value="">Select Time</option>

                            <option value="1">09:00 AM</option>
                            <option value="2">09:30 AM</option>
                            <option value="3">10:00 AM</option>
                            <option value="4">10:30 AM</option>

                        </select>

                        {errors.timeSlot && (
                            <p className="error-text">{errors.timeSlot}</p>
                        )}

                    </div>

                    {/* Reason */}

                    <div className="form-group">

                        <label>Reason</label>

                        <textarea
                            rows="5"
                            value={reason}
                            onChange={(event) =>
                                setReason(event.target.value)
                            }
                            placeholder="Write your health problem..."
                        />

                        {errors.reason && (
                            <p className="error-text">{errors.reason}</p>
                        )}

                    </div>

                    {/* Submit Button */}

                    <button
                        type="submit"
                        className="appointment-btn"
                    >
                        Book Appointment
                    </button>

                </form>

            </div>

        </div>

    );

}

export default BookAppointment;