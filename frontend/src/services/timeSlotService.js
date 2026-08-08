import api from "./api";

export const getTimeSlots = (doctorId) => {

    return api.get(

        `doctors/time-slots/?doctor=${doctorId}`

    );

};