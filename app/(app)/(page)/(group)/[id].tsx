import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import GroupDetailPage from './groupDetail';

export default function GroupDetail() {
    // Get the id parameter from the URL
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    // Convert string id to number
    const groupId = id || '0';

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            {/* Pass the groupId to your existing GroupDetailPage component */}
            <GroupDetailPage groupId={groupId} />
        </>
    );
}