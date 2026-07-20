import axios from "axios";

export const loginUser = (data) => {

    return axios.post(

        "http://127.0.0.1:8000/api/accounts/login/",

        data

    );

};

export const registerUser = (data) => {

    return axios.post(

        "http://127.0.0.1:8000/api/accounts/register/",

        data

    );

};