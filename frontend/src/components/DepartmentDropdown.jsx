import { useEffect, useState } from "react";

import { getDepartments } from "../api/appointmentApi";

function DepartmentDropdown({ selectedDepartment, onDepartmentChange }) {

    // সব Department এখানে থাকবে
    const [departments, setDepartments] = useState([]);

    // Loading দেখানোর জন্য
    const [loading, setLoading] = useState(true);

    // Error হলে দেখানোর জন্য
    const [error, setError] = useState("");

    useEffect(() => {

        loadDepartments();

    }, []);

    const loadDepartments = async () => {

        try {

            const response = await getDepartments();

            setDepartments(response.data);

        } catch (err) {

            console.error(err);

            setError("Failed to load departments.");

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return <p>Loading departments...</p>;

    }

    if (error) {

        return <p>{error}</p>;

    }

    return (

        <div>

            <label>

                Department

            </label>

            <select

                value={selectedDepartment}

                onChange={onDepartmentChange}

            >

                <option value="">

                    Select Department

                </option>

                {

                    departments.map((department) => (

                        <option

                            key={department.id}

                            value={department.id}

                        >

                            {department.name}

                        </option>

                    ))

                }

            </select>

        </div>

    );

}

export default DepartmentDropdown;