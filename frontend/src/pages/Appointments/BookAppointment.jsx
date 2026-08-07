import { useState, useEffect } from "react";

import DepartmentDropdown from "../../components/DepartmentDropdown";
import "../../styles/appointment.css";

import { bookAppointment } from "../../services/appointmentService";
import { useNavigate } from "react-router-dom";

import {
    getAvailableTimeSlots,
    getDoctorsByDepartment,
} from "../../services/doctorService";


function BookAppointment() {

    // ==========================
    // State Variables
    // ==========================

    // ==========================
// State Variables
// ==========================

        const [department, setDepartment] = useState("");

        const [doctors, setDoctors] = useState([]);

        const [doctor, setDoctor] = useState("");

        const [appointmentDate, setAppointmentDate] = useState("");

        const [timeSlot, setTimeSlot] = useState("");

        const [timeSlots, setTimeSlots] = useState([]);

        const [reason, setReason] = useState("");

        const [errors, setErrors] = useState({});
        const navigate = useNavigate();


    // ==========================
    // Load Doctors By Department
    // ==========================

    useEffect(() => {

        if (!department) {

            setDoctors([]);

            setDoctor("");

            return;

        }

        const loadDoctors = async () => {

            try {

                const response =
                    await getDoctorsByDepartment(
                        department
                    );

                setDoctors(response.data.results);

            }

            catch (error) {

                console.error(
                    "Doctor Load Error:",
                    error
                );

            }

        };

        loadDoctors();

    }, [department]);

    // ==========================
    // Load Available Time Slots
    // ==========================

    useEffect(() => {

        const loadTimeSlots = async () => {

            if (!doctor) {

            setTimeSlots([]);

            return;

           }

            try {

                const response = await getAvailableTimeSlots(doctor);

                setTimeSlots(response.data.results);

            }

            catch (error) {

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
            validationErrors.appointmentDate = "Appointment date is required.";

        if (!timeSlot)
            validationErrors.timeSlot = "Time slot is required.";

        if (!reason.trim())
            validationErrors.reason = "Reason is required.";

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0)
            return;

        const data = {

            doctor: Number(doctor),

            slot: Number(timeSlot),

            appointment_date: appointmentDate,

            reason,

            symptoms: ""

        };

        try {
            console.log("Appointment Payload:", data);
            const response = await bookAppointment(data);

            alert(
                response.data.message ||
                "Appointment booked successfully."
            );

            navigate("/my-appointments");
            // Reset Form

            setDepartment("");
            setDoctors([]);
            setDoctor("");
            setAppointmentDate("");
            setTimeSlot("");
            setTimeSlots([]);
            setReason("");
            setErrors({});

        }

        catch (error) {

            console.error(error);

            if (error.response) {

                alert(JSON.stringify(error.response.data));

            }

            else {

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

                    {errors.department &&
                        <p className="error-text">
                            {errors.department}
                        </p>
                    }

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

                        {errors.doctor &&
                            <p className="error-text">
                                {errors.doctor}
                            </p>
                        }

                    </div>

                    {/* Appointment Date */}

                    <div className="form-group">

                        <label>Appointment Date</label>

                        <input
                            type="date"
                            value={appointmentDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) =>
                                setAppointmentDate(e.target.value)
                            }
                        />

                        {errors.appointmentDate &&
                            <p className="error-text">
                                {errors.appointmentDate}
                            </p>
                        }

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

                        {errors.timeSlot &&
                            <p className="error-text">
                                {errors.timeSlot}
                            </p>
                        }

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

                        {errors.reason &&
                            <p className="error-text">
                                {errors.reason}
                            </p>
                        }

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