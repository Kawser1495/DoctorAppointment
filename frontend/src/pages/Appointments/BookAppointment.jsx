import {
    useState,
    useEffect,
    useMemo,
} from "react";

import {
    useNavigate,
    useLocation,
} from "react-router-dom";

import useAuth from "../../context/useAuth";

import DepartmentDropdown from "../../components/DepartmentDropdown";

import {
    getDoctorsByDepartment,
    getAvailableTimeSlots,
} from "../../services/doctorService";

import {
    bookAppointment,
} from "../../services/appointmentService";

import {
    fetchFamilyMembers,
} from "../../services/patientService";

import "../../styles/appointment.css";


// ==========================================================
// Helper Functions
// ==========================================================

const normalizeArrayResponse = (data) => {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    return [];
};


const getTodayDate = () => {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatSlotTime = (value) => {
    if (!value) return "";
    const [hours, minutes] = String(value).split(":");
    const date = new Date(2000, 0, 1, Number(hours), Number(minutes));
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const getSlotLabel = (slot) => {
    if (slot.time_range) return slot.time_range.replace(" - ", " – ");
    return formatSlotTime(slot.slot_time);
};


const getErrorMessage = (serverData) => {

    if (!serverData) {
        return "Unable to connect to the server.";
    }

    if (typeof serverData === "string") {
        return serverData;
    }

    if (serverData.detail) {

        if (Array.isArray(serverData.detail)) {
            return serverData.detail.join("\n");
        }

        return serverData.detail;
    }

    const messages = Object.entries(serverData)
        .flatMap(([field, value]) => {

            if (Array.isArray(value)) {

                return value.map(
                    (message) =>
                        `${field}: ${message}`
                );
            }

            if (
                value &&
                typeof value === "object"
            ) {

                return Object.values(value).flat();
            }

            return value
                ? [`${field}: ${value}`]
                : [];

        })
        .filter(Boolean);

    return (
        messages.join("\n")
        || "Appointment booking failed."
    );
};


// ==========================================================
// Component
// ==========================================================

function BookAppointment() {

    const navigate = useNavigate();

    const location = useLocation();
    const { user } = useAuth();


    // ======================================================
    // Doctor Received From DoctorList
    // ======================================================

    const selectedDoctor = useMemo(
        () =>
            location.state?.selectedDoctor
            || null,
        [location.state]
    );

    useEffect(() => {
        if (user && String(user.role || "").toLowerCase() !== "patient") {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate, user]);


    const selectedDoctorId = useMemo(
        () => {

            if (
                selectedDoctor?.id === undefined
                ||
                selectedDoctor?.id === null
            ) {
                return "";
            }

            return String(
                selectedDoctor.id
            );
        },
        [selectedDoctor]
    );


    const initialDepartment = useMemo(
        () => {

            if (
                selectedDoctor?.department === undefined
                ||
                selectedDoctor?.department === null
            ) {
                return "";
            }

            return String(
                selectedDoctor.department
            );
        },
        [selectedDoctor]
    );


    // ======================================================
    // Form State
    // ======================================================

    const [
        department,
        setDepartment,
    ] = useState(initialDepartment);


    const [
        doctors,
        setDoctors,
    ] = useState([]);


    const [
        doctor,
        setDoctor,
    ] = useState(selectedDoctorId);


    const [
        appointmentDate,
        setAppointmentDate,
    ] = useState("");


    const [
        timeSlots,
        setTimeSlots,
    ] = useState([]);


    const [
        timeSlot,
        setTimeSlot,
    ] = useState("");


    const [
        reason,
        setReason,
    ] = useState("");


    const [
        symptoms,
        setSymptoms,
    ] = useState("");


    // ======================================================
    // Family Member
    // ======================================================

    const [
        familyMembers,
        setFamilyMembers,
    ] = useState([]);


    const [
        appointmentFor,
        setAppointmentFor,
    ] = useState("self");


    const [
        familyMember,
        setFamilyMember,
    ] = useState("");


    const [
        familyLoading,
        setFamilyLoading,
    ] = useState(false);


    // ======================================================
    // Loading State
    // ======================================================

    const [
        doctorLoading,
        setDoctorLoading,
    ] = useState(false);


    const [
        slotLoading,
        setSlotLoading,
    ] = useState(false);


    const [
        submitLoading,
        setSubmitLoading,
    ] = useState(false);


    // ======================================================
    // Error State
    // ======================================================

    const [
        errors,
        setErrors,
    ] = useState({});


    const [
        apiError,
        setApiError,
    ] = useState("");


    // ======================================================
    // Load Family Members
    // ======================================================

    useEffect(() => {

        let cancelled = false;


        const loadFamilyMembers = async () => {

            try {

                setFamilyLoading(true);


                const response =
                    await fetchFamilyMembers();


                if (cancelled) {
                    return;
                }


                const members =
                    normalizeArrayResponse(
                        response.data?.data || response.data
                    );


                setFamilyMembers(
                    members
                );

            } catch (error) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Family Member Load Error:",
                    error
                );


                console.error(
                    "Family Member Server Response:",
                    error.response?.data
                );


                setFamilyMembers([]);


            } finally {

                if (!cancelled) {
                    setFamilyLoading(false);
                }

            }

        };


        loadFamilyMembers();


        return () => {
            cancelled = true;
        };

    }, []);


    // ======================================================
    // Load Doctors By Department
    // ======================================================

    useEffect(() => {

        let cancelled = false;


        const loadDoctors = async () => {

            if (!department) {

                if (!cancelled) {

                    setDoctors([]);

                    setDoctor("");

                    setTimeSlots([]);

                    setTimeSlot("");

                }

                return;
            }


            try {

                if (!cancelled) {

                    setDoctorLoading(true);

                    setApiError("");

                }


                const response =
                    await getDoctorsByDepartment(
                        department
                    );


                if (cancelled) {
                    return;
                }


                const doctorList =
                    normalizeArrayResponse(
                        response.data
                    );


                setDoctors(
                    doctorList
                );


                if (selectedDoctorId) {

                    const doctorExists =
                        doctorList.some(
                            (item) =>
                                String(item.id)
                                ===
                                selectedDoctorId
                        );


                    if (doctorExists) {

                        setDoctor(
                            selectedDoctorId
                        );

                    } else {

                        setDoctor("");

                    }
                }

            } catch (error) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Doctor Load Error:",
                    error
                );


                console.error(
                    "Doctor Server Response:",
                    error.response?.data
                );


                setDoctors([]);

                setDoctor("");

                setTimeSlots([]);

                setTimeSlot("");


                setApiError(
                    error.response?.data?.detail
                    ||
                    "Failed to load doctors. Please try again."
                );

            } finally {

                if (!cancelled) {
                    setDoctorLoading(false);
                }

            }

        };


        loadDoctors();


        return () => {
            cancelled = true;
        };

    }, [
        department,
        selectedDoctorId,
    ]);


    // ======================================================
    // Load Available Time Slots
    // ======================================================

    useEffect(() => {

        let cancelled = false;


        const loadTimeSlots = async () => {

            if (!cancelled) {

                setTimeSlots([]);

                setTimeSlot("");

            }


            if (
                !doctor
                ||
                !appointmentDate
            ) {
                return;
            }


            try {

                if (!cancelled) {

                    setSlotLoading(true);

                    setApiError("");

                }


                const response =
                    await getAvailableTimeSlots(
                        doctor,
                        appointmentDate
                    );


                if (cancelled) {
                    return;
                }


                const slotList =
                    normalizeArrayResponse(
                        response.data
                    );


                const availableSlots =
                    slotList.filter(
                        (slot) =>
                            slot.is_active !== false
                            &&
                            slot.is_full !== true
                    );


                setTimeSlots(
                    availableSlots
                );

            } catch (error) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Time Slot Load Error:",
                    error
                );


                setTimeSlots([]);


                setApiError(
                    getErrorMessage(
                        error.response?.data
                    )
                );

            } finally {

                if (!cancelled) {
                    setSlotLoading(false);
                }

            }

        };


        loadTimeSlots();


        return () => {
            cancelled = true;
        };

    }, [
        doctor,
        appointmentDate,
    ]);


    // ======================================================
    // Appointment For Change
    // ======================================================

    const handleAppointmentForChange = (
        event
    ) => {

        const value =
            event.target.value;


        setAppointmentFor(
            value
        );


        if (value === "self") {

            setFamilyMember("");

        }


        setErrors(
            (previous) => ({
                ...previous,
                familyMember: "",
            })
        );

    };


    // ======================================================
    // Family Member Change
    // ======================================================

    const handleFamilyMemberChange = (
        event
    ) => {

        setFamilyMember(
            event.target.value
        );


        setErrors(
            (previous) => ({
                ...previous,
                familyMember: "",
            })
        );

        setApiError("");

    };


    // ======================================================
    // Department Change
    // ======================================================

    const handleDepartmentChange = (
        event
    ) => {

        const newDepartment =
            event.target.value;


        setDepartment(
            newDepartment
        );


        setDoctor("");

        setTimeSlots([]);

        setTimeSlot("");


        setErrors(
            (previous) => ({
                ...previous,
                department: "",
                doctor: "",
                timeSlot: "",
            })
        );


        setApiError("");

    };


    // ======================================================
    // Doctor Change
    // ======================================================

    const handleDoctorChange = (
        event
    ) => {

        setDoctor(
            event.target.value
        );


        setTimeSlots([]);

        setTimeSlot("");


        setErrors(
            (previous) => ({
                ...previous,
                doctor: "",
                timeSlot: "",
            })
        );


        setApiError("");

    };


    // ======================================================
    // Date Change
    // ======================================================

    const handleDateChange = (
        event
    ) => {

        setAppointmentDate(
            event.target.value
        );


        setTimeSlots([]);

        setTimeSlot("");


        setErrors(
            (previous) => ({
                ...previous,
                appointmentDate: "",
                timeSlot: "",
            })
        );


        setApiError("");

    };


    // ======================================================
    // Time Slot Change
    // ======================================================

    const handleTimeSlotChange = (
        event
    ) => {

        setTimeSlot(
            event.target.value
        );


        setErrors(
            (previous) => ({
                ...previous,
                timeSlot: "",
            })
        );


        setApiError("");

    };


    // ======================================================
    // Submit Appointment
    // ======================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


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


        if (
            appointmentFor === "family"
            &&
            !familyMember
        ) {

            validationErrors.familyMember =
                "Please select a family member.";

        }


        if (!reason.trim()) {

            validationErrors.reason =
                "Please describe the reason for your visit.";

        }


        setErrors(
            validationErrors
        );


        if (
            Object.keys(
                validationErrors
            ).length > 0
        ) {
            return;
        }


        // ==================================================
        // Appointment Payload
        // ==================================================

        const appointmentData = {

            doctor:
                Number(doctor),

            slot:
                Number(timeSlot),

            appointment_date:
                appointmentDate,

            reason:
                reason.trim(),

            symptoms:
                symptoms.trim(),

        };


        // ==================================================
        // Add Family Member
        // ==================================================

        if (
            appointmentFor === "family"
            &&
            familyMember
        ) {

            appointmentData.family_member =
                Number(familyMember);

        }


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


            navigate(
                "/appointments/success",
                {
                    state: {
                        appointment:
                            response.data,
                    },

                    replace: true,
                }
            );


        } catch (error) {

            console.error(
                "Appointment Booking Error:",
                error
            );


            console.error(
                "Booking Server Response:",
                error.response?.data
            );


            setApiError(
                getErrorMessage(
                    error.response?.data
                )
            );


        } finally {

            setSubmitLoading(false);

        }

    };


    // ======================================================
    // Selected Doctor Information
    // ======================================================

    const selectedDoctorData =
        doctors.find(
            (item) =>
                String(item.id)
                ===
                String(doctor)
        );


    // ======================================================
    // Selected Family Member
    // ======================================================

    const selectedFamilyMember =
        familyMembers.find(
            (member) =>
                String(member.id)
                ===
                String(familyMember)
        );


    // ======================================================
    // Render
    // ======================================================

    return (

        <div className="appointment-page">

            <div className="appointment-container">


                {/* ==================================================
                    Header
                ================================================== */}

                <div className="appointment-header">

                    <h2>
                        Book an Appointment
                    </h2>

                    <p>
                        Select who the appointment is for,
                        doctor, date and available time.
                    </p>

                </div>


                {/* ==================================================
                    Appointment For
                ================================================== */}

                <div className="form-group">

                    <label>
                        Appointment For
                    </label>


                    <select
                        value={appointmentFor}
                        onChange={
                            handleAppointmentForChange
                        }
                        disabled={submitLoading}
                    >

                        <option value="self">
                            Myself
                        </option>

                        <option value="family">
                            Family Member
                        </option>

                    </select>

                </div>


                {/* ==================================================
                    Family Member
                ================================================== */}

                {appointmentFor === "family" && (

                    <div className="form-group">

                        <label>
                            Select Family Member
                        </label>


                        <select

                            value={familyMember}

                            onChange={
                                handleFamilyMemberChange
                            }

                            disabled={
                                familyLoading
                                ||
                                submitLoading
                            }

                        >

                            <option value="">

                                {
                                    familyLoading
                                        ? "Loading Family Members..."
                                        : familyMembers.length === 0
                                            ? "No Family Members Found"
                                            : "Select Family Member"
                                }

                            </option>


                            {familyMembers.map(
                                (member) => (

                                    <option
                                        key={member.id}
                                        value={member.id}
                                    >

                                        {member.name}

                                        {" — "}

                                        {member.relation}

                                        {" — Age "}

                                        {member.age}

                                    </option>

                                )
                            )}

                        </select>


                        {errors.familyMember && (

                            <p className="error-text">

                                {errors.familyMember}

                            </p>

                        )}

                    </div>

                )}


                {/* ==================================================
                    Selected Person
                ================================================== */}

                {appointmentFor === "family"
                    &&
                    selectedFamilyMember
                    && (

                        <div className="selected-doctor-info">

                            <strong>
                                Appointment Patient:
                            </strong>

                            {" "}

                            {selectedFamilyMember.name}

                            {" ("}

                            {selectedFamilyMember.relation}

                            {")"}

                        </div>

                    )}


                {/* ==================================================
                    Selected Doctor
                ================================================== */}

                {selectedDoctorData && (

                    <div className="selected-doctor-info">

                        <strong>
                            Selected Doctor:
                        </strong>

                        {" "}

                        {selectedDoctorData.doctor_name}

                        {" — "}

                        {
                            selectedDoctorData.specialization
                            || "Specialist"
                        }

                        {" — Consultation Fee: ৳"}

                        {
                            selectedDoctorData.consultation_fee
                            ?? 0
                        }

                    </div>

                )}


                {/* ==================================================
                    API Error
                ================================================== */}

                {apiError && (

                    <div className="appointment-api-error">

                        {apiError}

                    </div>

                )}


                {/* ==================================================
                    Form
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                >


                    {/* ==================================================
                        Department
                    ================================================== */}

                    <DepartmentDropdown

                        selectedDepartment={
                            department
                        }

                        onDepartmentChange={
                            handleDepartmentChange
                        }

                    />


                    {errors.department && (

                        <p className="error-text">

                            {errors.department}

                        </p>

                    )}


                    {/* ==================================================
                        Doctor
                    ================================================== */}

                    <div className="form-group">

                        <label>
                            Doctor
                        </label>


                        <select

                            value={doctor}

                            disabled={
                                !department
                                ||
                                doctorLoading
                            }

                            onChange={
                                handleDoctorChange
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

                                        {
                                            doctorItem.doctor_name
                                        }

                                        {" — "}

                                        {
                                            doctorItem.specialization
                                            ||
                                            "Specialist"
                                        }

                                        {" — ৳"}

                                        {
                                            doctorItem.consultation_fee
                                            ?? 0
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


                    {/* ==================================================
                        Appointment Date
                    ================================================== */}

                    <div className="form-group">

                        <label>
                            Appointment Date
                        </label>


                        <input

                            type="date"

                            value={
                                appointmentDate
                            }

                            min={
                                getTodayDate()
                            }

                            onChange={
                                handleDateChange
                            }

                        />


                        {errors.appointmentDate && (

                            <p className="error-text">

                                {
                                    errors.appointmentDate
                                }

                            </p>

                        )}

                    </div>


                    {/* ==================================================
                        Available Time
                    ================================================== */}

                    <div className="form-group">

                        <label>
                            Available Time
                        </label>


                        {slotLoading ? <div className="appointment-slot-state">Loading available time slots...</div> : !doctor || !appointmentDate ? <div className="appointment-slot-state">Select a doctor and date to view available time slots.</div> : timeSlots.length === 0 ? <div className="appointment-slot-state">No available time slots for this date.</div> : <div className="appointment-time-slots" role="radiogroup" aria-label="Available time slots">{timeSlots.map((slot) => <button key={slot.id} type="button" className={`appointment-time-slot ${String(timeSlot) === String(slot.id) ? "selected" : ""}`} onClick={() => handleTimeSlotChange({ target: { value: String(slot.id) } })} aria-pressed={String(timeSlot) === String(slot.id)}><strong>{getSlotLabel(slot)}</strong><span>{slot.remaining_seats ?? Math.max((slot.max_patient ?? 0) - (slot.booked_count ?? 0), 0)} seats available</span></button>)}</div>}


                        {errors.timeSlot && (

                            <p className="error-text">

                                {errors.timeSlot}

                            </p>

                        )}

                    </div>


                    {/* ==================================================
                        Result
                    ==================================================

                    <div
                        className="form-group"
                        style={{
                            display: "block",
                            width: "100%",
                            marginTop: "20px",
                            marginBottom: "20px"
                        }}
                    >

                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px"
                            }}
                        >
                            Result
                        </label>

                        <textarea
                            rows="3"
                            placeholder="Write result here..."
                            style={{
                                display: "block",
                                width: "100%",
                                minHeight: "80px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                padding: "10px",
                                background: "#fff"
                            }}
                        />

                    </div>
                    ================================================== */}

                    


                    {/* ==================================================
                        Reason
                    ================================================== */}

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

                            onChange={
                                (event) => {

                                    setReason(
                                        event.target.value
                                    );


                                    setErrors(
                                        (previous) => ({
                                            ...previous,
                                            reason: "",
                                        })
                                    );

                                }
                            }

                        />


                        {errors.reason && (

                            <p className="error-text">

                                {errors.reason}

                            </p>

                        )}

                    </div>


                    {/* ==================================================
                        Symptoms
                    ================================================== */}

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

                            onChange={
                                (event) =>
                                    setSymptoms(
                                        event.target.value
                                    )
                            }

                        />

                    </div>


                    {/* ==================================================
                        Buttons
                    ================================================== */}

                    <div className="appointment-actions">

                        <button

                            type="button"

                            className="appointment-cancel-btn"

                            disabled={
                                submitLoading
                            }

                            onClick={
                                () => navigate(-1)
                            }

                        >

                            Cancel

                        </button>


                        <button

                            type="submit"

                            className="appointment-btn"

                            disabled={
                                submitLoading
                            }

                        >

                            {
                                submitLoading
                                    ? "Booking Appointment..."
                                    : "Confirm Appointment"
                            }

                        </button>

                    </div>


                </form>

            </div>

        </div>

    );

}


export default BookAppointment;