import { useEffect, useState } from "react";
import { getDepartments } from "../api/appointmentApi";

function DepartmentDropdown({
    selectedDepartment,
    onDepartmentChange,
}) {

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadDepartments = async () => {

            try {

                const response = await getDepartments();

                setDepartments(response.data);

            }

            catch (err) {

                console.error(err);

                setError("Failed to load departments.");

            }

            finally {

                setLoading(false);

            }

        };

        loadDepartments();

    }, []);

    if (loading) {

        return <p>Loading departments...</p>;

    }

    if (error) {

        return <p>{error}</p>;

    }

    return (

        <div className="form-group">

            <label>Department</label>

            <select
                value={selectedDepartment}
                onChange={onDepartmentChange}
            >

                <option value="">
                    Select Department
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

        </div>

    );
}

export default DepartmentDropdown;