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
            const result = await fetchProfileAction(supabase, user, userId, setProfile, setError, setLoading);
            return result;
        },
        fetchAllProfiles: async () => {
            const result = await fetchAllProfiles(supabase, setAllProfiles, setError, setLoading);
            return result;
        },
        createProfile: async (userId, email) => {
            const result = await createProfile(supabase, userId, email, setError, setLoading);
            return result;
        },
        updateProfile: async (profileData) => {
            const result = await updateProfile(supabase, profileData, setProfile, setError, setLoading);
            return result;
        },
        deleteProfile: async (userId) => {
            const result = await deleteProfile(supabase, userId, setProfile, setError, setLoading);
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
