import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from 'expo-secure-store';
import * as Linking from "expo-linking";

const supabaseUrl = "https://yxvjolnvyxluspodryhl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dmpvbG52eXhsdXNwb2RyeWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2OTU4NzUsImV4cCI6MjA1ODI3MTg3NX0.WAjZBWHunFSWHkWZeZI6wV7E0SAHFIKi4C2Ezu_W_bU"
WebBrowser.maybeCompleteAuthSession(); // required for web only
const redirectTo = makeRedirectUri();

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export const performOAuth = async (provider: 'google' | 'apple' | 'facebook'): Promise<void> => {
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'yourapp://auth/callback',
    },
  });
};

