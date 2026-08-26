import axios from "axios";


const BASE_URL = "http://127.0.0.1:8000/api/";


// ======================================================
// Private API
// ======================================================

const api = axios.create({

    baseURL: BASE_URL,

    headers: {
        "Content-Type": "application/json",
    },

});


// ======================================================
// Attach JWT Access Token
// ======================================================

api.interceptors.request.use(

    (config) => {

        const accessToken =

            localStorage.getItem("access") ||

            sessionStorage.getItem("access");


        if (accessToken) {

            config.headers.Authorization =
                `Bearer ${accessToken}`;

        }


        return config;

    },


    (error) => {

        return Promise.reject(error);

    }

);


// ======================================================
// Public API
// ======================================================

export const publicApi = axios.create({

    baseURL: BASE_URL,

    headers: {
        "Content-Type": "application/json",
    },

});


export default api;