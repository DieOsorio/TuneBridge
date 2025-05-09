import React, { createContext, useContext} from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../AuthContext';
import {
    useProfileQuery,
    useAllProfilesQuery,
    useCreateProfile,
    useUpdateProfile,
    useDeleteProfile,
    useProfilesMap,
    useSearchProfilesQuery,
    useInfiniteProfilesQuery,
} from './profileActions';

const ProfileContext = createContext(null);
ProfileContext.displayName = "ProfileContext";

export const ProfileProvider = ({ children }) => {
    const {data: allProfiles, isLoading: loading, error, refetch} = useAllProfilesQuery();
    const createProfile = useCreateProfile().mutateAsync;
    const updateProfile = useUpdateProfile().mutateAsync;
    const deleteProfile = useDeleteProfile().mutateAsync;

    const value = {
        allProfiles,
        loading,
        error,
        refetch,
        fetchProfile: useProfileQuery,
        profilesMap: useProfilesMap,
        createProfile,
        updateProfile,
        deleteProfile,
        searchProfiles: useSearchProfilesQuery,
        infiniteProfiles: useInfiniteProfilesQuery,
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
