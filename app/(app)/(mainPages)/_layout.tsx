import { Stack } from 'expo-router'
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React from 'react'
import { View, StyleSheet } from 'react-native'
import FloatingButton from "@/components/ui/home/FloatingButton";

const Layout = () => {
    return (
        <GluestackUIProvider>
            <View style={styles.container}>
                <Stack screenOptions={{
                    headerShown: false,
                    contentStyle: { flex: 1 }
                }}>
                    <Stack.Screen name='summary' />
                    <Stack.Screen name='personal' />
                    <Stack.Screen name='groupList' />
                    <Stack.Screen name='analyze' />
                    <Stack.Screen name='setting' />
                </Stack>
                {/* Floating Button positioned absolutely */}
                <FloatingButton />
            </View>
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