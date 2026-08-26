import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getDiagnosticTests,
    getTestCategories,
} from "../../services/diagnosticService";

import "./DiagnosticTests.css";


function DiagnosticTests() {

    // ======================================================
    // States
    // ======================================================

    const navigate = useNavigate();

    const [tests, setTests] = useState([]);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [selectedCategory, setSelectedCategory] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");


    // ======================================================
    // Load Data
    // ======================================================

    useEffect(() => {

        const loadDiagnosticData = async () => {

            try {

                setLoading(true);

                setError("");


                const [
                    categoryResponse,
                    testResponse,
                ] = await Promise.all([

                    getTestCategories(),

                    getDiagnosticTests(),

                ]);


                setCategories(

                    Array.isArray(categoryResponse)
                        ? categoryResponse
                        : categoryResponse.results || []

                );


                setTests(

                    Array.isArray(testResponse)
                        ? testResponse
                        : testResponse.results || []

                );

            }

            catch (err) {

                console.error(
                    "Diagnostic Loading Error:",
                    err
                );

                setError(
                    "Unable to load diagnostic tests. Please try again."
                );

            }

            finally {

                setLoading(false);

            }

        };


        loadDiagnosticData();

    }, []);


    // ======================================================
    // Filter + Search
    // ======================================================

    const filteredTests = useMemo(() => {

        return tests.filter((test) => {

            const matchesCategory =
                !selectedCategory ||
                test.category ===
                    Number(selectedCategory);


            const searchText =
                searchTerm.toLowerCase();


            const matchesSearch =

                test.name
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                test.category_name
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                test.description
                    ?.toLowerCase()
                    .includes(searchText);


            return (
                matchesCategory &&
                matchesSearch
            );

        });

    }, [

        tests,
        selectedCategory,
        searchTerm,

    ]);


    // ======================================================
    // Format Price
    // ======================================================

    const formatPrice = (price) => {

        return Number(price).toLocaleString(
            "en-BD",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        );

    };


    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="diagnostic-page">

                <div className="diagnostic-loading">

                    <div className="loading-spinner"></div>

                    <h3>
                        Loading Diagnostic Tests...
                    </h3>

                    <p>
                        Please wait while we prepare the available tests.
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

            <div className="diagnostic-page">

                <div className="diagnostic-error">

                    <div className="error-icon">
                        ⚠
                    </div>

                    <h3>
                        Something went wrong
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
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

        <div className="diagnostic-page">


            {/* ==================================================
                HERO SECTION
            =================================================== */}

            <section className="diagnostic-hero">

                <div className="hero-content">

                    <div className="hero-badge">

                        🧪 Laboratory Services

                    </div>


                    <h1>

                        Diagnostic Tests

                    </h1>


                    <p>

                        Find reliable diagnostic tests and
                        conveniently book your test online.

                    </p>


                    <div className="hero-stats">

                        <div>

                            <strong>
                                {tests.length}
                            </strong>

                            <span>
                                Available Tests
                            </span>

                        </div>


                        <div>

                            <strong>
                                {categories.length}
                            </strong>

                            <span>
                                Categories
                            </span>

                        </div>


                        <div>

                            <strong>
                                Easy
                            </strong>

                            <span>
                                Online Booking
                            </span>

                        </div>

                    </div>

                </div>


                <div className="hero-visual">

                    <div className="medical-circle circle-one"></div>

                    <div className="medical-circle circle-two"></div>

                    <div className="lab-icon">

                        🧬

                    </div>

                </div>

            </section>


            {/* ==================================================
                CONTENT
            =================================================== */}

            <div className="diagnostic-content">


                {/* ==============================================
                    SECTION TITLE
                =============================================== */}

                <div className="section-heading">

                    <div>

                        <span>
                            AVAILABLE SERVICES
                        </span>

                        <h2>

                            Find the Right Test

                        </h2>

                        <p>

                            Search, filter and book diagnostic
                            tests according to your needs.

                        </p>

                    </div>

                </div>


                {/* ==============================================
                    SEARCH + FILTER
                =============================================== */}

                <div className="diagnostic-controls">


                    {/* Search */}

                    <div className="search-box">

                        <span className="search-icon">

                            🔍

                        </span>


                        <input

                            type="text"

                            placeholder="
                                Search test, category or keyword...
                            "

                            value={searchTerm}

                            onChange={(event) =>

                                setSearchTerm(
                                    event.target.value
                                )

                            }

                        />

                    </div>


                    {/* Category */}

                    <select

                        className="category-select"

                        value={selectedCategory}

                        onChange={(event) =>

                            setSelectedCategory(
                                event.target.value
                            )

                        }

                    >

                        <option value="">

                            All Categories

                        </option>


                        {categories.map(

                            (category) => (

                                <option

                                    key={category.id}

                                    value={category.id}

                                >

                                    {category.name}

                                </option>

                            )

                        )}

                    </select>

                </div>


                {/* ==============================================
                    RESULT COUNT
                =============================================== */}

                <div className="result-info">

                    <span>

                        Showing

                        {" "}

                        <strong>

                            {filteredTests.length}

                        </strong>

                        {" "}

                        test
                        {filteredTests.length !== 1
                            ? "s"
                            : ""
                        }

                    </span>


                    {(searchTerm ||
                        selectedCategory) && (

                        <button

                            type="button"

                            className="clear-filter"

                            onClick={() => {

                                setSearchTerm("");

                                setSelectedCategory("");

                            }}

                        >

                            Clear Filters

                        </button>

                    )}

                </div>


                {/* ==============================================
                    TEST CARDS
                =============================================== */}

                {filteredTests.length === 0 ? (

                    <div className="diagnostic-empty">

                        <div className="empty-icon">

                            🔬

                        </div>


                        <h3>

                            No Tests Found

                        </h3>


                        <p>

                            We could not find any diagnostic
                            test matching your search.

                        </p>


                        <button

                            type="button"

                            onClick={() => {

                                setSearchTerm("");

                                setSelectedCategory("");

                            }}

                        >

                            View All Tests

                        </button>

                    </div>

                ) : (

                    <div className="diagnostic-grid">

                        {filteredTests.map((test) => (

                            <article

                                className="diagnostic-card"

                                key={test.id}

                            >


                                {/* Card Top */}

                                <div className="test-card-top">


                                    <div className="test-icon">

                                        🧪

                                    </div>


                                    <span className="availability-badge">

                                        Available

                                    </span>

                                </div>


                                {/* Category */}

                                <div className="test-category">

                                    {test.category_name}

                                </div>


                                {/* Name */}

                                <h3>

                                    {test.name}

                                </h3>


                                {/* Description */}

                                <p className="test-description">

                                    {test.description ||
                                        "Professional diagnostic testing service with reliable laboratory support."
                                    }

                                </p>


                                {/* Details */}

                                <div className="test-details">


                                    <div className="detail-item">

                                        <span>
                                            💰
                                        </span>

                                        <div>

                                            <small>
                                                Test Fee
                                            </small>

                                            <strong>

                                                ৳
                                                {formatPrice(
                                                    test.price
                                                )}

                                            </strong>

                                        </div>

                                    </div>


                                    {test.duration && (

                                        <div className="detail-item">

                                            <span>
                                                ⏱
                                            </span>

                                            <div>

                                                <small>
                                                    Duration
                                                </small>

                                                <strong>

                                                    {test.duration}

                                                </strong>

                                            </div>

                                        </div>

                                    )}

                                </div>


                                {/* Preparation */}

                                {test.preparation && (

                                    <div className="preparation-box">

                                        <div>

                                            <span>

                                                ℹ

                                            </span>

                                            <strong>

                                                Preparation

                                            </strong>

                                        </div>


                                        <p>

                                            {test.preparation}

                                        </p>

                                    </div>

                                )}


                                {/* Button */}

                                <button
                                    type="button"
                                    className="book-test-button"
                                    onClick={() =>
                                        navigate(`/diagnostics/book/${test.id}`)
                                    }
                                >
                                    <span>
                                        Book This Test
                                    </span>

                                    <span>
                                        →
                                    </span>
                                </button>

                            </article>

                        ))}

                    </div>

                )}


            </div>

        </div>

    );

}


export default DiagnosticTests;