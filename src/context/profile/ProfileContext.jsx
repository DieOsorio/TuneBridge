import React, { createContext, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../../supabase';
import { useAuth } from '../AuthContext';
import {
    fetchProfile as fetchProfileAction,
    fetchAllProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
} from './profileActions';

const ProfileContext = createContext(null);
ProfileContext.displayName = "ProfileContext";

export const ProfileProvider = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [allProfiles, setAllProfiles] = useState([]);
    const [error, setError] = useState(null);

    // Memoize the context value to avoid unnecessary re-renders
    const value = useMemo(() => ({
        profile,
        allProfiles,
        error,
        loading,
        fetchProfile: async (userId) => {
            console.log("Calling fetchProfile with userId:", userId);
            const result = await fetchProfileAction(supabase, user, userId, setProfile, setError, setLoading);
            console.log("fetchProfile result in ProfileContext:", result);
            console.log("ProfileContext state updated");
            return result;
        },
        fetchAllProfiles: async () => {
            console.log("Calling fetchAllProfiles");
            const result = await fetchAllProfiles(supabase, setAllProfiles, setError, setLoading);
            console.log("fetchAllProfiles result:", result);
            console.log("ProfileContext state updated");
            return result;
        },
        createProfile: async (userId, email) => {
            console.log("Calling createProfile with userId and email:", userId, email);
            const result = await createProfile(supabase, userId, email, setError, setLoading);
            console.log("createProfile result:", result);
            console.log("ProfileContext state updated");
            return result;
        },
        updateProfile: async (profileData) => {
            console.log("Calling updateProfile with profileData:", profileData);
            const result = await updateProfile(supabase, profileData, setProfile, setError, setLoading);
            console.log("updateProfile result:", result);
            console.log("ProfileContext state updated");
            return result;
        },
        deleteProfile: async (userId) => {
            console.log("Calling deleteProfile with userId:", userId);
            const result = await deleteProfile(supabase, userId, setProfile, setError, setLoading);
            console.log("deleteProfile result:", result);
            console.log("ProfileContext state updated");
            return result;
        },
    }), [profile, allProfiles, error, loading, user]);

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
