import { Stack } from 'expo-router'
import React from 'react'
import { View, Text } from 'react-native'

const Layout = () => {
    return (
        <Stack>
            <Stack.Screen name='login' options={{ headerShown: false }}></Stack.Screen>
            <Stack.Screen name='signup' options={{ headerShown: false }}></Stack.Screen>
        </Stack>
    )
}

export default Layout