import { Stack } from 'expo-router'
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React from 'react'
import { View, StyleSheet } from 'react-native'
import FloatingButton from "@/components/ui/home/FloatingButton";
import { PortalProvider } from '@/hooks/portalContext';

const Layout = () => {
    return (
        <GluestackUIProvider>
            <PortalProvider>
                <View style={styles.container}>
                    <Stack screenOptions={{
                        headerShown: false
                    }}>
                    </Stack>
                </View>
            </PortalProvider>
        </GluestackUIProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        zIndex: 1000, // Ensure it's above other screens
    }
});

export default Layout