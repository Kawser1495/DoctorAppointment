import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";

export default function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        role: "patient",
        password: "",
    });

    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        // Confirm Password Validation
        if (!confirmPassword) {
            alert("Confirm Password is required.");
            return;
        }

        if (formData.password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {

            await registerUser(formData);

            alert("Registration Successful!");

            navigate("/");

        } catch (error) {

            console.error(error);

            if (error.response) {

                alert(JSON.stringify(error.response.data));

            } else {

                alert("Server Error!");

            }

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-6">

                    <div className="card shadow-lg">

                        <div className="card-body">

                            <h2 className="text-center mb-4">
                                Doctor Appointment System
                            </h2>

                            <h4 className="text-center mb-4">
                                Create New Account
                            </h4>

                            <form onSubmit={handleSubmit}>

                                {/* Username */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        placeholder="Enter Username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Email */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        placeholder="Enter Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Phone */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Phone Number
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        placeholder="017XXXXXXXX"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Role */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Select Role
                                    </label>

                                    <select
                                        className="form-select"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >

                                        <option value="patient">
                                            Patient
                                        </option>

                                        <option value="doctor">
                                            Doctor
                                        </option>

                                    </select>

                                </div>

                                {/* Password */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        placeholder="Enter Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Confirm Password */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                    />

                                </div>

                                {/* Button */}

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Creating Account..."
                                        : "Create Account"}

                                </button>

                            </form>

                            <hr />

                            <div className="text-center">

                                Already have an account?

                                <br />

                                <Link to="/">
                                    Login Here
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}