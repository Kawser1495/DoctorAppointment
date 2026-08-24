import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DepartmentDropdown from "../../components/DepartmentDropdown";

import {
    getDoctorsByDepartment,
    getAvailableTimeSlots,
} from "../../services/doctorService";

import {
    bookAppointment,
} from "../../services/appointmentService";

import "../../styles/appointment.css";


function BookAppointment() {

    // ==========================================
    // Navigation
    // ==========================================

    const navigate = useNavigate();


    // ==========================================
    // Form State
    // ==========================================

    const [department, setDepartment] = useState("");

    const [doctors, setDoctors] = useState([]);

    const [doctor, setDoctor] = useState("");

    const [appointmentDate, setAppointmentDate] = useState("");

    const [timeSlots, setTimeSlots] = useState([]);

    const [timeSlot, setTimeSlot] = useState("");

    const [reason, setReason] = useState("");

    const [symptoms, setSymptoms] = useState("");


    // ==========================================
    // Loading State
    // ==========================================

    const [doctorLoading, setDoctorLoading] =
        useState(false);

    const [slotLoading, setSlotLoading] =
        useState(false);

    const [submitLoading, setSubmitLoading] =
        useState(false);


    // ==========================================
    // Error State
    // ==========================================

    const [errors, setErrors] = useState({});

    const [apiError, setApiError] = useState("");


    // ==========================================
    // Load Doctors By Department
    // ==========================================

    useEffect(() => {

        // Reset doctor and slots
        setDoctors([]);
        setDoctor("");
        setTimeSlots([]);
        setTimeSlot("");


        if (!department) {

            return;

        }


        const loadDoctors = async () => {

            try {

                setDoctorLoading(true);

                setApiError("");


                const response =
                    await getDoctorsByDepartment(
                        department
                    );


                console.log(
                    "Doctors API Response:",
                    response.data
                );


                const doctorList =
                    response.data?.results || [];


                setDoctors(doctorList);

            }

            catch (error) {

                console.error(
                    "Doctor Load Error:",
                    error
                );


                setDoctors([]);


                setApiError(
                    "Failed to load doctors. Please try again."
                );

            }

            finally {

                setDoctorLoading(false);

            }

        };


        loadDoctors();

    }, [department]);


    // ==========================================
    // Load Available Time Slots
    // Doctor + Date Required
    // ==========================================

    useEffect(() => {

        // Reset previous slot
        setTimeSlots([]);
        setTimeSlot("");


        // Doctor and date both required
        if (!doctor || !appointmentDate) {

            return;

        }


        const loadTimeSlots = async () => {

            try {

                setSlotLoading(true);

                setApiError("");


                const response =
                    await getAvailableTimeSlots(
                        doctor,
                        appointmentDate
                    );


                console.log(
                    "Time Slot API Response:",
                    response.data
                );


                const slotList =
                    response.data?.results || [];


                setTimeSlots(slotList);

            }

            catch (error) {

                console.error(
                    "Time Slot Load Error:",
                    error
                );


                console.error(
                    "Server Response:",
                    error.response?.data
                );


                setTimeSlots([]);


                if (
                    error.response?.data?.detail
                ) {

                    setApiError(
                        error.response.data.detail
                    );

                }

                else {

                    setApiError(
                        "No available time slots for this doctor on the selected date."
                    );

                }

            }

            finally {

                setSlotLoading(false);

            }

        };


        loadTimeSlots();

    }, [doctor, appointmentDate]);


    // ==========================================
    // Handle Department Change
    // ==========================================

    const handleDepartmentChange = (e) => {

        setDepartment(e.target.value);

        setErrors((previous) => ({

            ...previous,

            department: "",

        }));

    };


    // ==========================================
    // Handle Submit
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        const validationErrors = {};


        if (!department) {

            validationErrors.department =
                "Please select a department.";

        }


        if (!doctor) {

            validationErrors.doctor =
                "Please select a doctor.";

        }


        if (!appointmentDate) {

            validationErrors.appointmentDate =
                "Please select an appointment date.";

        }


        if (!timeSlot) {

            validationErrors.timeSlot =
                "Please select an available time.";

        }


        if (!reason.trim()) {

            validationErrors.reason =
                "Please describe the reason for your visit.";

        }


        setErrors(validationErrors);


        // Stop if validation failed
        if (
            Object.keys(validationErrors).length > 0
        ) {

            return;

        }


        // ==========================================
        // Appointment Payload
        // ==========================================

        const appointmentData = {

            doctor: Number(doctor),

            slot: Number(timeSlot),

            appointment_date: appointmentDate,

            reason: reason.trim(),

            symptoms: symptoms.trim(),

        };


        console.log(
            "Appointment Payload:",
            appointmentData
        );


        try {

            setSubmitLoading(true);

            setApiError("");


            const response =
                await bookAppointment(
                    appointmentData
                );


            console.log(
                "Appointment Success:",
                response.data
            );


            alert(
                response.data?.message ||
                "Appointment booked successfully."
            );


            // Redirect
            navigate("/appointments");


        }

        catch (error) {

            console.error(
                "Appointment Booking Error:",
                error
            );


            console.error(
                "Server Error:",
                error.response?.data
            );


            if (
                error.response?.data
            ) {

                const serverErrors =
                    error.response.data;


                const message =
                    Object.values(serverErrors)
                        .flat()
                        .join("\n");


                setApiError(
                    message ||
                    "Appointment booking failed."
                );

            }

            else {

                setApiError(
                    "Unable to connect to the server."
                );

            }

        }

        finally {

            setSubmitLoading(false);

        }

    };


    // ==========================================
    // Render
    // ==========================================

    return (

        <div className="appointment-page">

            <div className="appointment-container">


                {/* ======================================
                    Header
                ====================================== */}

                <div className="appointment-header">

                    <h2>
                        Book an Appointment
                    </h2>

                    <p>
                        Select your department, doctor,
                        preferred date and available time.
                    </p>

                </div>


                {/* ======================================
                    API Error
                ====================================== */}

                {apiError && (

                    <div className="appointment-api-error">

                        {apiError}

                    </div>

                )}


                <form onSubmit={handleSubmit}>


                    {/* ==================================
                        Department
                    ================================== */}

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


                    {/* ==================================
                        Doctor
                    ================================== */}

                    <div className="form-group">

                        <label>

                            Doctor

                        </label>


                        <select

                            value={doctor}

                            disabled={
                                !department ||
                                doctorLoading
                            }

                            onChange={(e) => {

                                setDoctor(
                                    e.target.value
                                );

                                setErrors(
                                    (previous) => ({

                                        ...previous,

                                        doctor: "",

                                    })
                                );

                            }}

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


                            {doctors.map(
                                (doctorItem) => (

                                    <option

                                        key={
                                            doctorItem.id
                                        }

                                        value={
                                            doctorItem.id
                                        }

                                    >

                                        {doctorItem.doctor_name}

                                        {" — "}

                                        {
                                            doctorItem.specialization
                                        }

                                        {" — ৳"}

                                        {
                                            doctorItem.consultation_fee
                                        }

                                    </option>

                                )
                            )}

                        </select>


                        {errors.doctor && (

                            <p className="error-text">

                                {errors.doctor}

                            </p>

                        )}

                    </div>


                    {/* ==================================
                        Appointment Date
                    ================================== */}

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

                                setErrors(
                                    (previous) => ({

                                        ...previous,

                                        appointmentDate: "",

                                    })
                                );

                            }}

                        />


                        {errors.appointmentDate && (

                            <p className="error-text">

                                {
                                    errors.appointmentDate
                                }

                            </p>

                        )}

                    </div>


                    {/* ==================================
                        Available Time
                    ================================== */}

                    <div className="form-group">

                        <label>

                            Available Time

                        </label>


                        <select

                            value={timeSlot}

                            disabled={
                                !doctor ||
                                !appointmentDate ||
                                slotLoading
                            }

                            onChange={(e) => {

                                setTimeSlot(
                                    e.target.value
                                );

                                setErrors(
                                    (previous) => ({

                                        ...previous,

                                        timeSlot: "",

                                    })
                                );

                            }}

                        >

                            <option value="">

                                {!doctor

                                    ? "Select Doctor First"

                                    : !appointmentDate

                                        ? "Select Date First"

                                        : slotLoading

                                            ? "Loading Available Times..."

                                            : timeSlots.length === 0

                                                ? "No Available Time"

                                                : "Select Available Time"

                                }

                            </option>


                            {timeSlots.map(
                                (slot) => (

                                    <option

                                        key={slot.id}

                                        value={slot.id}

                                        disabled={slot.is_full}

                                    >

                                        {slot.slot_time}

                                        {" — "}

                                        {slot.booked_count}/
                                        {slot.max_patient}

                                        {" booked"}

                                        {slot.is_full

                                            ? " (FULL)"

                                            : ""

                                        }

                                    </option>

                                )
                            )}

                        </select>


                        {errors.timeSlot && (

                            <p className="error-text">

                                {errors.timeSlot}

                            </p>

                        )}

                    </div>


                    {/* ==================================
                        Reason
                    ================================== */}

                    <div className="form-group">

                        <label>

                            Reason for Visit

                        </label>


                        <textarea

                            rows="4"

                            value={reason}

                            placeholder={
                                "Describe the reason for your appointment..."
                            }

                            onChange={(e) => {

                                setReason(
                                    e.target.value
                                );

                                setErrors(
                                    (previous) => ({

                                        ...previous,

                                        reason: "",

                                    })
                                );

                            }}

                        />


                        {errors.reason && (

                            <p className="error-text">

                                {errors.reason}

                            </p>

                        )}

                    </div>


                    {/* ==================================
                        Symptoms
                    ================================== */}

                    <div className="form-group">

                        <label>

                            Symptoms (Optional)

                        </label>


                        <textarea

                            rows="3"

                            value={symptoms}

                            placeholder={
                                "Example: Fever, headache, chest pain..."
                            }

                            onChange={(e) =>
                                setSymptoms(
                                    e.target.value
                                )
                            }

                        />

                    </div>


                    {/* ==================================
                        Submit
                    ================================== */}

                    <button

                        type="submit"

                        className="appointment-btn"

                        disabled={submitLoading}

                    >

                        {submitLoading

                            ? "Booking Appointment..."

                            : "Confirm Appointment"

                        }

                    </button>


                </form>

            </div>

        </div>

    );

}


export default BookAppointment;