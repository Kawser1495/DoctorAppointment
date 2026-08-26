import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {

    getFamilyMembers,

    createFamilyMember,

    updateFamilyMember,

    deleteFamilyMember,

} from "../../services/familyService";

import "./FamilyMembers.css";


function FamilyMembers() {


    // ======================================================
    // States
    // ======================================================

    const [members, setMembers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [editingMember, setEditingMember] =
        useState(null);

    const [submitting, setSubmitting] =
        useState(false);


    const initialFormData = {

        name: "",

        relation: "",

        age: "",

        gender: "",

        phone_number: "",

    };


    const [formData, setFormData] =
        useState(initialFormData);


    // ======================================================
    // Load Family Members
    // ======================================================

    const loadFamilyMembers = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await getFamilyMembers();


            const data =
                response.data?.results ||
                response.data?.data ||
                response.data ||
                [];


            setMembers(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (err) {

            console.error(
                "Family Members Error:",
                err
            );


            if (err.response?.status === 401) {

                setError(
                    "Authentication required. Please login again."
                );

            } else {

                setError(
                    "Unable to load family members. Please try again."
                );

            }

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadFamilyMembers();

    }, []);


    // ======================================================
    // Search
    // ======================================================

    const filteredMembers = useMemo(() => {

        const searchText =
            searchTerm
                .toLowerCase()
                .trim();


        if (!searchText) {

            return members;

        }


        return members.filter(
            (member) => {

                return (

                    member.name
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    member.relation
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    member.gender
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    member.phone_number
                        ?.toLowerCase()
                        .includes(searchText)

                );

            }
        );

    }, [
        members,
        searchTerm,
    ]);


    // ======================================================
    // Open Add Modal
    // ======================================================

    const handleAddMember = () => {

        setEditingMember(null);

        setFormData(
            initialFormData
        );

        setShowModal(true);

    };


    // ======================================================
    // Open Edit Modal
    // ======================================================

    const handleEditMember = (member) => {

        setEditingMember(member);

        setFormData({

            name:
                member.name || "",

            relation:
                member.relation || "",

            age:
                member.age || "",

            gender:
                member.gender || "",

            phone_number:
                member.phone_number || "",

        });

        setShowModal(true);

    };


    // ======================================================
    // Handle Input
    // ======================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            (previousData) => ({

                ...previousData,

                [name]: value,

            })
        );

    };


    // ======================================================
    // Submit Member
    // ======================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        try {

            setSubmitting(true);


            const data = {

                ...formData,

                age:
                    Number(
                        formData.age
                    ),

                phone_number:
                    formData.phone_number.trim()
                        ? formData.phone_number.trim()
                        : null,

            };


            if (editingMember) {

                await updateFamilyMember(
                    editingMember.id,
                    data
                );

            } else {

                await createFamilyMember(
                    data
                );

            }


            setShowModal(false);

            setEditingMember(null);

            setFormData(
                initialFormData
            );

            await loadFamilyMembers();

        }

        catch (err) {

            console.error(
                "Family Member Save Error:",
                err
            );

            alert(

                err.response?.data?.detail ||

                "Unable to save family member."

            );

        }

        finally {

            setSubmitting(false);

        }

    };


    // ======================================================
    // Delete Member
    // ======================================================

    const handleDeleteMember = async (
        member
    ) => {

        const confirmed =
            window.confirm(

                `Are you sure you want to remove ${member.name}?`

            );


        if (!confirmed) {

            return;

        }


        try {

            await deleteFamilyMember(
                member.id
            );

            setMembers(
                (previousMembers) =>

                    previousMembers.filter(
                        (item) =>
                            item.id !== member.id
                    )

            );

        }

        catch (err) {

            console.error(
                "Delete Family Member Error:",
                err
            );

            alert(
                "Unable to delete family member."
            );

        }

    };


    // ======================================================
    // Close Modal
    // ======================================================

    const handleCloseModal = () => {

        if (submitting) {

            return;

        }

        setShowModal(false);

        setEditingMember(null);

        setFormData(
            initialFormData
        );

    };


    // ======================================================
    // Get Initials
    // ======================================================

    const getInitials = (name) => {

        if (!name) {

            return "FM";

        }


        return name
            .split(" ")
            .slice(0, 2)
            .map(
                (word) =>
                    word.charAt(0)
            )
            .join("")
            .toUpperCase();

    };


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="family-page">

                <div className="family-loading">

                    <div className="family-spinner"></div>

                    <h3>
                        Loading Family Members...
                    </h3>

                    <p>
                        Please wait while we retrieve your family information.
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // Error
    // ======================================================

    if (error) {

        return (

            <div className="family-page">

                <div className="family-error">

                    <div className="family-error-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to Load Family Members
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={
                            loadFamilyMembers
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    // ======================================================
    // Main UI
    // ======================================================

    return (

        <div className="family-page">


            {/* ==================================================
                Hero
            =================================================== */}

            <section className="family-hero">

                <div className="family-hero-content">

                    <div className="family-badge">

                        👨‍👩‍👧‍👦 FAMILY CARE

                    </div>


                    <h1>
                        Family Members
                    </h1>


                    <p>

                        Manage your family's health profiles
                        and keep important information
                        organized in one secure place.

                    </p>


                    <div className="family-stats">

                        <div className="family-stat">

                            <strong>
                                {members.length}
                            </strong>

                            <span>
                                Family Members
                            </span>

                        </div>


                        <div className="family-stat">

                            <strong>
                                Secure
                            </strong>

                            <span>
                                Private Information
                            </span>

                        </div>


                        <div className="family-stat">

                            <strong>
                                24/7
                            </strong>

                            <span>
                                Easy Access
                            </span>

                        </div>

                    </div>

                </div>


                <div className="family-hero-visual">

                    <div className="family-big-icon">
                        👨‍👩‍👧‍👦
                    </div>

                    <div className="family-floating-card card-top">
                        ❤️ Family Health
                    </div>

                    <div className="family-floating-card card-bottom">
                        🔒 Secure Profiles
                    </div>

                </div>

            </section>


            {/* ==================================================
                Content
            =================================================== */}

            <div className="family-content">


                <div className="family-section-heading">

                    <div>

                        <span>
                            MY FAMILY
                        </span>

                        <h2>
                            Family Health Profiles
                        </h2>

                        <p>

                            Add and manage your family members
                            for easier healthcare management.

                        </p>

                    </div>


                    <button
                        type="button"
                        className="add-family-button"
                        onClick={
                            handleAddMember
                        }
                    >

                        <span>
                            +
                        </span>

                        Add Family Member

                    </button>

                </div>


                {/* Search */}

                <div className="family-toolbar">

                    <div className="family-search-box">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search family members..."
                            value={searchTerm}
                            onChange={
                                (event) =>

                                    setSearchTerm(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    <div className="family-count">

                        <strong>
                            {filteredMembers.length}
                        </strong>

                        <span>
                            Member
                            {filteredMembers.length !== 1
                                ? "s"
                                : ""
                            }
                        </span>

                    </div>

                </div>


                {/* Empty State */}

                {filteredMembers.length === 0 ? (

                    <div className="family-empty">

                        <div className="family-empty-icon">
                            👨‍👩‍👧‍👦
                        </div>


                        <h3>

                            {searchTerm
                                ? "No Matching Family Members"
                                : "No Family Members Yet"
                            }

                        </h3>


                        <p>

                            {searchTerm

                                ? "Try searching with another name or relation."

                                : "Add your family members to manage their healthcare information easily."
                            }

                        </p>


                        <button
                            type="button"
                            onClick={

                                searchTerm
                                    ? () =>
                                        setSearchTerm("")
                                    : handleAddMember

                            }
                        >

                            {searchTerm
                                ? "Clear Search"
                                : "+ Add Family Member"
                            }

                        </button>

                    </div>

                ) : (

                    <div className="family-grid">

                        {filteredMembers.map(
                            (member) => (

                                <article
                                    className="family-member-card"
                                    key={member.id}
                                >

                                    <div className="member-card-header">

                                        <div className="member-avatar">

                                            {getInitials(
                                                member.name
                                            )}

                                        </div>


                                        <div className="member-actions">

                                            <button
                                                type="button"
                                                title="Edit"
                                                onClick={() =>
                                                    handleEditMember(
                                                        member
                                                    )
                                                }
                                            >
                                                ✏️
                                            </button>


                                            <button
                                                type="button"
                                                title="Delete"
                                                className="delete-member-button"
                                                onClick={() =>
                                                    handleDeleteMember(
                                                        member
                                                    )
                                                }
                                            >
                                                🗑️
                                            </button>

                                        </div>

                                    </div>


                                    <div className="member-main-info">

                                        <h3>
                                            {member.name}
                                        </h3>

                                        <span className="relation-badge">
                                            {member.relation}
                                        </span>

                                    </div>


                                    <div className="member-details">

                                        <div className="member-detail">

                                            <span>
                                                🎂
                                            </span>

                                            <div>

                                                <small>
                                                    Age
                                                </small>

                                                <strong>
                                                    {member.age} Years
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="member-detail">

                                            <span>
                                                👤
                                            </span>

                                            <div>

                                                <small>
                                                    Gender
                                                </small>

                                                <strong>
                                                    {member.gender}
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="member-detail">

                                            <span>
                                                📱
                                            </span>

                                            <div>

                                                <small>
                                                    Phone
                                                </small>

                                                <strong>
                                                    {member.phone_number ||
                                                        "Not provided"}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        className="edit-member-full-button"
                                        onClick={() =>
                                            handleEditMember(
                                                member
                                            )
                                        }
                                    >

                                        Manage Profile →

                                    </button>

                                </article>

                            )
                        )}

                    </div>

                )}

            </div>


            {/* ==================================================
                Add / Edit Modal
            =================================================== */}

            {showModal && (

                <div
                    className="family-modal-overlay"
                    onClick={
                        handleCloseModal
                    }
                >

                    <div
                        className="family-modal"
                        onClick={
                            (event) =>
                                event.stopPropagation()
                        }
                    >

                        <div className="family-modal-header">

                            <div>

                                <span>
                                    FAMILY PROFILE
                                </span>

                                <h2>

                                    {editingMember
                                        ? "Edit Family Member"
                                        : "Add Family Member"
                                    }

                                </h2>

                            </div>


                            <button
                                type="button"
                                className="family-modal-close"
                                onClick={
                                    handleCloseModal
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="family-form-grid">


                                {/* Name */}

                                <div className="form-group full-width">

                                    <label>
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter full name"
                                        required
                                    />

                                </div>


                                {/* Relation */}

                                <div className="form-group">

                                    <label>
                                        Relation
                                    </label>

                                    <select
                                        name="relation"
                                        value={
                                            formData.relation
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select relation
                                        </option>

                                        <option value="Father">
                                            Father
                                        </option>

                                        <option value="Mother">
                                            Mother
                                        </option>

                                        <option value="Brother">
                                            Brother
                                        </option>

                                        <option value="Sister">
                                            Sister
                                        </option>

                                        <option value="Husband">
                                            Husband
                                        </option>

                                        <option value="Wife">
                                            Wife
                                        </option>

                                        <option value="Son">
                                            Son
                                        </option>

                                        <option value="Daughter">
                                            Daughter
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                {/* Age */}

                                <div className="form-group">

                                    <label>
                                        Age
                                    </label>

                                    <input
                                        type="number"
                                        name="age"
                                        min="0"
                                        max="130"
                                        value={
                                            formData.age
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter age"
                                        required
                                    />

                                </div>


                                {/* Gender */}

                                <div className="form-group">

                                    <label>
                                        Gender
                                    </label>

                                    <select
                                        name="gender"
                                        value={
                                            formData.gender
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select gender
                                        </option>

                                        <option value="Male">
                                            Male
                                        </option>

                                        <option value="Female">
                                            Female
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                {/* Phone */}

                                <div className="form-group">

                                    <label>
                                        Phone Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={
                                            formData.phone_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Optional phone number"
                                    />

                                </div>

                            </div>


                            <div className="family-form-actions">

                                <button
                                    type="button"
                                    className="cancel-family-button"
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="save-family-button"
                                    disabled={
                                        submitting
                                    }
                                >

                                    {submitting

                                        ? "Saving..."

                                        : editingMember
                                            ? "Update Member"
                                            : "Add Member"

                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default FamilyMembers;