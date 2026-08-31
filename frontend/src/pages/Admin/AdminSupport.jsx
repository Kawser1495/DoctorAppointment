import { useState } from "react";
import { Link } from "react-router-dom";


export default function AdminSupport() {

    const [showSystemInfo, setShowSystemInfo] = useState(false);


    return (

        <div className="admin-support-page">


            {/* ==================================================
                Header
            ================================================== */}

            <div className="support-header">

                <div>

                    <span className="breadcrumb">
                        Admin Panel / Support
                    </span>

                    <h1>
                        Help & Support
                    </h1>

                    <p>
                        Get assistance with the healthcare management system.
                    </p>

                </div>


                <Link
                    to="/admin/dashboard"
                    className="support-header-button"
                >
                    ← Dashboard
                </Link>

            </div>


            {/* ==================================================
                Support Cards
            ================================================== */}

            <div className="support-grid">


                {/* ==================================================
                    Contact Support
                ================================================== */}

                <div className="support-card">

                    <div className="support-icon support-icon-blue">
                        ?
                    </div>

                    <h3>
                        Contact Support
                    </h3>

                    <p>
                        Need help with the system? Contact the
                        support team for assistance.
                    </p>

                    <a
                        href="mailto:support@medicare.com"
                        className="support-button"
                    >
                        Contact Support
                    </a>

                </div>


                {/* ==================================================
                    Report Issue
                ================================================== */}

                <div className="support-card">

                    <div className="support-icon support-icon-red">
                        !
                    </div>

                    <h3>
                        Report an Issue
                    </h3>

                    <p>
                        Found a problem with the system?
                        Let us know about it.
                    </p>

                    <a
                        href="mailto:support@medicare.com?subject=System Issue"
                        className="support-button"
                    >
                        Report Issue
                    </a>

                </div>


                {/* ==================================================
                    System Information
                ================================================== */}

                <div className="support-card">

                    <div className="support-icon support-icon-green">
                        i
                    </div>

                    <h3>
                        System Information
                    </h3>

                    <p>
                        View system information and application
                        details.
                    </p>

                    <button
                        className="support-button"
                        type="button"
                        onClick={() =>
                            setShowSystemInfo(
                                (previous) => !previous
                            )
                        }
                    >
                        {showSystemInfo
                            ? "Hide Information"
                            : "View Information"
                        }
                    </button>

                </div>

            </div>


            {/* ==================================================
                System Information Panel
            ================================================== */}

            {showSystemInfo && (

                <div className="system-info-panel">

                    <div className="system-info-header">

                        <div>

                            <span className="system-info-label">
                                SYSTEM INFORMATION
                            </span>

                            <h2>
                                MediCare Healthcare System
                            </h2>

                        </div>

                        <button
                            type="button"
                            className="system-info-close"
                            onClick={() =>
                                setShowSystemInfo(false)
                            }
                        >
                            ×
                        </button>

                    </div>


                    <div className="system-info-grid">

                        <div className="system-info-item">

                            <span>
                                Application
                            </span>

                            <strong>
                                MediCare
                            </strong>

                        </div>


                        <div className="system-info-item">

                            <span>
                                User Role
                            </span>

                            <strong>
                                Administrator
                            </strong>

                        </div>


                        <div className="system-info-item">

                            <span>
                                Frontend
                            </span>

                            <strong>
                                React + Vite
                            </strong>

                        </div>


                        <div className="system-info-item">

                            <span>
                                Backend
                            </span>

                            <strong>
                                Django
                            </strong>

                        </div>


                        <div className="system-info-item">

                            <span>
                                Database
                            </span>

                            <strong>
                                MySQL
                            </strong>

                        </div>


                        <div className="system-info-item">

                            <span>
                                Environment
                            </span>

                            <strong>
                                Development
                            </strong>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                Back to Dashboard
            ================================================== */}

            <div className="support-back">

                <Link
                    to="/admin/dashboard"
                >
                    ← Back to Dashboard
                </Link>

            </div>


        </div>

    );

}