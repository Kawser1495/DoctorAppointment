import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getAppointmentDetails } from "../../services/appointmentService";
import AppointmentCard from "../../components/Cards/AppointmentCard";

function AppointmentDetails() {

    const { id } = useParams();

    const [appointment, setAppointment] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchAppointment = async () => {

            try {

                const response =
                    await getAppointmentDetails(id);

                const data =
                    response.data.data || response.data;

                setAppointment(data);

            } catch (error) {

                console.error(error);

                alert("Failed to load appointment details.");

            } finally {

                setLoading(false);

            }

        };

        fetchAppointment();

    }, [id]);

    if (loading) {

        return <h2>Loading Appointment...</h2>;

    }

    if (!appointment) {

        return <h2>Appointment Not Found</h2>;

    }

    return (

        <div className="appointment-page">

            <AppointmentCard
                appointment={appointment}
            />

        </div>

    );

}

export default AppointmentDetails;