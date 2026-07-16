import api from "./api";

export const bookAppointment = (appointmentData) => {

    return api.post(

        "appointments/book/",

        appointmentData

    );

};