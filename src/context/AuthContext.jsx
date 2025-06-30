import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';

import PropTypes from 'prop-types';

const AuthContext = createContext(null);
AuthContext.displayName = "AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ────────── session listener ────────── */
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: { session }, error } = await supabase
        .auth.getSession();
        
        if (error) throw error;
        setUser(session?.user || null);
      } catch (err) {
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase
    .auth
    .onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  /* ────────── helpers ────────── */
  const updatePassword = async (newPassword) => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
        setLoading(false);
    }
  };

  const deleteMyAccount = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();

      await fetch('/api/delete-user', {
        method : 'POST',
        headers: { authorization: `Bearer ${session.access_token}` }
      });

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
    };

  const signIn = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const { data: { user }, error } = await supabase
      .auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Immediately set the user after login
      setUser(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, username) => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username,
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };



  const signOut = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);

      // Redirect to home page after sign out
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Brings user from Supabase */
  const refreshUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error) setUser(data.user);
  };

  /** initialize OAuth */
  const linkProvider = async (provider /* "google" | "github" | … */) => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  /** identity already connected */
  const unlinkProvider = async (identityId) => {
    setLoading(true); setError("");
    try {
      const { error } = await supabase.auth.unlinkIdentity(identityId);
      if (error) throw error;
      await refreshUser();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const value = useMemo(() => ({
    user,
    loading,
    error,
    signIn,
    signOut,
    signUp,
    updatePassword,
    deleteMyAccount,
    linkProvider,
    unlinkProvider,
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthContext.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
