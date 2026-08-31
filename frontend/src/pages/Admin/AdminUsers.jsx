import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    getAdminUsers,
} from "../../services/adminService";


// ==========================================================
// Admin - User Management
// ==========================================================

export default function AdminUsers() {

    // ======================================================
    // State
    // ======================================================

    const [users, setUsers] = useState([]);

    const [search, setSearch] = useState("");

    const [roleFilter, setRoleFilter] =
        useState("all");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ======================================================
    // Load Users
    // ======================================================

    const loadUsers = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await getAdminUsers();


            console.log(
                "Admin Users Response:",
                response
            );


            // ==================================================
            // Handle DRF Pagination
            // ==================================================

            let data = [];


            if (
                Array.isArray(
                    response?.data
                )
            ) {

                data =
                    response.data;

            }

            else if (
                Array.isArray(
                    response?.data?.results
                )
            ) {

                data =
                    response.data.results;

            }


            setUsers(data);


        } catch (err) {

            console.error(
                "Admin users loading error:",
                err
            );


            setUsers([]);


            setError(

                err?.response?.data?.detail ||

                err?.response?.data?.message ||

                "Unable to load users."

            );

        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // Load on Page Open
    // ======================================================

    useEffect(() => {

        loadUsers();

    }, []);


    // ======================================================
    // Filter Users
    // ======================================================

    const filteredUsers = useMemo(() => {

        return users.filter(
            (user) => {

                const searchText =
                    search
                        .trim()
                        .toLowerCase();


                const username =
                    String(
                        user.username || ""
                    ).toLowerCase();


                const fullName =
                    String(
                        user.full_name || ""
                    ).toLowerCase();


                const email =
                    String(
                        user.email || ""
                    ).toLowerCase();


                const matchesSearch =
                    !searchText ||

                    username.includes(
                        searchText
                    ) ||

                    fullName.includes(
                        searchText
                    ) ||

                    email.includes(
                        searchText
                    );


                const matchesRole =
                    roleFilter === "all" ||

                    String(
                        user.role || ""
                    ).toLowerCase() ===
                    roleFilter;


                const matchesStatus =
                    statusFilter === "all" ||

                    (
                        statusFilter === "active" &&
                        user.is_active === true
                    ) ||

                    (
                        statusFilter === "inactive" &&
                        user.is_active === false
                    );


                return (
                    matchesSearch &&
                    matchesRole &&
                    matchesStatus
                );

            }
        );

    }, [
        users,
        search,
        roleFilter,
        statusFilter,
    ]);


    // ======================================================
    // Statistics
    // ======================================================

    const totalUsers =
        users.length;


    const totalPatients =
        users.filter(
            (user) =>
                user.role === "patient"
        ).length;


    const totalDoctors =
        users.filter(
            (user) =>
                user.role === "doctor"
        ).length;


    const totalStaff =
        users.filter(
            (user) =>
                user.role === "receptionist"
        ).length;


    // ======================================================
    // Role Badge
    // ======================================================

    const getRoleBadge = (role) => {

        switch (
            String(role || "")
                .toLowerCase()
        ) {

            case "doctor":

                return "bg-success";

            case "patient":

                return "bg-primary";

            case "receptionist":

                return "bg-warning text-dark";

            case "admin":

                return "bg-danger";

            default:

                return "bg-secondary";

        }

    };


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="container-fluid py-5">

                <div className="text-center">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >

                        <span className="visually-hidden">
                            Loading...
                        </span>

                    </div>

                    <p className="text-muted mt-3">
                        Loading users...
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // Dashboard
    // ======================================================

    return (

        <div className="container-fluid py-4">


            {/* ==================================================
                Header
            ================================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">
                        User Management
                    </h2>

                    <p className="text-muted mb-0">
                        Manage patients, doctors and staff accounts
                    </p>

                </div>


                <div className="d-flex gap-2">

                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={loadUsers}
                    >

                        <i className="fas fa-sync-alt me-2" />

                        Refresh

                    </button>


                    <Link
                        to="/admin/dashboard"
                        className="btn btn-outline-secondary"
                    >

                        <i className="fas fa-arrow-left me-2" />

                        Dashboard

                    </Link>

                </div>

            </div>


            {/* ==================================================
                Error
            ================================================== */}

            {error && (

                <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                >

                    <strong>
                        Error:
                    </strong>{" "}

                    {error}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() =>
                            setError("")
                        }
                    />

                </div>

            )}


            {/* ==================================================
                Statistics
            ================================================== */}

            <div className="row g-4 mb-4">


                {/* Total */}

                <div className="col-xl-3 col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <p className="text-muted mb-1">
                                        Total Users
                                    </p>

                                    <h3 className="fw-bold mb-0">
                                        {totalUsers}
                                    </h3>

                                </div>

                                <div className="fs-2 text-primary">

                                    <i className="fas fa-users" />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Patients */}

                <div className="col-xl-3 col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <p className="text-muted mb-1">
                                        Patients
                                    </p>

                                    <h3 className="fw-bold text-primary mb-0">
                                        {totalPatients}
                                    </h3>

                                </div>

                                <div className="fs-2 text-primary">

                                    <i className="fas fa-user" />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Doctors */}

                <div className="col-xl-3 col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <p className="text-muted mb-1">
                                        Doctors
                                    </p>

                                    <h3 className="fw-bold text-success mb-0">
                                        {totalDoctors}
                                    </h3>

                                </div>

                                <div className="fs-2 text-success">

                                    <i className="fas fa-user-md" />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Staff */}

                <div className="col-xl-3 col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <p className="text-muted mb-1">
                                        Staff
                                    </p>

                                    <h3 className="fw-bold text-warning mb-0">
                                        {totalStaff}
                                    </h3>

                                </div>

                                <div className="fs-2 text-warning">

                                    <i className="fas fa-user-tie" />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                User Table
            ================================================== */}

            <div className="card border-0 shadow-sm">


                {/* ==================================================
                    Filters
                ================================================== */}

                <div className="card-header bg-white py-3">

                    <div className="row g-3 align-items-center">


                        {/* Search */}

                        <div className="col-xl-5 col-lg-5">

                            <div className="input-group">

                                <span className="input-group-text bg-white">

                                    <i className="fas fa-search" />

                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search name, username or email..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* Role */}

                        <div className="col-xl-2 col-lg-2">

                            <select
                                className="form-select"
                                value={roleFilter}
                                onChange={(event) =>
                                    setRoleFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="all">
                                    All Roles
                                </option>

                                <option value="patient">
                                    Patients
                                </option>

                                <option value="doctor">
                                    Doctors
                                </option>

                                <option value="receptionist">
                                    Staff
                                </option>

                                <option value="admin">
                                    Admins
                                </option>

                            </select>

                        </div>


                        {/* Status */}

                        <div className="col-xl-2 col-lg-2">

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="all">
                                    All Status
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>

                            </select>

                        </div>


                        {/* Result */}

                        <div className="col-xl-3 col-lg-3 text-lg-end">

                            <span className="text-muted">

                                Showing{" "}

                                <strong>
                                    {filteredUsers.length}
                                </strong>

                                {" "}of{" "}

                                <strong>
                                    {users.length}
                                </strong>

                                {" "}users

                            </span>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    Table
                ================================================== */}

                <div className="card-body p-0">


                    {filteredUsers.length === 0 && (

                        <div className="text-center py-5 px-3">

                            <i
                                className="fas fa-users-slash fa-3x text-muted mb-3"
                            />

                            <h5 className="fw-bold">
                                No users found
                            </h5>

                            <p className="text-muted mb-0">
                                No users match your current search or filters.
                            </p>

                        </div>

                    )}


                    {filteredUsers.length > 0 && (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">


                                <thead className="table-light">

                                    <tr>

                                        <th className="px-3">
                                            #
                                        </th>

                                        <th>
                                            User
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Role
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Verified
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredUsers.map(
                                        (user) => (

                                            <tr
                                                key={
                                                    user.id
                                                }
                                            >

                                                <td className="px-3 text-muted">

                                                    #{user.id}

                                                </td>


                                                <td>

                                                    <div>

                                                        <strong>
                                                            {
                                                                user.full_name ||
                                                                user.username
                                                            }
                                                        </strong>

                                                        {user.username &&
                                                            user.full_name &&
                                                            user.username !==
                                                                user.full_name && (

                                                                <div className="small text-muted">

                                                                    @
                                                                    {
                                                                        user.username
                                                                    }

                                                                </div>

                                                            )}

                                                    </div>

                                                </td>


                                                <td>

                                                    {
                                                        user.email ||
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        user.phone ||
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    <span
                                                        className={`badge ${getRoleBadge(
                                                            user.role
                                                        )}`}
                                                    >

                                                        {
                                                            user.role ||
                                                            "Unknown"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {user.is_active ? (

                                                        <span className="badge bg-success">

                                                            Active

                                                        </span>

                                                    ) : (

                                                        <span className="badge bg-secondary">

                                                            Inactive

                                                        </span>

                                                    )}

                                                </td>


                                                <td>

                                                    {user.is_verified ? (

                                                        <span className="text-success">

                                                            <i className="fas fa-check-circle me-1" />

                                                            Yes

                                                        </span>

                                                    ) : (

                                                        <span className="text-muted">

                                                            <i className="fas fa-times-circle me-1" />

                                                            No

                                                        </span>

                                                    )}

                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="View user"
                                                    >

                                                        <i className="fas fa-eye me-1" />

                                                        View

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}