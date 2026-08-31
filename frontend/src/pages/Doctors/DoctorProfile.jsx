import {
    useEffect,
    useState,
} from "react";

import {
    getDoctorProfile,
} from "../../services/doctorService";


// ==========================================================
// Doctor Profile
// ==========================================================

export default function DoctorProfile() {


    // ======================================================
    // State
    // ======================================================

    const [
        doctor,
        setDoctor,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    // ======================================================
    // Load Doctor Profile
    // ======================================================

    const loadProfile = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await getDoctorProfile();


            console.log(
                "Doctor Profile Response:",
                response.data
            );


            let profileData =
                response.data;


            // Handle nested response
            if (
                response.data?.data
                &&
                typeof response.data.data === "object"
            ) {

                profileData =
                    response.data.data;

            }


            setDoctor(
                profileData
            );


        } catch (err) {

            console.error(
                "Doctor Profile Error:",
                err.response?.data || err
            );


            setError(

                err?.response?.data?.message ||

                err?.response?.data?.detail ||

                "Unable to load doctor profile."

            );


        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // Load Profile
    // ======================================================

    useEffect(() => {

        loadProfile();

    }, []);


    // ======================================================
    // Loading Screen
    // ======================================================

    if (loading) {

        return (

            <div className="container-fluid py-5">

                <div className="text-center">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >

                        <span className="visually-hidden">

                            Loading...

                        </span>

                    </div>


                    <p className="text-muted mt-3">

                        Loading doctor profile...

                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // Error Screen
    // ======================================================

    if (error && !doctor) {

        return (

            <div className="container-fluid py-4">

                <div className="alert alert-danger">

                    <div className="d-flex justify-content-between align-items-center">

                        <div>

                            <strong>
                                Error:
                            </strong>

                            {" "}

                            {error}

                        </div>


                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={loadProfile}
                        >

                            Try Again

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // ======================================================
    // Helper Values
    // ======================================================

    const doctorName =

        doctor?.doctor_name ||

        doctor?.name ||

        doctor?.user?.name ||

        doctor?.user?.username ||

        "Doctor";


    const email =

        doctor?.email ||

        doctor?.user?.email ||

        "-";


    const phone =

        doctor?.phone ||

        doctor?.phone_number ||

        doctor?.user?.phone ||

        "-";


    const department =

        doctor?.department_name ||

        doctor?.department?.name ||

        doctor?.department ||

        "-";


    const specialization =

        doctor?.specialization ||

        "-";


    const qualification =

        doctor?.qualification ||

        doctor?.education ||

        "-";


    const experience =

        doctor?.experience ||

        doctor?.experience_years ||

        doctor?.years_of_experience ||

        "-";


    const consultationFee =

        doctor?.consultation_fee ??

        doctor?.fee ??

        0;


    const bio =

        doctor?.bio ||

        doctor?.about ||

        doctor?.description ||

        "No professional biography available.";


    const profileImage =

        doctor?.profile_image ||

        doctor?.image ||

        doctor?.photo ||

        null;


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="container-fluid py-4">


            {/* ==================================================
                Header
            ================================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">

                        Doctor Profile

                    </h2>


                    <p className="text-muted mb-0">

                        View your professional information

                    </p>

                </div>


                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadProfile}
                >

                    <i className="fas fa-sync-alt me-2" />

                    Refresh

                </button>

            </div>


            {/* ==================================================
                Error Alert
            ================================================== */}

            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            {/* ==================================================
                Profile Card
            ================================================== */}

            <div className="row g-4">


                {/* ==============================================
                    Left Profile Card
                ============================================== */}

                <div className="col-lg-4">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body text-center py-5">


                            {/* Profile Image */}

                            <div className="mb-4">

                                {profileImage ? (

                                    <img
                                        src={profileImage}
                                        alt={doctorName}
                                        className="rounded-circle border"
                                        style={{
                                            width: "150px",
                                            height: "150px",
                                            objectFit: "cover",
                                        }}
                                    />

                                ) : (

                                    <div
                                        className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                                        style={{
                                            width: "150px",
                                            height: "150px",
                                            fontSize: "60px",
                                        }}
                                    >

                                        <i className="fas fa-user-md" />

                                    </div>

                                )}

                            </div>


                            {/* Name */}

                            <h4 className="fw-bold mb-2">

                                {doctorName}

                            </h4>


                            {/* Specialization */}

                            <p className="text-primary fw-semibold mb-2">

                                {specialization}

                            </p>


                            {/* Department */}

                            <p className="text-muted mb-4">

                                <i className="fas fa-hospital me-2" />

                                {department}

                            </p>


                            <hr />


                            {/* Fee */}

                            <div className="row text-center mt-4">

                                <div className="col-12">

                                    <small className="text-muted">

                                        Consultation Fee

                                    </small>


                                    <h4 className="fw-bold text-success mt-1">

                                        ৳ {consultationFee}

                                    </h4>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==============================================
                    Right Information
                ============================================== */}

                <div className="col-lg-8">


                    {/* Professional Information */}

                    <div className="card border-0 shadow-sm mb-4">

                        <div className="card-header bg-white py-3">

                            <h5 className="fw-bold mb-0">

                                <i className="fas fa-user-md me-2 text-primary" />

                                Professional Information

                            </h5>

                        </div>


                        <div className="card-body">


                            <div className="row g-4">


                                {/* Full Name */}

                                <div className="col-md-6">

                                    <small className="text-muted">

                                        Full Name

                                    </small>


                                    <p className="fw-semibold mb-0">

                                        {doctorName}

                                    </p>

                                </div>


                                {/* Email */}

                                <div className="col-md-6">

                                    <small className="text-muted">

                                        Email Address

                                    </small>


                                    <p className="fw-semibold mb-0">

                                        {email}

                                    </p>

                                </div>


                                {/* Phone */}

                                <div className="col-md-6">

                                    <small className="text-muted">

                                        Phone Number

                                    </small>


                                    <p className="fw-semibold mb-0">

                                        {phone}

                                    </p>

                                </div>


                                {/* Department */}

                                <div className="col-md-6">

                                    <small className="text-muted">

                                        Department

                                    </small>


                                    <p className="fw-semibold mb-0">

                                        {department}

                                    </p>

                                </div>


                                {/* Specialization */}

                                <div className="col-md-6">

                                    <small className="text-muted">

                                        Specialization

                                    </small>


                                    <p className="fw-semibold mb-0">

                                        {specialization}

                                    </p>

                                </div>


                                {/* Qualification */}

                                <div className="col-md-6">

                                    <small className="text-muted">

                                        Qualification

                                    </small>


                                    <p className="fw-semibold mb-0">

                                        {qualification}

                                    </p>

                                </div>


                                {/* Experience */}

                                <div className="col-md-6">

                                    <small className="text-muted">

                                        Experience

                                    </small>


                                    <p className="fw-semibold mb-0">

                                        {experience}

                                    </p>

                                </div>


                                {/* Fee */}

                                <div className="col-md-6">

                                    <small className="text-muted">

                                        Consultation Fee

                                    </small>


                                    <p className="fw-semibold mb-0 text-success">

                                        ৳ {consultationFee}

                                    </p>

                                </div>


                            </div>

                        </div>

                    </div>


                    {/* About */}

                    <div className="card border-0 shadow-sm">

                        <div className="card-header bg-white py-3">

                            <h5 className="fw-bold mb-0">

                                <i className="fas fa-info-circle me-2 text-primary" />

                                About Doctor

                            </h5>

                        </div>


                        <div className="card-body">

                            <p className="text-muted mb-0">

                                {bio}

                            </p>

                        </div>

                    </div>


                </div>

            </div>

        </div>

    );

}