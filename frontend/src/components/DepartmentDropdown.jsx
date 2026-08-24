import { useEffect, useState } from "react";

import { getDepartments } from "../services/departmentService";


function DepartmentDropdown({

    selectedDepartment,

    onDepartmentChange,

}) {

    // ==========================================
    // State
    // ==========================================

    const [departments, setDepartments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==========================================
    // Load Departments
    // ==========================================

    useEffect(() => {

        const loadDepartments = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await getDepartments();


                console.log(
                    "Department API Response:",
                    response.data
                );


                const departmentList =
                    response.data?.results || [];


                setDepartments(
                    departmentList
                );

            }

            catch (error) {

                console.error(
                    "Department Load Error:",
                    error
                );

                console.error(
                    "Status:",
                    error.response?.status
                );

                console.error(
                    "Response:",
                    error.response?.data
                );


                setDepartments([]);


                if (
                    error.response?.status === 401
                ) {

                    setError(
                        "Session expired. Please login again."
                    );

                }

                else {

                    setError(
                        "Failed to load departments."
                    );

                }

            }

            finally {

                setLoading(false);

            }

        };


        loadDepartments();

    }, []);


    // ==========================================
    // Render
    // ==========================================

    return (

        <div className="form-group">

            <label>

                Department

            </label>


            <select

                value={selectedDepartment}

                onChange={onDepartmentChange}

                disabled={loading}

            >

                <option value="">

                    {loading

                        ? "Loading Departments..."

                        : departments.length === 0

                            ? "No Departments Available"

                            : "Select Department"

                    }

                </option>


                {departments.map((department) => (

                    <option

                        key={department.id}

                        value={department.id}

                    >

                        {department.name}

                    </option>

                ))}

            </select>


            {error && (

                <p className="error-text">

                    {error}

                </p>

            )}

        </div>

    );

}


export default DepartmentDropdown;