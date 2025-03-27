import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);
ProfileContext.displayName = "ProfileContext";

export const ProfileProvider = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [profileError, setProfileError] = useState(null);

    const fetchProfile = async (userID) => {
        setLoading(true);
    
        try {
            if (!user) {
                setProfile(null);
                return;
            }
    
            const { data: profileData, error } = await supabase
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
        const { error: profileError } = await supabase
            .from("profiles")
            .insert([
            {
                id: userId,
                username: "",
                avatar_url: "",
                instrument: "",
                is_singer: false,
                is_composer: false,
                birthdate: null,
                gender: "",
                email: email,
            },
            ]);

        if (profileError) {
            throw new Error(profileError.message);
        }

        setLoading(false);
        return true; // O podrías devolver los datos si lo necesitas
        } catch (err) {
        setError(err.message);
        setLoading(false);
        return false;
        }
    };

        // Actualizar perfil
    const updateProfile = async (profileData) => {
        setLoading(true);
        setError("");

        try {
            const { error } = await supabase
            .from("profiles")
            .update({
                username: profileData.username,
                gender: profileData.gender,
                avatar_url: profileData.avatar_url,
                instrument: profileData.instrument,
                is_singer: profileData.is_singer,
                is_composer: profileData.is_composer,
                birthdate: profileData.birthdate
            })
            .eq("id", profileData.id);

            if (error) {
            setError(error.message);
            } else {
            setProfile((prev) => ({ ...prev, ...profileData}));
            }
        } catch (err) {
                setError("Error al actualizar el perfil.");
                console.error(err);            
            }
            setLoading(false);
    };

        // Eliminar perfil
    const deleteProfile = async (userId) => {
        setLoading(true);
        const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

        if (error) {
        setError(error.message);
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
