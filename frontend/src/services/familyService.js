import {

    getFamilyMembersApi,

    createFamilyMemberApi,

    updateFamilyMemberApi,

    deleteFamilyMemberApi,

} from "../api/familyApi";


// ==========================================================
// Get Family Members
// ==========================================================

export const getFamilyMembers = async () => {

    return await getFamilyMembersApi();

};


// ==========================================================
// Add Family Member
// ==========================================================

export const createFamilyMember = async (data) => {

    return await createFamilyMemberApi(
        data
    );

};


// ==========================================================
// Update Family Member
// ==========================================================

export const updateFamilyMember = async (
    id,
    data
) => {

    return await updateFamilyMemberApi(
        id,
        data
    );

};


// ==========================================================
// Delete Family Member
// ==========================================================

export const deleteFamilyMember = async (id) => {

    return await deleteFamilyMemberApi(
        id
    );

};