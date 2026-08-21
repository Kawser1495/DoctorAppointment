import api from "./axios";

// ==========================================================
// Get My Patient Profile
// GET: /api/patients/profile/
// ==========================================================

export const getPatientProfile = async () => {
    return await api.get(
        "patients/profile/"
    );
};


// ==========================================================
// Create Patient Profile
// POST: /api/patients/profile/create/
// ==========================================================

export const createPatientProfile = async (data) => {
    return await api.post(
        "patients/profile/create/",
        data
    );
};


// ==========================================================
// Update Patient Profile
// PATCH: /api/patients/profile/
// ==========================================================

export const updatePatientProfile = async (data) => {
    return await api.patch(
        "patients/profile/",
        data
    );
};


// ==========================================================
// Get Family Members
// GET: /api/patients/family/
// ==========================================================

export const getFamilyMembers = async () => {
    return await api.get(
        "patients/family/"
    );
};


// ==========================================================
// Add Family Member
// POST: /api/patients/family/
// ==========================================================

export const createFamilyMember = async (data) => {
    return await api.post(
        "patients/family/",
        data
    );
};


// ==========================================================
// Get Family Member Details
// GET: /api/patients/family/:id/
// ==========================================================

export const getFamilyMember = async (id) => {
    return await api.get(
        `patients/family/${id}/`
    );
};


// ==========================================================
// Update Family Member
// PATCH: /api/patients/family/:id/
// ==========================================================

export const updateFamilyMember = async (id, data) => {
    return await api.patch(
        `patients/family/${id}/`,
        data
    );
};


// ==========================================================
// Delete Family Member
// DELETE: /api/patients/family/:id/
// ==========================================================

export const deleteFamilyMember = async (id) => {
    return await api.delete(
        `patients/family/${id}/`
    );
};