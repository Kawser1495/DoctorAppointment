import axios from "axios";

const API_URL =
    "http://127.0.0.1:8000/api/accounts";


export const getUserSettingsApi = async () => {

    const accessToken =
        localStorage.getItem("access");

    return axios.get(
        `${API_URL}/settings/`,
        {
            headers: {
                Authorization:
                    `Bearer ${accessToken}`,
            },
        }
    );
};


export const updateUserSettingsApi = async (
    data
) => {

    const accessToken =
        localStorage.getItem("access");

    return axios.patch(
        `${API_URL}/settings/`,
        data,
        {
            headers: {
                Authorization:
                    `Bearer ${accessToken}`,
                "Content-Type":
                    "application/json",
            },
        }
    );
};


export const changePasswordApi = async (
    data
) => {

    const accessToken =
        localStorage.getItem("access");

    return axios.post(
        `${API_URL}/change-password/`,
        data,
        {
            headers: {
                Authorization:
                    `Bearer ${accessToken}`,
                "Content-Type":
                    "application/json",
            },
        }
    );
};