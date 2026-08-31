import {
    useEffect,
    useState,
} from "react";

import {
    getDoctorsByDepartment,
} from "../services/doctorService";


function DoctorDropdown({

    selectedDepartment,

    selectedDoctor,

    onDoctorChange,

}) {


    // ==========================================================
    // State
    // ==========================================================

    const [
        doctors,
        setDoctors,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    // ==========================================================
    // Load Doctors By Department
    // ==========================================================

    useEffect(() => {

        let cancelled = false;


        const loadDoctors = async () => {


            // --------------------------------------------------
            // No Department Selected
            // --------------------------------------------------

            if (!selectedDepartment) {

                if (!cancelled) {

                    setDoctors([]);

                    setError("");

                }

                return;

            }


            try {

                if (!cancelled) {

                    setLoading(true);

                    setError("");

                    setDoctors([]);

                }


                // --------------------------------------------------
                // API Request
                // --------------------------------------------------

                const response =
                    await getDoctorsByDepartment(
                        selectedDepartment
                    );


                if (cancelled) {
                    return;
                }


                // --------------------------------------------------
                // Ensure Array
                // --------------------------------------------------

                const doctorList =
                    Array.isArray(response?.data)
                        ? response.data
                        : [];


                setDoctors(
                    doctorList
                );


            } catch (error) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Doctor Load Error:",
                    error.response?.data || error
                );


                setDoctors([]);


                setError(

                    error?.response?.data?.detail ||

                    error?.response?.data?.message ||

                    "Failed to load doctors."

                );


            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        };


        loadDoctors();


        return () => {

            cancelled = true;

        };


    }, [
        selectedDepartment,
    ]);


    // ==========================================================
    // Render
    // ==========================================================

    return (

        <div className="form-group">


            {/* ==================================================
                Label
            ================================================== */}

            <label>

                Doctor

            </label>


            {/* ==================================================
                Dropdown
            ================================================== */}

            <select

                value={
                    selectedDoctor || ""
                }

                onChange={
                    onDoctorChange
                }

                disabled={

                    !selectedDepartment ||

                    loading

                }

            >


                {/* ==============================================
                    Default Option
                ============================================== */}

                <option value="">


                    {!selectedDepartment

                        ? "Select Department First"

                        : loading

                            ? "Loading Doctors..."

                            : doctors.length === 0

                                ? "No Doctors Available"

                                : "Select Doctor"

                    }


                </option>


                {/* ==============================================
                    Doctor List
                ============================================== */}

                {doctors.map(

                    (doctor) => (

                        <option

                            key={
                                doctor.id
                            }

                            value={
                                doctor.id
                            }

                        >

                            {
                                doctor.doctor_name ||
                                doctor.name ||
                                "Unknown Doctor"
                            }

                            {" — "}

                            {
                                doctor.specialization ||
                                "Specialist"
                            }


                        </option>

                    )

                )}


            </select>


            {/* ==================================================
                Error
            ================================================== */}

            {error && (

                <p className="error-text">

                    {error}

                </p>

            )}


        </div>

    );

}


export default DoctorDropdown;