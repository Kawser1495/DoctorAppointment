import api from "../services/api";

export const getMyAppointments = () => {

    return api.get("appointments/patient/");

};