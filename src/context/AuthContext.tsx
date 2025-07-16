import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
// Importing necessary React hooks and types

import { supabase } from "../supabase";
// Import Supabase client instance

import type { Session, User, Provider, UserIdentity } from "@supabase/supabase-js";
// Import Supabase types for strong typing

// Define the shape of the context value — what data and functions the auth context will expose
interface AuthContextType {
  user: User | null; // The authenticated user object, or null if not logged in
  loading: boolean;  // Flag to indicate if an auth-related async operation is running
  error: string;     // Any error messages from auth operations

  // Auth actions exposed to components:
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<void>;
  deleteMyAccount: () => Promise<void>;

  // OAuth linking/unlinking functions:
  linkProvider: (provider: Provider) => Promise<void>;
  unlinkProvider: (identity: UserIdentity) => Promise<void>;
}

// Create React Context with initial null value to be provided later
const AuthContext = createContext<AuthContextType | null>(null);
AuthContext.displayName = "AuthContext"; // For easier debugging in React DevTools

// Props for the AuthProvider component — just children nodes inside the provider
interface AuthProviderProps {
  children: ReactNode;
}

// The AuthProvider component that wraps app parts needing authentication data/functions
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // State holding the currently logged-in user (or null if none)
  const [user, setUser] = useState<User | null>(null);
  // State flag for any loading in progress (e.g., signing in, signing out)
  const [loading, setLoading] = useState(false);
  // State to keep the latest error message from auth calls
  const [error, setError] = useState("");

  // On component mount, fetch the current session and set up a listener for auth state changes
  useEffect(() => {
    // Async function to get session from Supabase and update user state
    const fetchSession = async () => {
      setLoading(true);
      setError("");
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        // If session exists, set user to session.user, else null
        setUser(session?.user ?? null);
      } catch (err: any) {
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen to auth state changes, updating user accordingly (e.g., login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Function to update the user's password securely via Supabase
  const updatePassword = async (newPassword: string): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      // Call Supabase auth updateUser with new password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err; // Rethrow for caller to handle if needed
    } finally {
      setLoading(false);
    }
  };

  // Function to delete the authenticated user's account by calling a backend API route
  const deleteMyAccount = async (): Promise<void> => {
  setLoading(true);
  setError("");
  try {
    // Get current session to access the access token for authorization header
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Build headers only if token exists to avoid 'Bearer undefined'
    const headers: HeadersInit = {};
    if (session?.access_token) {
      headers.authorization = `Bearer ${session.access_token}`;
    }

    // Call backend API to perform actual deletion logic (e.g., DB cleanup)
    await fetch("/api/delete-user", {
      method: "POST",
      headers,
    });
  } catch (err: any) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
  };

  // Function to sign in the user with email/password
  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      setUser(user); // Update user state immediately after successful login
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to sign up/register a new user with email/password and username metadata
  const signUp = async (email: string, password: string, username: string): Promise<any> => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username, // Store the username in user metadata on sign up
          },
        },
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to sign out the user, clear user state and redirect to home page
  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to refresh user data from Supabase after linking/unlinking identities
  const refreshUser = async (): Promise<void> => {
    const { data, error } = await supabase.auth.getUser();
    if (!error) setUser(data.user);
  };

  // Function to initiate OAuth login/link with a provider (e.g. "google", "github")
  // The provider param must be one of Supabase's accepted Provider types
  const linkProvider = async (provider: Provider): Promise<void> => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  // Function to unlink an OAuth identity from the user's account
  // Must provide the full UserIdentity object, not just an id string
  const unlinkProvider = async (identity: UserIdentity): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.unlinkIdentity(identity);
      if (error) throw error;
      await refreshUser(); // Update user state to reflect changes after unlinking
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Memoize the context value to optimize performance and prevent unnecessary renders
  const value = useMemo(
    () => ({
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
    }),
    [user, loading, error]
  );

  // Provide the context to child components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to safely consume the AuthContext, throws if used outside the provider
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
