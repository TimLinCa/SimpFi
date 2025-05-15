import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/auth";
import { Inter_900Black, useFonts } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const Layout = () => {
  const [loaded, error] = useFonts({
    Inter_900Black,
  });
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);
  const queryClient = new QueryClient();
  if (!loaded && !error) {
    return null;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </GluestackUIProvider>
    </QueryClientProvider>
  );
};

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const isLoginPage = segments[1] === "login";
    if (!isAuthenticated && segments[1] == "signup") {
      // Redirect to login if not authenticated and in app group
      router.replace("/(auth)/signup");
    } else if (!isAuthenticated) {
      // Redirect to login if not authenticated and in app group
      router.replace("/(auth)/login");
    } else if (isAuthenticated && isLoginPage) {
      // Redirect to the app if authenticated and in auth group
      router.replace("/(app)/(mainPages)/summary");
    }
  }, [isAuthenticated, loading, segments]);

  return <Slot />;
}

export default Layout;
