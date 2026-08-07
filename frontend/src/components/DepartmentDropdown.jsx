import { useEffect, useState } from "react";
import { getDepartments } from "../services/departmentService";

function DepartmentDropdown({
    selectedDepartment,
    onDepartmentChange,
}) {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Print state on every render
    console.log("Departments State:", departments);

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                console.log("Loading departments...");

                const response = await getDepartments();

                console.log("Full Response:", response);
                console.log("Response Status:", response.status);
                console.log("Response Headers:", response.headers);
                console.log("Response Data:", response.data);

                if (Array.isArray(response.data.results)) {

                    setDepartments(response.data.results);

                } else {

                    console.error("Unexpected API Response:", response.data);

                    setDepartments([]);

                    setError("Invalid department data received.");

                }
            } catch (err) {
                console.error("Department Error:", err);

                if (err.response) {
                    console.log("Status:", err.response.status);
                    console.log("Response:", err.response.data);
                }

                setError("Failed to load departments.");
            } finally {
                setLoading(false);
            }
        };

        loadDepartments();
    }, []);

    if (loading) {
        return <p>Loading departments...</p>;
    }

    if (error) {
        return (
            <p style={{ color: "red" }}>
                {error}
            </p>
        );
    }

    return (
        <div className="form-group">
            <label htmlFor="department">
                Department
            </label>

            <select
                id="department"
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