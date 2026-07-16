import { useState } from "react";

import DepartmentDropdown from "../../components/DepartmentDropdown";

import "../../styles/appointment.css";

function BookAppointment() {

    const [department, setDepartment] = useState("");

    const [doctor, setDoctor] = useState("");

    const [appointmentDate, setAppointmentDate] = useState("");

    const [timeSlot, setTimeSlot] = useState("");

    const [reason, setReason] = useState("");

    const handleSubmit = (event) => {

        event.preventDefault();

        alert("Appointment Form Submitted!");

    };

    return (

        <div className="appointment-page">

            <div className="appointment-container">

                <h2>

                    Book Appointment

                </h2>

                <form onSubmit={handleSubmit}>

                    <DepartmentDropdown

                        selectedDepartment={department}

                        onDepartmentChange={(event)=>

                        setDepartment(event.target.value)

                        }

                    />

                    <div className="form-group">

                        <label>

                            Doctor

                        </label>

                        <select

                            value={doctor}

                            onChange={(event)=>

                            setDoctor(event.target.value)

                            }

                        >

                            <option value="">

                                Select Doctor

                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label>

                            Appointment Date

                        </label>

                        <input

                            type="date"

                            value={appointmentDate}

                            onChange={(event)=>

                            setAppointmentDate(event.target.value)

                            }

                        />

                    </div>

                    <div className="form-group">

                        <label>

                            Time Slot

                        </label>

                        <select

                            value={timeSlot}

                            onChange={(event)=>

                            setTimeSlot(event.target.value)

                            }

                        >

                            <option value="">

                                Select Time

                            </option>

                            <option>

                                09:00 AM

                            </option>

                            <option>

                                09:30 AM

                            </option>

                            <option>

                                10:00 AM

                            </option>

                            <option>

                                10:30 AM

                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label>

                            Reason

                        </label>

                        <textarea

                            rows="5"

                            value={reason}

                            onChange={(event)=>

                            setReason(event.target.value)

                            }

                            placeholder="Write your problem..."

                        />

                    </div>

                    <button

                        className="appointment-btn"

                        type="submit"

                    >

                        Book Appointment

                    </button>

                </form>

            </div>

        </div>

    );

}

export default BookAppointment;