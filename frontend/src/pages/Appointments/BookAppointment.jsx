import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DepartmentDropdown from "../../components/DepartmentDropdown";

import { bookAppointment } from "../../services/appointmentService";

import {
    getAvailableTimeSlots,
    getDoctorsByDepartment,
} from "../../services/doctorService";

import "../../styles/appointment.css";


function BookAppointment() {

    // ==========================================
    // State Variables
    // ==========================================

    const [department, setDepartment] = useState("");

    const [doctors, setDoctors] = useState([]);

    const [doctor, setDoctor] = useState("");

    const [appointmentDate, setAppointmentDate] = useState("");

    const [timeSlot, setTimeSlot] = useState("");

    const [timeSlots, setTimeSlots] = useState([]);

    const [reason, setReason] = useState("");

    const [errors, setErrors] = useState({});

    const [doctorLoading, setDoctorLoading] =
        useState(false);

    const [slotLoading, setSlotLoading] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const navigate = useNavigate();


    // ==========================================
    // Department Change
    // ==========================================

    const handleDepartmentChange = (e) => {

        const selectedDepartment =
            e.target.value;

        setDepartment(selectedDepartment);

        // Reset Doctor
        setDoctor("");
        setDoctors([]);

        // Reset Time Slot
        setTimeSlot("");
        setTimeSlots([]);

        // Remove related errors
        setErrors((prev) => ({
            ...prev,
            department: "",
            doctor: "",
            timeSlot: "",
        }));

    };


    // ==========================================
    // Doctor Change
    // ==========================================

    const handleDoctorChange = (e) => {

        const selectedDoctor =
            e.target.value;

        setDoctor(selectedDoctor);

        // Reset previous slot
        setTimeSlot("");
        setTimeSlots([]);

        setErrors((prev) => ({
            ...prev,
            doctor: "",
            timeSlot: "",
        }));

    };


    // ==========================================
    // Load Doctors By Department
    // ==========================================

    useEffect(() => {

        // No department selected
        if (!department) {

            setDoctors([]);
            setDoctor("");

            return;

        }


        const loadDoctors = async () => {

            try {

                setDoctorLoading(true);

                console.log(
                    "Loading doctors for department:",
                    department
                );


                const response =
                    await getDoctorsByDepartment(
                        department
                    );


                console.log(
                    "Doctor API Response:",
                    response.data
                );


                const doctorList =
                    response.data.results || [];


                setDoctors(doctorList);

            }

            catch (error) {

                console.error(
                    "Doctor Load Error Status:",
                    error.response?.status
                );

                console.error(
                    "Doctor Load Error Response:",
                    error.response?.data
                );

                console.error(
                    "Full Doctor Load Error:",
                    error
                );

                setDoctors([]);

            }

            finally {

                setDoctorLoading(false);

            }

        };


        loadDoctors();

    }, [department]);


    // ==========================================
    // Load Available Time Slots
    // ==========================================

    useEffect(() => {

        // No doctor selected
        if (!doctor) {

            setTimeSlots([]);
            setTimeSlot("");

            return;

        }


        const loadTimeSlots = async () => {

            try {

                setSlotLoading(true);

                console.log(
                    "Loading slots for doctor:",
                    doctor
                );


                const response =
                    await getAvailableTimeSlots(
                        doctor
                    );


                console.log(
                    "Time Slot API Response:",
                    response.data
                );


                const slotList =
                    response.data.results || [];


                setTimeSlots(slotList);

            }

            catch (error) {

                console.error(
                    "Time Slot Error Status:",
                    error.response?.status
                );

                console.error(
                    "Time Slot Error Response:",
                    error.response?.data
                );

                console.error(
                    "Full Time Slot Error:",
                    error
                );

                setTimeSlots([]);

            }

            finally {

                setSlotLoading(false);

            }

        };


        loadTimeSlots();

    }, [doctor]);


    // ==========================================
    // Submit Appointment
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        const validationErrors = {};


        if (!department) {

            validationErrors.department =
                "Department is required.";

        }


        if (!doctor) {

            validationErrors.doctor =
                "Doctor is required.";

        }


        if (!appointmentDate) {

            validationErrors.appointmentDate =
                "Appointment date is required.";

        }


        if (!timeSlot) {

            validationErrors.timeSlot =
                "Time slot is required.";

        }


        if (!reason.trim()) {

            validationErrors.reason =
                "Reason is required.";

        }


        setErrors(validationErrors);


        // Stop if validation error exists

        if (
            Object.keys(validationErrors).length > 0
        ) {

            return;

        }


        const data = {

            doctor: Number(doctor),

            slot: Number(timeSlot),

            appointment_date: appointmentDate,

            reason: reason.trim(),

            symptoms: "",

        };


        try {

            setSubmitting(true);

            console.log(
                "Appointment Payload:",
                data
            );


            const response =
                await bookAppointment(data);


            console.log(
                "Booking Response:",
                response.data
            );


            alert(
                response.data.message ||
                "Appointment booked successfully."
            );


            // Correct route

            navigate("/appointments");


        }

        catch (error) {

            console.error(
                "Appointment Booking Error:",
                error.response?.data || error
            );


            // Backend validation error

            if (error.response?.data) {

                const backendErrors =
                    error.response.data;


                // Show backend error properly

                const errorMessage =
                    Object.values(backendErrors)
                        .flat()
                        .join("\n");


                alert(
                    errorMessage ||
                    "Booking failed."
                );

            }

            else {

                alert(
                    "Booking failed. Please check your connection."
                );

            }

        }

        finally {

            setSubmitting(false);

        }

    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="appointment-page">

            <div className="appointment-container">

                <h2>

                    Book Appointment

                </h2>


                <form onSubmit={handleSubmit}>


                    {/* ======================
                        Department
                    ====================== */}

                    <DepartmentDropdown

                        selectedDepartment={department}

                        onDepartmentChange={
                            handleDepartmentChange
                        }

                    />


                    {errors.department && (

                        <p className="error-text">

                            {errors.department}

                        </p>

                    )}


                    {/* ======================
                        Doctor
                    ====================== */}

                    <div className="form-group">

                        <label>

                            Doctor

                        </label>


                        <select

                            value={doctor}

                            onChange={handleDoctorChange}

                            disabled={
                                !department ||
                                doctorLoading
                            }

                        >

                            <option value="">

                                {!department

                                    ? "Select Department First"

                                    : doctorLoading

                                        ? "Loading Doctors..."

                                        : doctors.length === 0

                                            ? "No Doctors Available"

                                            : "Select Doctor"

                                }

                            </option>


                            {doctors.map((item) => (

                                <option

                                    key={item.id}

                                    value={item.id}

                                >

                                    {item.doctor_name}

                                    {item.specialization
                                        ? ` - ${item.specialization}`
                                        : ""
                                    }

                                </option>

                            ))}

                        </select>


                        {errors.doctor && (

                            <p className="error-text">

                                {errors.doctor}

                            </p>

                        )}

                    </div>


                    {/* ======================
                        Appointment Date
                    ====================== */}

                    <div className="form-group">

                        <label>

                            Appointment Date

                        </label>


                        <input

                            type="date"

                            value={appointmentDate}

                            min={
                                new Date()
                                    .toISOString()
                                    .split("T")[0]
                            }

                            onChange={(e) => {

                                setAppointmentDate(
                                    e.target.value
                                );

                                setErrors((prev) => ({
                                    ...prev,
                                    appointmentDate: "",
                                }));

                            }}

                        />


                        {errors.appointmentDate && (

                            <p className="error-text">

                                {errors.appointmentDate}

                            </p>

                        )}

                    </div>


                    {/* ======================
                        Time Slot
                    ====================== */}

                    <div className="form-group">

                        <label>

                            Time Slot

                        </label>


                        <select

                            value={timeSlot}

                            onChange={(e) => {

                                setTimeSlot(
                                    e.target.value
                                );

                                setErrors((prev) => ({
                                    ...prev,
                                    timeSlot: "",
                                }));

                            }}

                            disabled={
                                !doctor ||
                                slotLoading
                            }

                        >

                            <option value="">

                                {!doctor

                                    ? "Select Doctor First"

                                    : slotLoading

                                        ? "Loading Time Slots..."

                                        : timeSlots.length === 0

                                            ? "No Time Slots Available"

                                            : "Select Time"

                                }

                            </option>


                            {timeSlots.map((slot) => (

                                <option

                                    key={slot.id}

                                    value={slot.id}

                                    disabled={slot.is_full}

                                >

                                    {slot.slot_time}

                                    {slot.is_full
                                        ? " (Full)"
                                        : ""
                                    }

                                </option>

                            ))}

                        </select>


                        {errors.timeSlot && (

                            <p className="error-text">

                                {errors.timeSlot}

                            </p>

                        )}

                    </div>


                    {/* ======================
                        Reason
                    ====================== */}

                    <div className="form-group">

                        <label>

                            Reason

                        </label>


                        <textarea

                            rows="5"

                            value={reason}

                            onChange={(e) => {

                                setReason(
                                    e.target.value
                                );

                                setErrors((prev) => ({
                                    ...prev,
                                    reason: "",
                                }));

                            }}

                            placeholder="Write your health problem..."

                        />


                        {errors.reason && (

                            <p className="error-text">

                                {errors.reason}

                            </p>

                        )}

                    </div>


                    {/* ======================
                        Submit Button
                    ====================== */}

                    <button

                        type="submit"

                        className="appointment-btn"

                        disabled={submitting}

                    >

                        {submitting

                            ? "Booking Appointment..."

                            : "Book Appointment"

                        }

                    </button>


                </form>

            </div>

        </div>

    );

}


export default BookAppointment;