import { useEffect, useState } from "react";

import { getDepartments } from "../services/departmentService";


function DepartmentDropdown({
    selectedDepartment,
    onDepartmentChange,
}) {

    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


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
                    "Departments API Response:",
                    response.data
                );


                // Django REST Framework Pagination
                setDepartments(
                    response.data.results || response.data
                );

            }

            catch (error) {

                console.error(
                    "Department Load Error:",
                    error
                );

                console.error(
                    "Department Error Response:",
                    error.response?.data
                );

                setError(
                    "Failed to load departments."
                );

            }

            finally {

                setLoading(false);

            }

        };


        loadDepartments();

    }, []);


    return (

        <div className="form-group">

            <label>Department</label>

            <select
                value={selectedDepartment}
                onChange={onDepartmentChange}
                disabled={loading}
            >

                <option value="">

                    {loading
                        ? "Loading departments..."
                        : "Select Department"}

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