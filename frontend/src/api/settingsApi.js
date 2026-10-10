import api from "./axios";

export const getUserSettingsApi = async () => {
    return api.get("accounts/settings/");
};

export const updateUserSettingsApi = async (data) => {
    return api.patch("accounts/settings/", data);
};

export const changePasswordApi = async (data) => {
    return api.post("accounts/change-password/", data);
};
