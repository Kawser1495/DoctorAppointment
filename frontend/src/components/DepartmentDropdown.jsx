import { useEffect, useState } from "react";

import {
    getDepartments
} from "../services/departmentService";


function DepartmentDropdown({

    selectedDepartment,

    onDepartmentChange,

}) {

    const [departments, setDepartments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadDepartments = async () => {

            try {

                setLoading(true);

                setError("");

                const response =
                    await getDepartments();

                const data = response.data;

                // Support paginated and normal response
                const departmentList =
                    Array.isArray(data)
                        ? data
                        : data.results || [];

                setDepartments(
                    departmentList
                );

            }

            catch (error) {

                console.error(
                    "Department Load Error:",
                    error
                );

                setError(
                    "Failed to load departments."
                );

                setDepartments([]);

            }

            finally {

                setLoading(false);

            }

        };


        loadDepartments();

    }, []);


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
                        : "Select Department"
                    }

                </option>


                {departments.map(
                    (department) => (

                        <option

                            key={department.id}

                            value={department.id}

                        >

                            {department.name}

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


export default DepartmentDropdown;