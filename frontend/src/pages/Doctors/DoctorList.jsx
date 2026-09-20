import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    FaSearch,
    FaUserMd,
    FaBriefcase,
    FaMoneyBillWave,
    FaEye,
    FaCalendarCheck,
    FaTimes,
    FaGraduationCap,
    FaHospital,
} from "react-icons/fa";
import { BACKEND_URL } from "../../config";

import {
    getDoctors,
    getDepartments,
    getDoctorById,
} from "../../services/doctorService";

import "./DoctorList.css";


// ==========================================================
// Helper: Normalize API List Response
// Supports:
// 1. Direct array response
// 2. Paginated response with { results: [...] }
// ==========================================================

const normalizeListResponse = (data) => {

    if (Array.isArray(data)) {

        return data;

    }


    if (Array.isArray(data?.results)) {

        return data.results;

    }


    return [];

};


// ==========================================================
// Helper: Get Backend Base URL
// ==========================================================

const getBackendUrl = () => {

    const apiBaseUrl = BACKEND_URL;


    if (apiBaseUrl) {

        try {

            const url = new URL(
                apiBaseUrl
            );


            return url.origin;

        } catch {

            // Continue to fallback

        }

    }


    return BACKEND_URL;

};


// ==========================================================
// Helper: Get Doctor Image URL
// ==========================================================

const getDoctorImageUrl = (
    imageUrl
) => {

    if (!imageUrl) {

        return null;

    }


    if (

        imageUrl.startsWith(
            "http://"
        )

        ||

        imageUrl.startsWith(
            "https://"
        )

    ) {

        return imageUrl;

    }


    const backendUrl =
        getBackendUrl();


    if (

        imageUrl.startsWith(
            "/"
        )

    ) {

        return `${backendUrl}${imageUrl}`;

    }


    return `${backendUrl}/${imageUrl}`;

};


// ==========================================================
// Helper: Format Consultation Fee
// ==========================================================

const formatFee = (
    fee
) => {

    const amount =
        Number(fee);


    if (

        !Number.isFinite(
            amount
        )

    ) {

        return "0.00";

    }


    return amount.toFixed(2);

};


function DoctorList() {

    const navigate =
        useNavigate();


    // ======================================================
    // States
    // ======================================================

    const [
        doctors,
        setDoctors,
    ] = useState([]);


    const [
        departments,
        setDepartments,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const [
        searchTerm,
        setSearchTerm,
    ] = useState("");


    const [
        selectedDepartment,
        setSelectedDepartment,
    ] = useState("");


    const [
        selectedDoctor,
        setSelectedDoctor,
    ] = useState(null);


    const [
        detailLoading,
        setDetailLoading,
    ] = useState(false);


    const [
        detailError,
        setDetailError,
    ] = useState("");


    // ======================================================
    // Safe Arrays
    // ======================================================

    const safeDoctors =
        Array.isArray(doctors)
            ? doctors
            : [];


    const safeDepartments =
        Array.isArray(departments)
            ? departments
            : [];


    // ======================================================
    // Load Doctors and Departments
    // ======================================================

    useEffect(() => {

        let isMounted = true;


        const loadData = async () => {

            try {

                if (isMounted) {

                    setLoading(true);

                    setError("");

                }


                const results =
                    await Promise.allSettled([

                        getDoctors(),

                        getDepartments(),

                    ]);


                const doctorsResult =
                    results[0];


                const departmentsResult =
                    results[1];


                if (!isMounted) {

                    return;

                }


                // --------------------------------------------------
                // Doctors
                // --------------------------------------------------

                if (

                    doctorsResult.status ===
                    "fulfilled"

                ) {

                    setDoctors(

                        normalizeListResponse(
                            doctorsResult.value.data
                        )

                    );

                } else {

                    console.error(
                        "Failed to load doctors:",
                        doctorsResult.reason
                    );

                    setDoctors([]);

                    setError(
                        "Unable to load doctors. Please try again."
                    );

                }


                // --------------------------------------------------
                // Departments
                // --------------------------------------------------

                if (

                    departmentsResult.status ===
                    "fulfilled"

                ) {

                    setDepartments(

                        normalizeListResponse(
                            departmentsResult.value.data
                        )

                    );

                } else {

                    console.error(
                        "Failed to load departments:",
                        departmentsResult.reason
                    );

                    setDepartments([]);

                }


            } catch (error) {

                console.error(
                    "Unexpected error:",
                    error
                );


                if (isMounted) {

                    setDoctors([]);

                    setDepartments([]);

                    setError(
                        "Unable to load doctors. Please try again."
                    );

                }


            } finally {

                if (isMounted) {

                    setLoading(false);

                }

            }

        };


        loadData();


        return () => {

            isMounted = false;

        };


    }, []);


    // ======================================================
    // Filter Doctors
    // ======================================================

    const searchText =
        searchTerm
            .trim()
            .toLowerCase();


    const filteredDoctors =
        safeDoctors.filter(
            (doctor) => {

                const doctorName =
                    String(
                        doctor?.doctor_name || ""
                    ).toLowerCase();


                const specialization =
                    String(
                        doctor?.specialization || ""
                    ).toLowerCase();


                const qualification =
                    String(
                        doctor?.qualification || ""
                    ).toLowerCase();


                const departmentName =
                    String(
                        doctor?.department_name || ""
                    ).toLowerCase();


                const matchesSearch =

                    !searchText

                    ||

                    doctorName.includes(
                        searchText
                    )

                    ||

                    specialization.includes(
                        searchText
                    )

                    ||

                    qualification.includes(
                        searchText
                    )

                    ||

                    departmentName.includes(
                        searchText
                    );


                const matchesDepartment =

                    !selectedDepartment

                    ||

                    String(
                        doctor?.department
                    ) ===
                    String(
                        selectedDepartment
                    );


                return (

                    matchesSearch

                    &&

                    matchesDepartment

                );

            }
        );


    // ======================================================
    // View Doctor Details
    // ======================================================

    const handleViewDetails = async (
        doctorId
    ) => {

        if (!doctorId) {

            return;

        }


        try {

            setDetailLoading(true);

            setDetailError("");

            setSelectedDoctor(null);


            const response =
                await getDoctorById(
                    doctorId
                );


            setSelectedDoctor(
                response?.data || null
            );


        } catch (error) {

            console.error(
                "Failed to load doctor details:",
                error
            );


            setDetailError(
                "Unable to load doctor details. Please try again."
            );


        } finally {

            setDetailLoading(false);

        }

    };


    // ======================================================
    // Book Appointment
    // ======================================================

    const handleBookAppointment = (
        doctor
    ) => {

        if (!doctor?.id) {

            alert(
                "Invalid doctor information."
            );

            return;

        }


        navigate(
            "/appointments/book",
            {
                state: {
                    selectedDoctor: doctor,
                },
            }
        );

    };


    // ======================================================
    // Clear Filters
    // ======================================================

    const handleClearFilters = () => {

        setSearchTerm("");

        setSelectedDepartment("");

    };


    // ======================================================
    // Close Modal
    // ======================================================

    const handleCloseModal = () => {

        setSelectedDoctor(null);

        setDetailLoading(false);

        setDetailError("");

    };


    // ======================================================
    // Render
    // ======================================================

    return (

        <div className="doctor-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="doctor-page-header">

                <div>

                    <h1>

                        <FaUserMd />

                        Find a Doctor

                    </h1>


                    <p>

                        Find the right specialist
                        and book your appointment.

                    </p>

                </div>


                <div className="doctor-count">

                    {filteredDoctors.length}

                    <span>

                        Doctors Found

                    </span>

                </div>

            </div>



            {/* =================================================
                SEARCH AND FILTER
            ================================================= */}

            <div className="doctor-filter-card">


                {/* Search */}

                <div className="doctor-search-box">

                    <label>

                        Search Doctor

                    </label>


                    <div className="search-input-wrapper">

                        <FaSearch />


                        <input

                            type="text"

                            placeholder="Search by doctor name, specialization or department"

                            value={
                                searchTerm
                            }

                            onChange={
                                (event) =>

                                    setSearchTerm(
                                        event.target.value
                                    )
                            }

                        />

                    </div>

                </div>



                {/* Department */}

                <div className="doctor-department-filter">

                    <label>

                        Department

                    </label>


                    <select

                        value={
                            selectedDepartment
                        }

                        onChange={
                            (event) =>

                                setSelectedDepartment(
                                    event.target.value
                                )
                        }

                    >

                        <option value="">

                            All Departments

                        </option>


                        {

                            safeDepartments.map(
                                (department) => (

                                    <option

                                        key={
                                            department.id
                                        }

                                        value={
                                            department.id
                                        }

                                    >

                                        {
                                            department.name
                                        }

                                    </option>

                                )
                            )

                        }

                    </select>

                </div>



                {/* Clear */}

                <button

                    type="button"

                    className="clear-filter-btn"

                    onClick={
                        handleClearFilters
                    }

                >

                    Clear

                </button>


            </div>



            {/* =================================================
                LOADING
            ================================================= */}

            {

                loading

                &&

                (

                    <div className="doctor-message-card">

                        <div className="doctor-loader">

                        </div>


                        <p>

                            Loading doctors...

                        </p>

                    </div>

                )

            }



            {/* =================================================
                ERROR
            ================================================= */}

            {

                !loading

                &&

                error

                &&

                (

                    <div className="doctor-message-card doctor-error">

                        <p>

                            {error}

                        </p>


                        <button

                            type="button"

                            onClick={
                                () =>
                                    window.location.reload()
                            }

                        >

                            Try Again

                        </button>

                    </div>

                )

            }



            {/* =================================================
                DOCTOR LIST
            ================================================= */}

            {

                !loading

                &&

                !error

                &&

                filteredDoctors.length > 0

                &&

                (

                    <div className="doctor-grid">

                        {

                            filteredDoctors.map(
                                (doctor) => {

                                    const imageUrl =
                                        getDoctorImageUrl(
                                            doctor.profile_image
                                        );


                                    return (

                                        <div

                                            className="doctor-card"

                                            key={
                                                doctor.id
                                            }

                                        >


                                            {/* Doctor Header */}

                                            <div className="doctor-card-header">


                                                <div className="doctor-avatar">

                                                    {

                                                        imageUrl

                                                        ? (

                                                            <img

                                                                src={
                                                                    imageUrl
                                                                }

                                                                alt={
                                                                    doctor.doctor_name
                                                                }

                                                                onError={
                                                                    (event) => {

                                                                        event.currentTarget.style.display =
                                                                            "none";

                                                                    }
                                                                }

                                                            />

                                                        )

                                                        : (

                                                            <FaUserMd />

                                                        )

                                                    }

                                                </div>


                                                <div className="doctor-basic-info">

                                                    <h3>

                                                        {
                                                            doctor.doctor_name
                                                            || "Doctor"
                                                        }

                                                    </h3>


                                                    <span className="doctor-specialization">

                                                        {
                                                            doctor.specialization
                                                            || "Specialist"
                                                        }

                                                    </span>

                                                </div>


                                            </div>



                                            {/* Department */}

                                            <div className="doctor-info-row">

                                                <FaHospital />

                                                <span>

                                                    {
                                                        doctor.department_name
                                                        || "Not specified"
                                                    }

                                                </span>

                                            </div>



                                            {/* Qualification */}

                                            <div className="doctor-info-row">

                                                <FaGraduationCap />

                                                <span>

                                                    {
                                                        doctor.qualification
                                                        || "Not specified"
                                                    }

                                                </span>

                                            </div>



                                            {/* Experience */}

                                            <div className="doctor-info-row">

                                                <FaBriefcase />

                                                <span>

                                                    {
                                                        doctor.experience
                                                        ?? 0
                                                    }{" "}

                                                    Years Experience

                                                </span>

                                            </div>



                                            {/* Fee */}

                                            <div className="doctor-fee">

                                                <div>

                                                    <FaMoneyBillWave />

                                                    Consultation Fee

                                                </div>


                                                <strong>

                                                    ৳{
                                                        formatFee(
                                                            doctor.consultation_fee
                                                        )
                                                    }

                                                </strong>

                                            </div>



                                            {/* Status */}

                                            <div className="doctor-status-row">

                                                <span className="doctor-status available">

                                                    Available

                                                </span>

                                            </div>



                                            {/* Actions */}

                                            <div className="doctor-actions">

                                                <button

                                                    type="button"

                                                    className="doctor-details-btn"

                                                    onClick={
                                                        () =>
                                                            handleViewDetails(
                                                                doctor.id
                                                            )
                                                    }

                                                >

                                                    <FaEye />

                                                    Details

                                                </button>


                                                <button

                                                    type="button"

                                                    className="doctor-book-btn"

                                                    onClick={
                                                        () =>
                                                            handleBookAppointment(
                                                                doctor
                                                            )
                                                    }

                                                >

                                                    <FaCalendarCheck />

                                                    Book

                                                </button>

                                            </div>


                                        </div>

                                    );

                                }
                            )

                        }

                    </div>

                )

            }



            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {

                !loading

                &&

                !error

                &&

                filteredDoctors.length === 0

                &&

                (

                    <div className="doctor-message-card">

                        <FaUserMd className="empty-doctor-icon" />


                        <h3>

                            No Doctors Found

                        </h3>


                        <p>

                            No doctor matches your
                            search criteria.

                        </p>


                        <button

                            type="button"

                            onClick={
                                handleClearFilters
                            }

                        >

                            Clear Filters

                        </button>

                    </div>

                )

            }



            {/* =================================================
                DOCTOR DETAILS MODAL
            ================================================= */}

            {

                (

                    detailLoading

                    ||

                    detailError

                    ||

                    selectedDoctor

                )

                &&

                (

                    <div

                        className="doctor-modal-overlay"

                        onClick={
                            handleCloseModal
                        }

                    >

                        <div

                            className="doctor-modal"

                            onClick={
                                (event) =>
                                    event.stopPropagation()
                            }

                        >


                            {/* Close */}

                            <button

                                type="button"

                                className="doctor-modal-close"

                                onClick={
                                    handleCloseModal
                                }

                            >

                                <FaTimes />

                            </button>



                            {/* Detail Loading */}

                            {

                                detailLoading

                                &&

                                (

                                    <div className="modal-loading">

                                        Loading doctor details...

                                    </div>

                                )

                            }



                            {/* Detail Error */}

                            {

                                !detailLoading

                                &&

                                detailError

                                &&

                                (

                                    <div className="modal-loading">

                                        <p>

                                            {detailError}

                                        </p>

                                    </div>

                                )

                            }



                            {/* Doctor Details */}

                            {

                                !detailLoading

                                &&

                                selectedDoctor

                                &&

                                (

                                    <>

                                        <div className="doctor-modal-profile">


                                            <div className="doctor-modal-avatar">

                                                {

                                                    getDoctorImageUrl(
                                                        selectedDoctor.profile_image
                                                    )

                                                    ? (

                                                        <img

                                                            src={
                                                                getDoctorImageUrl(
                                                                    selectedDoctor.profile_image
                                                                )
                                                            }

                                                            alt={
                                                                selectedDoctor.doctor_name
                                                            }

                                                        />

                                                    )

                                                    : (

                                                        <FaUserMd />

                                                    )

                                                }

                                            </div>


                                            <div>

                                                <h2>

                                                    {
                                                        selectedDoctor.doctor_name
                                                        || "Doctor"
                                                    }

                                                </h2>


                                                <p>

                                                    {
                                                        selectedDoctor.specialization
                                                        || "Specialist"
                                                    }

                                                </p>

                                            </div>


                                        </div>



                                        <div className="doctor-modal-info">


                                            <div>

                                                <strong>

                                                    Department

                                                </strong>

                                                <span>

                                                    {
                                                        selectedDoctor.department_name
                                                        || "Not specified"
                                                    }

                                                </span>

                                            </div>



                                            <div>

                                                <strong>

                                                    Qualification

                                                </strong>

                                                <span>

                                                    {
                                                        selectedDoctor.qualification
                                                        || "Not specified"
                                                    }

                                                </span>

                                            </div>



                                            <div>

                                                <strong>

                                                    Experience

                                                </strong>

                                                <span>

                                                    {
                                                        selectedDoctor.experience
                                                        ?? 0
                                                    }{" "}

                                                    Years

                                                </span>

                                            </div>



                                            <div>

                                                <strong>

                                                    Consultation Fee

                                                </strong>

                                                <span>

                                                    ৳{
                                                        formatFee(
                                                            selectedDoctor.consultation_fee
                                                        )
                                                    }

                                                </span>

                                            </div>


                                        </div>



                                        <div className="doctor-biography">

                                            <h3>

                                                About Doctor

                                            </h3>


                                            <p>

                                                {
                                                    selectedDoctor.biography
                                                    ||
                                                    "No biography is available for this doctor."
                                                }

                                            </p>

                                        </div>



                                        <button

                                            type="button"

                                            className="doctor-modal-book-btn"

                                            onClick={
                                                () =>
                                                    handleBookAppointment(
                                                        selectedDoctor
                                                    )
                                            }

                                        >

                                            <FaCalendarCheck />

                                            Book Appointment

                                        </button>

                                    </>

                                )

                            }


                        </div>

                    </div>

                )

            }


        </div>

    );

}


export default DoctorList;