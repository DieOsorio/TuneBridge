import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);
ProfileContext.displayName = "ProfileContext";

export const ProfileProvider = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState(null);
    const [profileError, setProfileError] = useState(null);

    const fetchProfile = async (userID) => {
        setLoading(true);
    
        try {
            if (!user) {
                setProfile(null);
                return;
            }
    
            const { data: profileData, error } = await supabase
                .schema('users')
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
    
            if (error) {
                throw new Error(error.message);
            }
    
            setProfile(profileData);
            setProfileError(null); 
    
        } catch (err) {
            setProfile(null);
            setProfileError(err.message);
        } finally {
            setLoading(false); 
        }
    };
    

        // Función para crear el perfil
    const createProfile = async (userId, email) => {
        try {
        setLoading(true);
        const { error } = await supabase
            .schema('users')
            .from("profiles")
            .insert([
            {
                id: userId,
                username: null,
                email: email,
                avatar_url: "",
                country: "",
                city: "",
                firstname: "",
                lastname: "",
                gender: "",
                birthdate: null
            },
            ]);

            console.error("error", error);
        if (error) {
            throw new Error(error.message);
        }
        
        setLoading(false);
        return true; 
    } catch (err) {
        setProfileError(err.message);
        setLoading(false);
        return false;
        }
    };

        // Actualizar perfil
    const updateProfile = async (profileData) => {
        setLoading(true);
        setProfileError("");
        
        try {
            const { error } = await supabase
            .schema('users')
            .from("profiles")
            .update({
                username: profileData.username,
                gender: profileData.gender,
                avatar_url: profileData.avatar_url,
                country: profileData.country,
                city: profileData.city,
                firstname: profileData.firstname,
                lastname: profileData.lastname,
                birthdate: profileData.birthdate
            })
            .eq("id", profileData.id);
            
            if (error) {
                setProfileError(error.message);
                console.error("error", error);
            } else {
                setProfile((prev) => ({ ...prev, ...profileData}));
            }
        } catch (err) {
                setProfileError("Error al actualizar el perfil.");
                console.error(err);            
            }
            setLoading(false);
    };

        // Eliminar perfil
    const deleteProfile = async (userId) => {
        setLoading(true);
        const { error } = await supabase
        .schema('users')
        .from("profiles")
        .delete()
        .eq("id", userId);

        if (error) {
        setProfileError(error.message);
        } else {
        setProfile(null);
        }
        setLoading(false);
    };

    return (
    <ProfileContext.Provider value={{ profile, profileError, loading, fetchProfile, updateProfile, deleteProfile, createProfile }}>
        {children}
    </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile debe usarse dentro de un ProfileProvider")
    }
    return context;
}
