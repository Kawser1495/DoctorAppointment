import {
    getUserSettingsApi,
    updateUserSettingsApi,
    changePasswordApi,
} from "../api/settingsApi";


// ==========================================================
// Get User Settings
// ==========================================================

export const getUserSettings = async () => {

    return await getUserSettingsApi();

};


// ==========================================================
// Update User Settings
// ==========================================================

export const updateUserSettings = async (
    data
) => {

    return await updateUserSettingsApi(
        data
    );

};

export const changePassword = async (data) => {
    return await changePasswordApi(data);
};
