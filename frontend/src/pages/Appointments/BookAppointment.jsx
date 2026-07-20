import { useState, useEffect } from "react";
import DepartmentDropdown from "../../components/DepartmentDropdown";
import "../../styles/appointment.css";

import { bookAppointment } from "../../services/appointmentService";
import { getTimeSlots } from "../../services/timeSlotService";
import { getDoctors } from "../../api/appointmentApi";

function BookAppointment() {

    // ==========================
    // State Variables
    // ==========================

    const [department, setDepartment] = useState("");
    const [doctor, setDoctor] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [reason, setReason] = useState("");

    const [doctors, setDoctors] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);

    const [errors, setErrors] = useState({});

    // ==========================
    // Load Doctors
    // ==========================

    useEffect(() => {

        const loadDoctors = async () => {

            if (!department) {

                setDoctors([]);
                setDoctor("");
                return;

            }

            try {

                const response = await getDoctors(department);

                setDoctors(response.data);

            } catch (error) {

                console.error("Doctor Load Error:", error);

                setDoctors([]);

            }

        };

        loadDoctors();

    }, [department]);

    // ==========================
    // Load Time Slots
    // ==========================

    useEffect(() => {

        const loadTimeSlots = async () => {

            if (!doctor) {

                setTimeSlots([]);
                return;

            }

            try {

                const response = await getTimeSlots(doctor);

                setTimeSlots(response.data);

            } catch (error) {

                console.error("Time Slot Error:", error);

            }

        };

        loadTimeSlots();

    }, [doctor]);

    // ==========================
    // Submit Appointment
    // ==========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        let validationErrors = {};

        if (!department)
            validationErrors.department = "Department is required.";

        if (!doctor)
            validationErrors.doctor = "Doctor is required.";

        if (!appointmentDate)
            validationErrors.appointmentDate =
                "Appointment date is required.";

        if (!timeSlot)
            validationErrors.timeSlot = "Time slot is required.";

        if (!reason.trim())
            validationErrors.reason = "Reason is required.";

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0)
            return;

        const data = {

            patient: 1,

            doctor: Number(doctor),

            slot: Number(timeSlot),

            appointment_date: appointmentDate,

            reason,

            symptoms: ""

        };

        try {

            const response = await bookAppointment(data);

            alert(
                response.data.message ||
                "Appointment booked successfully."
            );

            setDepartment("");
            setDoctor("");
            setAppointmentDate("");
            setTimeSlot("");
            setReason("");
            setDoctors([]);
            setTimeSlots([]);
            setErrors({});

        } catch (error) {

            console.error(error);

            if (error.response) {

                alert(JSON.stringify(error.response.data));

            } else {

                alert("Booking Failed.");

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
                        onDepartmentChange={(e) =>
                            setDepartment(e.target.value)
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
                            onChange={(e) =>
                                setDoctor(e.target.value)
                            }
                        >

                            <option value="">
                                Select Doctor
                            </option>

                            {doctors.map((doctor) => (

                                <option
                                    key={doctor.id}
                                    value={doctor.id}
                                >
                                    {doctor.doctor_name}
                                </option>

                            ))}

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
                            onChange={(e) =>
                                setAppointmentDate(e.target.value)
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
                            onChange={(e) =>
                                setTimeSlot(e.target.value)
                            }
                        >

                            <option value="">
                                Select Time
                            </option>

                            {timeSlots.map((slot) => (

                                <option
                                    key={slot.id}
                                    value={slot.id}
                                    disabled={slot.is_full}
                                >

                                    {slot.slot_time}
                                    {slot.is_full ? " (Full)" : ""}

                                </option>

                            ))}

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
                            onChange={(e) =>
                                setReason(e.target.value)
                            }
                            placeholder="Write your health problem..."
                        />

                        {errors.reason && (
                            <p className="error-text">
                                {errors.reason}
                            </p>
                        )}

                    </div>

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