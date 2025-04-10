import React, { createContext, useContext} from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../AuthContext';
import {
    useProfileQuery,
    useAllProfilesQuery,
    useCreateProfile,
    useUpdateProfile,
    useDeleteProfile,
} from './profileActions';

const ProfileContext = createContext(null);
ProfileContext.displayName = "ProfileContext";

export const ProfileProvider = ({ children }) => {

    const profileQuery = useProfileQuery();
    const allProfilesQuery = useAllProfilesQuery();
    const createProfile = useCreateProfile();
    const updateProfile = useUpdateProfile();
    const deleteProfile = useDeleteProfile();

    const value = {
        profile: profileQuery.data,
        allProfiles: allProfilesQuery.data,
        loading: profileQuery.isLoading || allProfilesQuery.isLoading,
        error: profileQuery.error || allProfilesQuery.error,
        refetchProfile: profileQuery.refetch,
        refetchAllProfiles: allProfilesQuery.refetch,
        createProfile: createProfile.mutateAsync,
        updateProfile: updateProfile.mutateAsync,
        deleteProfile: deleteProfile.mutateAsync,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

ProfileProvider.propTypes = {
    children: PropTypes.node.isRequired, // Ensures `children` is a React node and is required
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};
