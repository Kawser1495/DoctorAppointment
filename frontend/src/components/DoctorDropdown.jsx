import { useEffect, useState } from "react";

import {
    getDoctorsByDepartment,
} from "../services/doctorService";


function DoctorDropdown({

    selectedDepartment,

    selectedDoctor,

    onDoctorChange,

}) {

    const [doctors, setDoctors] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadDoctors = async () => {

            // Department select না করলে
            // doctor list empty থাকবে

            if (!selectedDepartment) {

                setDoctors([]);

                return;

            }


            try {

                setLoading(true);

                setError("");


                const response =
                    await getDoctorsByDepartment(
                        selectedDepartment
                    );


                setDoctors(
                    response.data || []
                );

            }

            catch (error) {

                console.error(
                    "Doctor Load Error:",
                    error
                );


                setError(
                    "Failed to load doctors."
                );


                setDoctors([]);

            }

            finally {

                setLoading(false);

            }

        };


        loadDoctors();

    }, [selectedDepartment]);


    return (

        <div className="form-group">

            <label>
                Doctor
            </label>


            <select

                value={selectedDoctor}

                onChange={onDoctorChange}

                disabled={
                    !selectedDepartment ||
                    loading
                }

            >

                <option value="">

                    {!selectedDepartment
                        ? "Select Department First"
                        : loading
                            ? "Loading Doctors..."
                            : "Select Doctor"
                    }

                </option>


                {doctors.map(
                    (doctor) => (

                        <option

                            key={doctor.id}

                            value={doctor.id}

                        >

                            {doctor.doctor_name}

                            {" - "}

                            {doctor.specialization}

                        </option>

                    )
                )}

            </select>


            {error && (

                <p className="error-text">

                    {error}

                </p>

            )}

        </div>

    );

}


export default DoctorDropdown;