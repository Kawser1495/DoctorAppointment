import { useState } from "react";
import DepartmentDropdown from "../../components/DepartmentDropdown";
import "../../styles/appointment.css";

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

    const handleSubmit = (event) => {

        event.preventDefault();

        let validationErrors = {};

        // Department Validation
        if (!department) {

            validationErrors.department =
                "Please select a department.";

        }

        // Doctor Validation
        if (!doctor) {

            validationErrors.doctor =
                "Please select a doctor.";

        }

        // Date Validation
        if (!appointmentDate) {

            validationErrors.appointmentDate =
                "Please select appointment date.";

        } else {

            const today = new Date();

            today.setHours(0, 0, 0, 0);

            const selectedDate = new Date(appointmentDate);

            if (selectedDate < today) {

                validationErrors.appointmentDate =
                    "Past date is not allowed.";

            }

        }

        // Time Slot Validation
        if (!timeSlot) {

            validationErrors.timeSlot =
                "Please select a time slot.";

        }

        // Reason Validation
        if (!reason.trim()) {

            validationErrors.reason =
                "Please enter your problem.";

        }

        else if (reason.trim().length < 10) {

            validationErrors.reason =
                "Reason must be at least 10 characters.";

        }

        // Save Errors
        setErrors(validationErrors);

        // If no validation error
        if (Object.keys(validationErrors).length === 0) {

            alert("Validation Passed!");

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
                        <p className="error-text">
                            {errors.department}
                        </p>
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

                            <option value="">
                                Select Doctor
                            </option>

                        </select>

                        {errors.doctor && (
                            <p className="error-text">
                                {errors.doctor}
                            </p>
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

                            <option value="">
                                Select Time
                            </option>

                            <option value="09:00 AM">
                                09:00 AM
                            </option>

                            <option value="09:30 AM">
                                09:30 AM
                            </option>

                            <option value="10:00 AM">
                                10:00 AM
                            </option>

                            <option value="10:30 AM">
                                10:30 AM
                            </option>

                        </select>

                        {errors.timeSlot && (
                            <p className="error-text">
                                {errors.timeSlot}
                            </p>
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
                            <p className="error-text">
                                {errors.reason}
                            </p>
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