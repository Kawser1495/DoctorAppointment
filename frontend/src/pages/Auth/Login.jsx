import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";

export default function Login() {
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    // Password Show/Hide
    const [showPassword, setShowPassword] = useState(false);

    // Loading
    const [loading, setLoading] = useState(false);

    // Error Message
    const [error, setError] = useState("");

    // Input Change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
    };

    // Login Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await loginUser(formData);


            console.log(response.data);

            // Save JWT Token
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            alert("Login Successful");

            navigate("/dashboard");
        } catch (err) {
            if (err.response) {
                setError(err.response.data.detail || "Login Failed");
            } else {
                setError("Server Error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-5">

                    <div className="card shadow-lg border-0">

                        <div className="card-header bg-primary text-white text-center">

                            <h3>Doctor Appointment System</h3>

                            <p className="mb-0">Login to Continue</p>

                        </div>

                        <div className="card-body">

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter Username"
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Password
                                    </label>

                                    <div className="input-group">

                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            className="form-control"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter Password"
                                            required
                                        />

                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                        >
                                            {showPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>

                                    </div>

                                </div>

                                <div className="d-flex justify-content-between mb-3">

                                    <div>

                                        <input
                                            type="checkbox"
                                            id="remember"
                                        />

                                        <label
                                            htmlFor="remember"
                                            className="ms-2"
                                        >
                                            Remember Me
                                        </label>

                                    </div>

                                    <Link to="#">
                                        Forgot Password?
                                    </Link>

                                </div>

                                <button
                                    className="btn btn-primary w-100"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Logging in..."
                                        : "Login"}
                                </button>

                            </form>

                            <hr />

                            <div className="text-center">

                                Don't have an account?

                                <br />

                                <Link
                                    to="/register"
                                    className="btn btn-success mt-2"
                                >
                                    Create Account
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}