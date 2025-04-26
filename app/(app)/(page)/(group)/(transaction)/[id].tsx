import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import TransactionDetailPage from './transaction-detail';

export default function TransactionDetail() {
    // Get the id parameter from the URL
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            {/* Pass the groupId to your existing GroupDetailPage component */}
            <TransactionDetailPage transactionId={id} />
        </>
    );
}