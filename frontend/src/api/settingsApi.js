import axios from "axios";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}accounts`;


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