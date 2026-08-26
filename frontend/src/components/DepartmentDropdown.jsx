import { useEffect, useState } from "react";

import {
    getDepartments,
} from "../services/doctorService";


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

                setDepartments(
                    response.data || []
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

            <label htmlFor="department">

                Department

            </label>


            <select

                id="department"

                value={selectedDepartment || ""}

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