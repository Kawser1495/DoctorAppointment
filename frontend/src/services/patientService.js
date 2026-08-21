import {
    getPatientProfile,
    createPatientProfile,
    updatePatientProfile,
    getFamilyMembers,
    createFamilyMember,
    getFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
} from "../api/patientApi";


// ==========================================================
// Patient Profile
// ==========================================================

export const fetchPatientProfile = async () => {
    return await getPatientProfile();
};


export const createProfile = async (data) => {
    return await createPatientProfile(data);
};


export const updateProfile = async (data) => {
    return await updatePatientProfile(data);
};


// ==========================================================
// Family Members
// ==========================================================

export const fetchFamilyMembers = async () => {
    return await getFamilyMembers();
};


export const addFamilyMember = async (data) => {
    return await createFamilyMember(data);
};


export const fetchFamilyMember = async (id) => {
    return await getFamilyMember(id);
};


export const editFamilyMember = async (id, data) => {
    return await updateFamilyMember(id, data);
};


export const removeFamilyMember = async (id) => {
    return await deleteFamilyMember(id);
};