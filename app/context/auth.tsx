// app/context/auth.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { User, Session } from "@supabase/supabase-js";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { updateUserProfile } from "@/utils/database/account";

// Define the shape of our auth context
type AuthContextData = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; data: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextData>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => { },
  isAuthenticated: false,
  signInWithGoogle: async () => { },
});

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth functions
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { error, data };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await GoogleSignin.signOut();
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.configure({
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
        webClientId:
          "274613334437-n8trjv5alrm6d0ugkjp6d613340db9ur.apps.googleusercontent.com",
        iosClientId:
          "274613334437-d8q8254f887up6cjus7phod83vfckhus.apps.googleusercontent.com",
      });

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo || !userInfo.data || !userInfo.data.idToken) {
        return;
      }
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: userInfo.data.idToken,
      });
      if (data?.user) {
        await updateUserProfile(
          data.user.id,
          data.user.user_metadata.full_name,
          data.user.user_metadata.avatar_url
        );
      }
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Sign in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Play services not available or outdated");
      } else {
        throw new Error("An unknown error occurred");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
