import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
export default function Login() {

    const navigate = useNavigate();

    // ======================================
    // Form State
    // ======================================

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    // ======================================
    // UI State
    // ======================================

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ======================================
    // Handle Input Change
    // ======================================

    const handleChange = (event) => {

        setFormData((previousData) => ({
            ...previousData,
            [event.target.name]: event.target.value,
        }));

        setError("");

    };

    // ======================================
    // Handle Login
    // ======================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setLoading(true);
        setError("");

        try {

            const response = await loginUser(formData);

            const { access, refresh } = response.data;

            // Save JWT Tokens
            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);

            console.log("Login Successful");
            console.log(localStorage.getItem("access"));

            navigate("/dashboard");

        } catch (error) {

            console.error(error);

            if (error.response) {

                setError(
                    error.response.data.detail ||
                    "Invalid username or password."
                );

            } else {

                setError(
                    "Cannot connect to the server. Please try again later."
                );

            }

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-lg-5 col-md-7">

                    <div className="card shadow-lg border-0">

                        <div className="card-header bg-primary text-white text-center">

                            <h3>Doctor Appointment System</h3>

                            <p className="mb-0">
                                Login to Continue
                            </p>

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
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Logging in..."
                                        : "Login"}
                                </button>

                            </form>

                            <hr />

                            <div className="text-center">

                                <p>

                                    Don't have an account?

                                </p>

                                <Link
                                    to="/register"
                                    className="btn btn-success"
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