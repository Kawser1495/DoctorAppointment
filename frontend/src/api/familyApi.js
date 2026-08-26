import api from "./axios";


// ==========================================================
// Get Family Members
// GET: /api/patients/family/
// ==========================================================

export const getFamilyMembersApi = async () => {

    return await api.get(
        "patients/family/"
    );

};


// ==========================================================
// Add Family Member
// POST: /api/patients/family/
// ==========================================================

export const createFamilyMemberApi = async (data) => {

    return await api.post(
        "patients/family/",
        data
    );

};


// ==========================================================
// Update Family Member
// PATCH: /api/patients/family/:id/
// ==========================================================

export const updateFamilyMemberApi = async (
    id,
    data
) => {

    return await api.patch(
        `patients/family/${id}/`,
        data
    );

};


// ==========================================================
// Delete Family Member
// DELETE: /api/patients/family/:id/
// ==========================================================

export const deleteFamilyMemberApi = async (id) => {

    return await api.delete(
        `patients/family/${id}/`
    );

};